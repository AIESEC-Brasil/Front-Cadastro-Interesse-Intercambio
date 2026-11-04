import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { siglaProduto } from '@/helpers/dicionario';
import {
    formatarNome,
    removerMascaraData,
    removerMascaraTelefone,
    slugify
} from '@/helpers/formatter';
import apiOgxClient from '../service/clients/apiOgxClient';
import type {
    ApiErrorResponse,
    DadosPreCadastroB2C,
    DadosPlanilhaB2C,
    LeadPreCadastroB2CResponse,
} from '../types/formulario';
import type { OpcaoMetadados } from '../types/comum';
import type { useCamposFormulario } from './useCamposFormulario';
import type { useModaisFormulario } from './useModaisFormulario';
import { useDadosFormulario } from './useDadosFormulario';
import { validarData, validarEmail, validarTelefone, validarTexto } from '../utils/validates';

function formatarErrosDaApi(resposta: ApiErrorResponse): Record<string, string[]> {
    const nomesCampos: Record<string, string> = {
        nome: 'Nome',
        sobrenome: 'Sobrenome',
        dataNascimento: 'Data de Nascimento',
        telefone: 'Telefone',
        email: 'E-mail',
        produto: 'Programa',
        origem: 'Como conheceu a AIESEC',
        universidade: 'Universidade',
        comite: 'AIESEC mais próxima',
        autorizacao: 'Política de Privacidade',
    };
    const erros: Record<string, string[]> = {};

    for (const detalhe of resposta.error_details ?? []) {
        const partes = detalhe.loc.split(' -> ');
        const campo = partes[0] === 'body' ? partes[1] ?? partes[0] : partes[0];
        const nomeCampo = nomesCampos[campo] ?? campo;
        (erros[nomeCampo] ??= []).push(detalhe.msg);
    }

    if (Object.keys(erros).length === 0) {
        erros.Erro = [resposta.message ?? 'A API rejeitou a solicitação.'];
    }

    return erros;
}

interface UseDadosFormularioB2cProps {
    modals: ReturnType<typeof useModaisFormulario>;
    fields: ReturnType<typeof useCamposFormulario>;
}

interface ResultadoEnvioB2c {
    sucesso: boolean;
    erro?: string;
}

const normalizarTexto = (valor: string) =>
    valor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

const buscarOpcao = (opcoes: OpcaoMetadados[], valor: string) =>
    opcoes.find((opcao) => normalizarTexto(opcao.nome) === normalizarTexto(valor));

export function useDadosFormularioB2c({ modals, fields }: UseDadosFormularioB2cProps) {
    const dadosMetadados = useDadosFormulario({ modals });
    const searchParams = useSearchParams();

    const enviarPayload = async (
        payload: DadosPreCadastroB2C,
        exibirErros: boolean
    ): Promise<ResultadoEnvioB2c> => {
        try {
            const response = await apiOgxClient.post<LeadPreCadastroB2CResponse>(
                '/new-lead-ogx/cadastro-b2c',
                payload
            );
            if (response.data.status !== 'pré-cadastro b2c') {
                throw new Error('O backend retornou uma confirmação de pré-cadastro inválida.');
            }
            return { sucesso: true };
        } catch (error: unknown) {
            let mensagem: string;
            if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
                const respostaErro = error.response.data;
                const erros = formatarErrosDaApi(respostaErro);
                mensagem = Object.entries(erros)
                    .map(([campo, mensagens]) => `${campo}: ${mensagens.join(' ')}`)
                    .join(' ');

                if (exibirErros) {
                    if (error.response.status === 409) {
                        modals.setDataConflito(respostaErro);
                        modals.setModalConflitoAberta(true);
                    } else {
                        modals.setErrosJson(erros);
                        modals.setModalErroAberta(true);
                    }
                }
            } else {
                mensagem = error instanceof Error ? error.message : 'Falha de conexão ao enviar o lead.';
                if (exibirErros) {
                    modals.setTipoErroConexao(error instanceof Error ? 'bug' : 'conexao');
                    modals.setModalErroConexaoAberta(true);
                }
            }
            return { sucesso: false, erro: mensagem };
        }
    };

    const enviarDados = async (): Promise<boolean> => {
        const produtoId = fields.idProduto;
        const origemId = fields.idOrigem;
        const escritorioId = fields.idEscritorio;
        const semUniversidade = fields.marcarSemUniversidade;
        const tagCampanha = searchParams.get('utm_campaign');
        const comite = semUniversidade && escritorioId
            ? {
                id: escritorioId,
                nome: fields.escritorioSelecionado,
            }
            : undefined;

        const erros: Record<string, string[]> = {};
        if (!produtoId) erros.Programa = ['Selecione uma opção válida da lista.'];
        if (!origemId) erros['Como conheceu a AIESEC'] = ['Selecione uma opção válida da lista.'];
        if (semUniversidade && !comite) {
            erros['AIESEC mais próxima'] = ['Selecione uma opção válida da lista.'];
        }
        if (Object.keys(erros).length > 0) {
            modals.setErrosJson(erros);
            modals.setModalErroAberta(true);
            return false;
        }

        modals.setCarregandoEnvio(true);

        const produtoSigla = siglaProduto.find(
            (item) => item.nome.toLowerCase() === fields.produtoSelecionado.toLowerCase()
        )?.sigla;
        const idExpa = produtoSigla === 'gv'
            ? 7
            : produtoSigla === 'gte'
                ? 9
                : produtoSigla === 'gtast' || produtoSigla === 'gtalt'
                    ? 8
                    : 0;
        if (!idExpa) {
                modals.setErrosJson({
                    Programa: ['Não foi possível identificar o programa selecionado.'],
                });
                modals.setModalErroAberta(true);
                modals.setCarregandoEnvio(false);
                return false;
        }
        const payload: DadosPreCadastroB2C = {
            nome: fields.nome,
            sobrenome: fields.sobrenome,
            dataNascimento: removerMascaraData(fields.dataNascimento),
            email: fields.emails.map((item) => ({
                tipo: item.tipo,
                email: item.valor,
            })),
            telefone: fields.telefones.map((item) => ({
                tipo: item.tipo,
                numero: removerMascaraTelefone(item.valor),
            })),
            produto: {
                id: produtoId,
                titulo: fields.produtoSelecionado,
                id_expa: idExpa,
            },
            origem: {
                id: origemId,
                nome: fields.origemSelecionada,
            },
            autorizacao: 1,
            tag: (
                fields.tag.length > 0
                    ? fields.tag
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0)
                        .map(slugify)
                    : tagCampanha
                        ? [slugify(tagCampanha)]
                        : []
            ),
        };
        if (payload.tag?.length === 0) {
            delete payload.tag;
        }

        if (comite) {
            payload.comite = comite;
        } else if (!semUniversidade) {
            payload.universidade = fields.universidadeSelecionada;
        }

        try {
            return (await enviarPayload(payload, true)).sucesso;
        } finally {
            modals.setCarregandoEnvio(false);
        }
    };

    const enviarLeadPlanilha = async (dados: DadosPlanilhaB2C): Promise<ResultadoEnvioB2c> => {
        const erros: string[] = [];
        const nome = formatarNome(dados.nome.trim());
        const sobrenome = formatarNome(dados.sobrenome.trim());
        const nascimento = dados.nascimento.trim();
        const email = dados.email.trim();
        const telefone = dados.telefone.trim();

        erros.push(...validarTexto(nome, 'nome').filter(Boolean));
        erros.push(...validarTexto(sobrenome, 'sobrenome').filter(Boolean));
        erros.push(...validarData(nascimento).filter(Boolean));
        erros.push(...validarEmail([email]).filter(Boolean));
        erros.push(...validarTelefone([telefone]).filter(Boolean));

        const produtoSelecionado = buscarOpcao(dadosMetadados.listaProdutos, dados.produto);
        const origemSelecionada = buscarOpcao(dadosMetadados.listaOrigens, dados.como_conheceu);
        const comiteSelecionado = buscarOpcao(dadosMetadados.listaEscritorios, dados.comite);

        if (erros.length > 0) {
            return { sucesso: false, erro: erros.join(' ') };
        }

        if (!produtoSelecionado) erros.push(`Produto não encontrado nos metadados: "${dados.produto}".`);
        if (!origemSelecionada) erros.push(`Origem não encontrada nos metadados: "${dados.como_conheceu}".`);
        if (!comiteSelecionado) erros.push(`Comitê não encontrado nos metadados: "${dados.comite}".`);
        if (erros.length > 0 || !produtoSelecionado || !origemSelecionada || !comiteSelecionado) {
            return { sucesso: false, erro: erros.join(' ') };
        }

        const produtoSigla = siglaProduto.find(
            (item) => normalizarTexto(item.nome) === normalizarTexto(produtoSelecionado.nome)
        )?.sigla;
        const idExpa = produtoSigla === 'gv'
            ? 7
            : produtoSigla === 'gte'
                ? 9
                : produtoSigla === 'gtast' || produtoSigla === 'gtalt'
                    ? 8
                    : 0;
        if (!idExpa) {
            return {
                sucesso: false,
                erro: `Não foi possível identificar o programa "${produtoSelecionado.nome}".`,
            };
        }

        const tipoEmail = dadosMetadados.opcoesEmail.find(
            (opcao) => opcao.original.toLowerCase() === 'other'
        )?.original ?? dadosMetadados.opcoesEmail[0]?.original;
        const tipoTelefone = dadosMetadados.opcoesTelefone.find(
            (opcao) => opcao.original.toLowerCase() === 'other'
        )?.original ?? dadosMetadados.opcoesTelefone[0]?.original;
        if (!tipoEmail || !tipoTelefone) {
            return {
                sucesso: false,
                erro: 'As categorias válidas de e-mail ou telefone não estão disponíveis nos metadados.',
            };
        }

        const tags = dados.tag.trim()
            ? [slugify(dados.tag)]
            : searchParams.get('utm_campaign')
                ? [slugify(searchParams.get('utm_campaign')!)]
                : [];
        const payload: DadosPreCadastroB2C = {
            nome,
            sobrenome,
            dataNascimento: removerMascaraData(nascimento),
            email: [{ tipo: tipoEmail, email }],
            telefone: [{
                tipo: tipoTelefone,
                numero: removerMascaraTelefone(telefone),
            }],
            produto: {
                id: produtoSelecionado.id,
                titulo: produtoSelecionado.nome,
                id_expa: idExpa,
            },
            origem: {
                id: origemSelecionada.id,
                nome: origemSelecionada.nome,
            },
            comite: {
                id: comiteSelecionado.id,
                nome: comiteSelecionado.nome,
            },
            autorizacao: 1,
        };
        if (tags.length > 0) payload.tag = tags;

        return enviarPayload(payload, false);
    };

    return {
        ...dadosMetadados,
        tagCampanha: searchParams.get('utm_campaign'),
        enviarDados,
        enviarLeadPlanilha,
    };
}

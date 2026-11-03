import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { siglaProduto } from '@/helpers/dicionario';
import {
    removerMascaraData,
    removerMascaraTelefone,
    slugify
} from '@/helpers/formatter';
import apiOgxClient from '../service/clients/apiOgxClient';
import type {
    ApiErrorResponse,
    DadosPreCadastroB2C,
    LeadPreCadastroB2CResponse,
} from '../types/formulario';
import type { useCamposFormulario } from './useCamposFormulario';
import type { useModaisFormulario } from './useModaisFormulario';
import { useDadosFormulario } from './useDadosFormulario';

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

export function useDadosFormularioB2c({ modals, fields }: UseDadosFormularioB2cProps) {
    const dadosMetadados = useDadosFormulario({ modals });
    const searchParams = useSearchParams();

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
            const response = await apiOgxClient.post<LeadPreCadastroB2CResponse>(
                '/new-lead-ogx/cadastro-b2c',
                payload
            );
            if (response.data.status !== 'pré-cadastro b2c') {
                throw new Error('O backend retornou uma confirmação de pré-cadastro inválida.');
            }
            return true;
        } catch (error: unknown) {
            if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
                const respostaErro = error.response.data;
                if (error.response.status === 409) {
                    modals.setDataConflito(respostaErro);
                    modals.setModalConflitoAberta(true);
                } else {
                    modals.setErrosJson(formatarErrosDaApi(respostaErro));
                    modals.setModalErroAberta(true);
                }
            } else {
                modals.setTipoErroConexao(error instanceof Error ? 'bug' : 'conexao');
                modals.setModalErroConexaoAberta(true);
            }
            return false;
        } finally {
            modals.setCarregandoEnvio(false);
        }
    };

    return {
        ...dadosMetadados,
        tagCampanha: searchParams.get('utm_campaign'),
        enviarDados,
    };
}

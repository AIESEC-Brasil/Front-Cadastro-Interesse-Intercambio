import { useEffect, useState } from 'react';
import axios from 'axios';
import apiOgxClient from '../service/clients/apiOgxClient';
import { traduzirPalavras, removerMascaraData, removerMascaraTelefone } from '../helpers/formatter';
import type { OpcaoMetadados, OpcaoMetadadosApi, OpcaoTraduzida } from '../types/comum';
import type {
    ApiErrorResponse,
    DadosPreCadastro,
    DadosQualificacao,
    LeadPreCadastroResponse,
    RegistroDivisaoMercado,
    UniversidadesResponse,
} from '../types/formulario';
import type { useCamposFormulario } from './useCamposFormulario';
import type { useModaisFormulario } from './useModaisFormulario';

interface CampoMetadadoApi {
    external_id: string;
    name?: string;
    description?: string;
    config?: {
        settings?: {
            description?: string;
            options?: OpcaoMetadadosApi[];
        };
    };
}

interface MetadadosResponse {
    data: {
        fields: CampoMetadadoApi[];
        categorias_contato: {
            email: string[];
            telefone: string[];
        };
    };
    timestamp: string;
}

interface RespostaQualificacao {
    id: number;
    status: 'qualificação';
}

function formatarErrosDaApi(resposta: ApiErrorResponse): Record<string, string[]> {
    const nomesCampos: Record<string, string> = {
        nome: 'Nome',
        sobrenome: 'Sobrenome',
        senha: 'Senha',
        dataNascimento: 'Data de Nascimento',
        telefone: 'Telefone',
        email: 'E-mail',
        produto: 'Programa',
        origem: 'Como conheceu a AIESEC',
        universidade: 'Universidade',
        comite: 'AIESEC mais próxima',
        autorizacao: 'Política de Privacidade',
        curso: 'Curso',
        idiomas: 'Idiomas',
        semestreCurso: 'Semestre',
        areaAtuacao: 'Área de Atuação',
        nivelAtuacao: 'Nível de Atuação',
        curriculo: 'Currículo',
    };
    const erros: Record<string, string[]> = {};

    for (const detalhe of resposta.error_details ?? []) {
        const partes = detalhe.loc.split(' -> ');
        const campo = partes[0] === 'body' ? partes[1] ?? partes[0] : partes[0];
        const nomeCampo = nomesCampos[campo] ?? campo;
        (erros[nomeCampo] ??= []).push(detalhe.msg);
    }

    if (Object.keys(erros).length === 0) {
        const mensagem = resposta.message
            ?? (typeof resposta.error === 'string' ? resposta.error : undefined)
            ?? 'A API rejeitou a solicitação.';
        erros.Erro = [mensagem];
    }

    return erros;
}

const tituloTermoPadrao = 'Eu concordo com a coleta e uso dos meus dados conforme a Política de Privacidade *';

// ==========================================
// CACHE GLOBAL E GERENCIADOR DE REQUISIÇÃO
// ==========================================
let cacheGlobal = {
    listaProdutos: [] as OpcaoMetadados[],
    listaOrigens: [] as OpcaoMetadados[],
    listaMeio: [] as OpcaoMetadados[],
    listaUniversidades: [] as OpcaoMetadados[],
    listaEscritorios: [] as OpcaoMetadados[],
    listaIdiomas: [] as OpcaoMetadados[],
    listaSemestres: [] as OpcaoMetadados[],
    listaAreaAtuacao: [] as OpcaoMetadados[],
    listaNivelMercado: [] as OpcaoMetadados[],
    opcoesEmail: [] as OpcaoTraduzida[],
    opcoesTelefone: [] as OpcaoTraduzida[],
    tituloTermoLGPD: tituloTermoPadrao,
    descricaoTermoLGPD: '',
    tag: [] as string[],
    jaCarregou: false,
};

// Evita disparar requisições duplicadas enquanto uma já está pendente
let promessaEmAndamento: Promise<typeof cacheGlobal> | null = null;

interface UseDadosFormularioProps {
    modals: ReturnType<typeof useModaisFormulario>;
    fields?: ReturnType<typeof useCamposFormulario>;
    step?: number;
    rota?: string;
}

export function useDadosFormulario({ modals, fields, step, rota }: UseDadosFormularioProps) {
    const [carregandoMetadados, setCarregandoMetadados] = useState(!cacheGlobal.jaCarregou);
    const [erroMetadados, setErroMetadados] = useState(false);

    const [listaProdutos, setListaProdutos] = useState<OpcaoMetadados[]>(cacheGlobal.listaProdutos);
    const [listaOrigens, setListaOrigens] = useState<OpcaoMetadados[]>(cacheGlobal.listaOrigens);
    const [listaMeio, setListaMeio] = useState<OpcaoMetadados[]>(cacheGlobal.listaMeio);
    const [listaUniversidades, setListaUniversidades] = useState<OpcaoMetadados[]>(cacheGlobal.listaUniversidades);
    const [listaEscritorios, setListaEscritorios] = useState<OpcaoMetadados[]>(cacheGlobal.listaEscritorios);
    const [listaIdiomas, setListaIdiomas] = useState<OpcaoMetadados[]>(cacheGlobal.listaIdiomas);
    const [listaSemestres, setListaSemestres] = useState<OpcaoMetadados[]>(cacheGlobal.listaSemestres);
    const [listaAreaAtuacao, setListaAreaAtuacao] = useState<OpcaoMetadados[]>(cacheGlobal.listaAreaAtuacao);
    const [listaNivelMercado, setListaNivelMercado] = useState<OpcaoMetadados[]>(cacheGlobal.listaNivelMercado);
    const [opcoesEmail, setOpcoesEmail] = useState<OpcaoTraduzida[]>(cacheGlobal.opcoesEmail);
    const [opcoesTelefone, setOpcoesTelefone] = useState<OpcaoTraduzida[]>(cacheGlobal.opcoesTelefone);
    const [tituloTermoLGPD, setTituloTermoLGPD] = useState(cacheGlobal.tituloTermoLGPD);
    const [descricaoTermoLGPD, setDescricaoTermoLGPD] = useState(cacheGlobal.descricaoTermoLGPD);
    const [tag, setTag] = useState<string[]>(cacheGlobal.tag);

    const { setTipoErroConexao, setModalErroConexaoAberta } = modals;

    useEffect(() => {
        if (cacheGlobal.jaCarregou) {
            return;
        }

        let componenteMontado = true;

        const carregarDadosUnificados = async () => {
            if (promessaEmAndamento) {
                return promessaEmAndamento;
            }

            promessaEmAndamento = (async () => {
                // 1. Busca os metadados e universidades em paralelo
                const [respostaMetadados, respostaUniversidades] = await Promise.all([
                    apiOgxClient.get<MetadadosResponse>('/new-lead-ogx/metadados'),
                    apiOgxClient.get<UniversidadesResponse>('/divisao-mercado/universidades/metadados'),
                ]);

                const metadados = respostaMetadados.data.data.fields;

                const encontrarCampo = (identificador: string) => metadados.find((item) => item.external_id === identificador);
                const opcoesCampo = (campo?: CampoMetadadoApi) => campo?.config?.settings?.options ?? [];
                const textoOpcao = (opcao: OpcaoMetadadosApi) => opcao.text;

                const campoCategoriaContato = encontrarCampo('categoriaContato');
                const campoEscritorio = encontrarCampo('aiesec_proxima');
                const campoProduto = encontrarCampo('produto');
                const campoOrigem = encontrarCampo('origem');
                const campoMeio = encontrarCampo('meio');
                const campoLGPD = encontrarCampo('termo_privacidade');
                const campoIdiomas = encontrarCampo('idiomas');
                const campoSemestres = encontrarCampo('semestre_curso');
                const campoAreaAtuacao = encontrarCampo('area_atuacao');
                const campoNivelAtuacao = encontrarCampo('nivel_mercado');

                const opcoesCategoriaContato = opcoesCampo(campoCategoriaContato)
                    .filter((opcao) => {
                        const status = opcao.status?.toLowerCase();
                        return !status || status === 'active' || status === 'activate';
                    })
                    .map((opcao) => textoOpcao(opcao).trim().toLowerCase());

                const emailPermitidos = respostaMetadados.data.data.categorias_contato.email;
                const telefonePermitidos = respostaMetadados.data.data.categorias_contato.telefone;

                // 2. Traduz categorias imediatamente em paralelo com as mapeações
                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(opcoesCategoriaContato.filter((item) => emailPermitidos.includes(item))),
                    traduzirPalavras(opcoesCategoriaContato.filter((item) => telefonePermitidos.includes(item))),
                ]);

                const mapearOpcoes = (campo?: CampoMetadadoApi): OpcaoMetadados[] =>
                    opcoesCampo(campo).map((item) => ({
                        id: item.id,
                        nome: textoOpcao(item),
                    }));

                cacheGlobal = {
                    listaProdutos: mapearOpcoes(campoProduto),
                    listaOrigens: mapearOpcoes(campoOrigem),
                    listaMeio: mapearOpcoes(campoMeio),
                    listaUniversidades: respostaUniversidades.data.dados.map((uni: RegistroDivisaoMercado) => ({
                        id: uni.id ?? uni.nome,
                        nome: uni.nome,
                    })),
                    listaEscritorios: mapearOpcoes(campoEscritorio),
                    listaIdiomas: mapearOpcoes(campoIdiomas),
                    listaSemestres: mapearOpcoes(campoSemestres),
                    listaAreaAtuacao: mapearOpcoes(campoAreaAtuacao),
                    listaNivelMercado: mapearOpcoes(campoNivelAtuacao),
                    opcoesEmail: emailFormatado,
                    opcoesTelefone: telefoneFormatado,
                    tituloTermoLGPD: campoLGPD?.name || tituloTermoPadrao,
                    descricaoTermoLGPD: campoLGPD?.config?.settings?.description || campoLGPD?.description || '',
                    tag: [],
                    jaCarregou: true,
                };

                return cacheGlobal;
            })();

            return promessaEmAndamento;
        };

        carregarDadosUnificados()
            .then((dados) => {
                if (componenteMontado && dados) {
                    setTituloTermoLGPD(dados.tituloTermoLGPD);
                    setDescricaoTermoLGPD(dados.descricaoTermoLGPD);
                    setOpcoesEmail(dados.opcoesEmail);
                    setOpcoesTelefone(dados.opcoesTelefone);
                    setListaUniversidades(dados.listaUniversidades);
                    setListaEscritorios(dados.listaEscritorios);
                    setListaProdutos(dados.listaProdutos);
                    setListaOrigens(dados.listaOrigens);
                    setListaMeio(dados.listaMeio);
                    setListaIdiomas(dados.listaIdiomas);
                    setListaSemestres(dados.listaSemestres);
                    setListaAreaAtuacao(dados.listaAreaAtuacao);
                    setListaNivelMercado(dados.listaNivelMercado);
                    setTag(dados.tag);
                }
            })
            .catch(() => {
                if (componenteMontado) {
                    setErroMetadados(true);
                    setTipoErroConexao('conexao');
                    setModalErroConexaoAberta(true);
                }
            })
            .finally(() => {
                promessaEmAndamento = null;
                if (componenteMontado) setCarregandoMetadados(false);
            });

        return () => {
            componenteMontado = false;
        };
    }, [setModalErroConexaoAberta, setTipoErroConexao]);

    const enviarDados = async () => {
        if (!fields) {
            console.warn("Tentativa de envio chamada sem o objeto 'fields' preenchido.");
            return null;
        }
        modals.setCarregandoEnvio(true);

        const nome = fields.nome;
        const sobrenome = fields.sobrenome;
        const senha = fields.senha;
        const dataNascimento = removerMascaraData(fields.dataNascimento);
        const email = fields.emails.map((item) => ({
            tipo: item.tipo,
            email: item.valor,
        }));
        const telefone = fields.telefones.map((item) => ({
            tipo: item.tipo,
            numero: removerMascaraTelefone(item.valor),
        }));

        const comite = {
            id: fields.idEscritorio,
            nome: fields.escritorioSelecionado,
        };

        const origem = {
            id: fields.idOrigem,
            nome: fields.origemSelecionada,
        };

        const meio = {
            id: fields.idMeio,
            nome: fields.meioSelecionado,
        };

        const produto = {
            id: fields.idProduto,
            titulo: fields.produtoSelecionado,
            id_expa: {
                'voluntario-global': 7,
                'talento-global': 8,
                'professor-global': 9,
            }[rota ?? ''] ?? 0,
        };

        const tagForm = fields.tag;
        let resultado = null;

        if (step === 1) {
            const jsonPreCadastro: DadosPreCadastro = {
                nome,
                sobrenome,
                senha,
                dataNascimento,
                email,
                telefone,
                produto,
                origem,
                autorizacao: 1,
                tag: tagForm
            };

            if (fields.marcarSemUniversidade) {
                jsonPreCadastro.comite = comite;
            } else {
                jsonPreCadastro.universidade = fields.universidadeSelecionada;
            }

            if (fields.meioSelecionado){
                jsonPreCadastro.meio = meio;
            }

            try {
                const response = await apiOgxClient.post<LeadPreCadastroResponse>(
                    '/new-lead-ogx/cadastro',
                    jsonPreCadastro
                );
                if (!Number.isInteger(response.data.id) || response.data.id <= 0) {
                    throw new Error('O backend não retornou um identificador válido para o lead.');
                }
                fields.setItemId(response.data.id);
                resultado = true;
            } catch (error: unknown) {
                if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
                    const respostaErro = error.response.data;
                    if (error.response.status === 409) {
                        modals?.setDataConflito(respostaErro);
                        modals?.setModalConflitoAberta(true);
                    } else {
                        modals?.setErrosJson(formatarErrosDaApi(respostaErro));
                        modals?.setModalErroAberta(true);
                    }
                } else {
                    modals?.setTipoErroConexao(error instanceof Error ? 'bug' : 'conexao');
                    modals?.setModalErroConexaoAberta(true);
                }
            } finally {
                modals?.setCarregandoEnvio(false);
            }
            return resultado;

        } else if (step === 2) {
            const jsonQualificacao: DadosQualificacao = {
                id: fields.itemId
            };

            if (fields.curso) {
                jsonQualificacao.curso = fields.curso;
            }

            if (fields.anexoPdf) {
                jsonQualificacao.curriculo = {
                    fileName: fields.anexoPdf.name,
                    base64: fields.anexoBase64
                };
            }

            if (fields.idiomasSelecionados?.length > 0) {
                jsonQualificacao.idiomas = fields.idiomasSelecionados.map((nome: string, index: number) => ({
                    id: fields.idIdiomas[index],
                    nome
                }));
            }

            if (fields.semestreSelecionado) {
                jsonQualificacao.semestreCurso = {
                    id: fields.idSemestre,
                    nome: fields.semestreSelecionado
                };
            }

            if (fields.areaAtuacaoSelecionada) {
                jsonQualificacao.areaAtuacao = {
                    id: fields.idAreaAtuacao,
                    nome: fields.areaAtuacaoSelecionada
                };
            }

            if (fields.nivelAtuacaoSelecionado) {
                jsonQualificacao.nivelAtuacao = {
                    id: fields.idNivelAtuacao,
                    nome: fields.nivelAtuacaoSelecionado
                };
            }

            try {
                const response = await apiOgxClient.put<RespostaQualificacao>(
                    '/new-lead-ogx/cadastro',
                    jsonQualificacao
                );
                resultado = response.data.id === fields.itemId
                    && response.data.status === 'qualificação';
                if (!resultado) {
                    throw new Error('O backend retornou uma confirmação de qualificação inválida.');
                }
            } catch (error: unknown) {
                if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
                    const respostaErro = error.response.data;
                    if (error.response.status === 409) {
                        modals?.setDataConflito(respostaErro);
                        modals?.setModalConflitoAberta(true);
                    } else {
                        modals?.setErrosJson(formatarErrosDaApi(respostaErro));
                        modals?.setModalErroAberta(true);
                    }
                } else {
                    modals?.setTipoErroConexao(error instanceof Error ? 'bug' : 'conexao');
                    modals?.setModalErroConexaoAberta(true);
                }
            } finally {
                modals?.setCarregandoEnvio(false);
            }
            return resultado;
        }
    };

    return {
        carregandoMetadados,
        erroMetadados,
        listaProdutos,
        listaOrigens,
        listaMeio,
        listaUniversidades,
        listaEscritorios,
        listaIdiomas,
        listaSemestres,
        listaAreaAtuacao,
        listaNivelMercado,
        opcoesEmail,
        opcoesTelefone,
        tituloTermoLGPD,
        descricaoTermoLGPD,
        tag,
        enviarDados
    };
}
import { useEffect, useState } from 'react';

import axios from 'axios';

import apiOgxClient from '../service/clients/apiOgxClient';

import { traduzirPalavras } from '../helpers/formatter';

import { removerMascaraData, removerMascaraTelefone } from '../helpers/formatter';

import type {
    OpcaoMetadados,
    OpcaoMetadadosApi,
    OpcaoTraduzida,
} from '../types/comum';

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


/**
 * Interface que define a estrutura padrão para os itens de metadados (listas suspensas, opções, etc.).
 */
const tituloTermoPadrao = 'Eu concordo com a coleta e uso dos meus dados conforme a Política de Privacidade *';


// ==========================================
// CACHE GLOBAL EM MEMÓRIA (SINGLETON DO MÓDULO)
// ==========================================
/**
 * Objeto de cache global para armazenar metadados e opções estáticas/dinâmicas,
 * evitando requisições HTTP repetidas ao carregar o componente múltiplas vezes.
 */
let cacheGlobal: {
    listaProdutos: OpcaoMetadados[];
    listaOrigens: OpcaoMetadados[];
    listaMeio: OpcaoMetadados[];
    listaUniversidades: OpcaoMetadados[];
    listaEscritorios: OpcaoMetadados[];
    listaIdiomas: OpcaoMetadados[];
    listaSemestres: OpcaoMetadados[];
    listaAreaAtuacao: OpcaoMetadados[];
    listaNivelMercado: OpcaoMetadados[];
    opcoesEmail: OpcaoTraduzida[];
    opcoesTelefone: OpcaoTraduzida[];
    tituloTermoLGPD: string;
    descricaoTermoLGPD: string;
    tag: string[];
    jaCarregou: boolean;
} = {
    listaProdutos: [],
    listaOrigens: [],
    listaMeio: [],
    listaUniversidades: [],
    listaEscritorios: [],
    listaIdiomas: [],
    listaSemestres: [],
    listaAreaAtuacao: [],
    listaNivelMercado: [],
    opcoesEmail: [],
    opcoesTelefone: [],
    tituloTermoLGPD: tituloTermoPadrao,
    descricaoTermoLGPD: '',
    tag: [],
    jaCarregou: false,
};


interface UseDadosFormularioProps {
    modals: ReturnType<typeof useModaisFormulario>;
    fields?: ReturnType<typeof useCamposFormulario>;
    step?: number;
    rota?: string;
}


/**
 * Hook customizado responsável por gerenciar o carregamento de metadados, 
 * o tratamento de formulários (etapas 1 e 2) e o envio de dados para a API do sistema.
 */
export function useDadosFormulario({ modals, fields, step, rota }: UseDadosFormularioProps) {
    // Inicializa com o cache caso já tenha sido carregado antes
    const [carregandoMetadados, setCarregandoMetadados] = useState(!cacheGlobal.jaCarregou);
    const [erroMetadados, setErroMetadados] = useState(false);


    const [listaProdutos, setListaProdutos] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaProdutos);
    const [listaOrigens, setListaOrigens] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaOrigens);
    const [listaMeio, setListaMeio] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaMeio);
    const [listaUniversidades, setListaUniversidades] = useState<OpcaoMetadados[]>(cacheGlobal.listaUniversidades);
    const [listaEscritorios, setListaEscritorios] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaEscritorios);
    const [listaIdiomas, setListaIdiomas] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaIdiomas);
    const [listaSemestres, setListaSemestres] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaSemestres);
    const [listaAreaAtuacao, setListaAreaAtuacao] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaAreaAtuacao);
    const [listaNivelMercado, setListaNivelMercado] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaNivelMercado);
    const [opcoesEmail, setOpcoesEmail] = useState<OpcaoTraduzida[]>(cacheGlobal.opcoesEmail);
    const [opcoesTelefone, setOpcoesTelefone] = useState<OpcaoTraduzida[]>(cacheGlobal.opcoesTelefone);
    const [tituloTermoLGPD, setTituloTermoLGPD] = useState(cacheGlobal.tituloTermoLGPD);
    const [descricaoTermoLGPD, setDescricaoTermoLGPD] = useState(cacheGlobal.descricaoTermoLGPD);
    const [tag, setTag] = useState<string[]>(cacheGlobal.tag);
    const setTipoErroConexao = modals.setTipoErroConexao;
    const setModalErroConexaoAberta = modals.setModalErroConexaoAberta; 


    /**
     * Efeito responsável por buscar os metadados do backend e as universidades na montagem do componente,
     * utilizando o cache global caso já tenham sido obtidos anteriormente.
     */
    useEffect(() => {
        if (cacheGlobal.jaCarregou) {
            return;
        }


        let componenteMontado = true;


        const carregarDados = async () => {
            try {
                const [respostaMetadados, respostaUniversidades] = await Promise.all([
                    apiOgxClient.get<MetadadosResponse>('/new-lead-ogx/metadados'),
                    apiOgxClient.get<UniversidadesResponse>('/divisao-mercado/universidades/metadados'),
                ]);


                const metadados = respostaMetadados.data.data.fields;


                if (!componenteMontado) return;


                const encontrarCampo = (identificador: string): CampoMetadadoApi | undefined =>
                    metadados.find((item) => item.external_id === identificador);
                const opcoesCampo = (campo: CampoMetadadoApi | undefined): OpcaoMetadadosApi[] =>
                    campo?.config?.settings?.options ?? [];
                const textoOpcao = (opcao: OpcaoMetadadosApi): string =>
                    opcao.text;


                const ordenarOpcoes = (opcoes: OpcaoMetadadosApi[]) =>
                    [...opcoes].sort((a, b) =>
                        textoOpcao(a).toLowerCase() === 'other'
                            ? -1
                            : textoOpcao(b).toLowerCase() === 'other' ? 1 : 0
                    );


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


                const opcoesCategoriaContato = ordenarOpcoes(
                    opcoesCampo(campoCategoriaContato)
                        .filter((opcao) => {
                            const status = opcao.status?.toLowerCase();
                            return !status || status === 'active' || status === 'activate';
                        })
                        .map((opcao) => ({
                            ...opcao,
                            text: textoOpcao(opcao).trim().toLowerCase(),
                        })),
                );
                const filtrarCategorias = (permitidas: string[]) =>
                    opcoesCategoriaContato.filter((opcao) =>
                        permitidas.includes(textoOpcao(opcao)),
                    );
                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(
                        filtrarCategorias(respostaMetadados.data.data.categorias_contato.email)
                            .map(textoOpcao),
                    ),
                    traduzirPalavras(
                        filtrarCategorias(respostaMetadados.data.data.categorias_contato.telefone)
                            .map(textoOpcao),
                    ),
                ]);

                const novaTag: string[] = [];
                const novoTitulo = campoLGPD?.name || tituloTermoPadrao;
                const novaDescricao = campoLGPD?.config?.settings?.description || campoLGPD?.description || '';
                const novasUniversidades: OpcaoMetadados[] = respostaUniversidades.data.dados.map(
                    (universidade: RegistroDivisaoMercado) => ({
                        id: universidade.id ?? universidade.nome,
                        nome: universidade.nome,
                    })
                );
                const mapearOpcoes = (campo: CampoMetadadoApi | undefined): OpcaoMetadados[] =>
                    opcoesCampo(campo).map((item) => ({
                        id: item.id,
                        nome: textoOpcao(item),
                    }));
                const novosEscritorios = mapearOpcoes(campoEscritorio);
                const novosProdutos = mapearOpcoes(campoProduto);
                const novasOrigens = mapearOpcoes(campoOrigem);
                const novosMeios = mapearOpcoes(campoMeio);
                const novosIdiomas = mapearOpcoes(campoIdiomas);
                const novosSemestres = mapearOpcoes(campoSemestres);
                const novasAreaAtuacao = mapearOpcoes(campoAreaAtuacao);
                const novosNivelAtuacao = mapearOpcoes(campoNivelAtuacao);


                cacheGlobal = {
                    listaProdutos: novosProdutos,
                    listaOrigens: novasOrigens,
                    listaMeio: novosMeios,
                    listaUniversidades: novasUniversidades,
                    listaEscritorios: novosEscritorios,
                    listaIdiomas: novosIdiomas,
                    listaSemestres: novosSemestres,
                    listaAreaAtuacao: novasAreaAtuacao,
                    listaNivelMercado: novosNivelAtuacao,
                    opcoesEmail: emailFormatado,
                    opcoesTelefone: telefoneFormatado,
                    tituloTermoLGPD: novoTitulo,
                    descricaoTermoLGPD: novaDescricao,
                    tag: novaTag,
                    jaCarregou: true,
                };


                if (componenteMontado) {
                    setTituloTermoLGPD(novoTitulo);
                    setDescricaoTermoLGPD(novaDescricao);
                    setOpcoesEmail(emailFormatado);
                    setOpcoesTelefone(telefoneFormatado);
                    setListaUniversidades(novasUniversidades);
                    setListaEscritorios(novosEscritorios);
                    setListaProdutos(novosProdutos);
                    setListaOrigens(novasOrigens);
                    setListaMeio(novosMeios);
                    setListaIdiomas(novosIdiomas);
                    setListaSemestres(novosSemestres);
                    setListaAreaAtuacao(novasAreaAtuacao);
                    setListaNivelMercado(novosNivelAtuacao);
                    setTag(novaTag);
                }
            } catch {
                if (componenteMontado) {
                    setErroMetadados(true);
                    setTipoErroConexao('conexao');
                    setModalErroConexaoAberta(true);
                }
            } finally {
                if (componenteMontado) setCarregandoMetadados(false);
            }
        };


        carregarDados();


        return () => {
            componenteMontado = false;
        };
    }, [setModalErroConexaoAberta, setTipoErroConexao]);


    /**
     * Função responsável por processar e enviar os dados do formulário para a API,
     * diferenciando o comportamento entre a Etapa 1 (Pré-cadastro) e a Etapa 2 (Qualificação).
     */
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


        const tag = fields.tag;


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
                tag
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
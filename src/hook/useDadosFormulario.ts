import { useEffect, useState } from 'react';
import apiOgxClient from '../service/clients/apiOgxClient';
import { traduzirPalavras } from '../helpers/formatter';
import { removerMascaraData,removerMascaraTelefone } from '../helpers/formatter';
import type { OpcaoMetadados } from '../types/comum';

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
    listaUniversidades: OpcaoMetadados[];
    listaEscritorios: OpcaoMetadados[];
    listaIdiomas: OpcaoMetadados[];
    listaSemestres: OpcaoMetadados[];
    listaAreaAtuacao: OpcaoMetadados[];
    listaNivelMercado: OpcaoMetadados[];
    opcoesEmail: any[];
    opcoesTelefone: any[];
    tituloTermoLGPD: string;
    descricaoTermoLGPD: string;
    jaCarregou: boolean;
} = {
    listaProdutos: [],
    listaOrigens: [],
    listaUniversidades: [],
    listaEscritorios: [],
    listaIdiomas: [],
    listaSemestres: [],
    listaAreaAtuacao:[],
    listaNivelMercado:[],
    opcoesEmail: [],
    opcoesTelefone: [],
    tituloTermoLGPD: tituloTermoPadrao,
    descricaoTermoLGPD: '',
    jaCarregou: false,
};

/**
 * Hook customizado responsável por gerenciar o carregamento de metadados, 
 * o tratamento de formulários (etapas 1 e 2) e o envio de dados para a API do sistema.
 * 
 * @param modals - Objeto contendo os estados e funções de controle dos modais da aplicação.
 * @param fields - Objeto contendo os valores atuais dos campos do formulário preenchidos pelo usuário.
 * @param step - Número da etapa atual do formulário (ex: 1 para pré-cadastro, 2 para qualificação).
 * @param rota - String indicando a rota/produto atual (ex: 'voluntario-global', 'talento-global').
 * @returns Um objeto contendo os estados carregados (listas, termos LGPD, flags de carregamento) e a função de envio.
 */
export function useDadosFormulario(modals:any, fields:any,step:number,rota:string) {
    // Inicializa com o cache caso já tenha sido carregado antes
    const [carregandoMetadados, setCarregandoMetadados] = useState(!cacheGlobal.jaCarregou);
    const [erroMetadados, setErroMetadados] = useState(false);

    const [listaProdutos, setListaProdutos] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaProdutos);
    const [listaOrigens, setListaOrigens] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaOrigens);
    const [listaUniversidades, setListaUniversidades] = useState<any[]>(cacheGlobal.listaUniversidades);
    const [listaEscritorios, setListaEscritorios] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaEscritorios);
    const [listaIdiomas, setListaIdiomas] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaIdiomas);
    const [listaSemestres,setListaSemestres] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaSemestres);
    const [listaAreaAtuacao,setListaAreaAtuacao] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaAreaAtuacao);
    const [listaNivelMercado,setListaNivelMercado] = useState<Array<{ id: number | string; nome: string }>>(cacheGlobal.listaNivelMercado);
    const [opcoesEmail, setOpcoesEmail] = useState<any[]>(cacheGlobal.opcoesEmail);
    const [opcoesTelefone, setOpcoesTelefone] = useState<any[]>(cacheGlobal.opcoesTelefone);
    const [tituloTermoLGPD, setTituloTermoLGPD] = useState(cacheGlobal.tituloTermoLGPD);
    const [descricaoTermoLGPD, setDescricaoTermoLGPD] = useState(cacheGlobal.descricaoTermoLGPD);

    /**
     * Efeito responsável por buscar os metadados do backend e as universidades na montagem do componente,
     * utilizando o cache global caso já tenham sido obtidos anteriormente.
     */
    useEffect(() => {
        // Se já carregou anteriormente, não faz a requisição de novo
        if (cacheGlobal.jaCarregou) {
            setCarregandoMetadados(false);
            return;
        }

        let componenteMontado = true;

        /**
         * Função assíncrona interna para requisição e processamento dos dados de metadados e universidades.
         */
        const carregarDados = async () => {
            setCarregandoMetadados(true);
            setErroMetadados(false);

            try {
                const [respostaMetadados, respostaUniversidades] = await Promise.all([
                    apiOgxClient.get('/new-lead-ogx/metadados'),
                    apiOgxClient.get('/divisao-mercado/universidades'),
                ]);

                const metadados = Array.isArray(respostaMetadados)
                    ? respostaMetadados
                    : respostaMetadados?.data;

                if (!componenteMontado || !Array.isArray(metadados)) return;

                /**
                 * Localiza um campo específico dentro do array de metadados pelo seu identificador externo.
                 */
                const encontrarCampo = (identificador: string) =>
                    metadados.find((item: any) => item.external_id === identificador);

                /**
                 * Ordena as opções priorizando o item 'other' para o topo da lista.
                 */
                const ordenarOpcoes = (opcoes: any[]) => [...opcoes].sort((a, b) =>
                    a.toLowerCase() === 'other' ? -1 : b.toLowerCase() === 'other' ? 1 : 0
                );

                const campoEmail = encontrarCampo('email');
                const campoTelefone = encontrarCampo('telefone');
                const campoEscritorio = encontrarCampo('aiesec-mais-proxima');
                const campoProduto = encontrarCampo('produto');
                const campoOrigem = encontrarCampo('tag-origem-2');
                const campoLGPD = encontrarCampo('eu-concordo-com-a-coleta-e-uso-dos-meus-dados-conforme-');
                const campoIdiomas = encontrarCampo('possui-outro-idioma');
                const campoSemestres = encontrarCampo('qual-semestre-do-curso');
                const campoAreaAtuacao = encontrarCampo('qual-sua-area-de-atuacao');
                const campoNivelAtuacao = encontrarCampo('qual-seu-nivel-de-atuacao');
                
                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(campoEmail?.options ? ordenarOpcoes(campoEmail.options) : []),
                    traduzirPalavras(campoTelefone?.options ? ordenarOpcoes(campoTelefone.options) : []),
                ]) ;

                const novoTitulo = campoLGPD?.name || tituloTermoPadrao;
                const novaDescricao = campoLGPD?.description || '';
                const novasUniversidades = respostaUniversidades?.data?.universidades || [];
                const novosEscritorios = (campoEscritorio?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novosProdutos = (campoProduto?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novasOrigens = (campoOrigem?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novosIdiomas = (campoIdiomas?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novosSemestres = (campoSemestres?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novasAreaAtuacao = (campoAreaAtuacao?.options || []).map((item:any) => ({ id:item.id,nome:item.text }));
                const novosNivelAtuacao = (campoNivelAtuacao?.options || []).map((item:any) => ({ id:item.id,nome:item.text }));

                // Atualiza o cache global
                cacheGlobal = {
                    listaProdutos: novosProdutos,
                    listaOrigens: novasOrigens,
                    listaUniversidades: novasUniversidades,
                    listaEscritorios: novosEscritorios,
                    listaIdiomas: novosIdiomas,
                    listaSemestres: novosSemestres,
                    listaAreaAtuacao: novasAreaAtuacao,
                    listaNivelMercado:novosNivelAtuacao,
                    opcoesEmail: emailFormatado,
                    opcoesTelefone: telefoneFormatado,
                    tituloTermoLGPD: novoTitulo,
                    descricaoTermoLGPD: novaDescricao,
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
                    setListaIdiomas(novosIdiomas);
                    setListaSemestres(novosSemestres);
                    setListaAreaAtuacao(novasAreaAtuacao);
                    setListaNivelMercado(novosNivelAtuacao);
                }
            } catch {
                if (componenteMontado) {
                    modals.setTipoErroConexao('conexao');
                    modals.setModalErroConexaoAberta(true);
                }
            } finally {
                if (componenteMontado) setCarregandoMetadados(false);
            }
        };
        
        carregarDados();

        return () => {
            componenteMontado = false;
        };
    }, []);

    const nome = fields.nome;
    const sobrenome = fields.sobrenome;
    const senha = fields.senha;
    const dataNascimento = removerMascaraData(fields.dataNascimento);
    const email = fields.emails.map((e: any) => ({ tipo: e.tipo, email: e.valor }));
    const telefone = fields.telefones.map((e: any) => ({ tipo: e.tipo, numero: removerMascaraTelefone(e.valor) }));
    
    const comite = {
        id: fields.idEscritorio,
        nome: fields.escritorioSelecionado,
    };
    
    const universidade = {
        id: fields.idUniversidade,
        nome: fields.universidadeSelecionada,
    };
    
    const origem = {
        id: fields.idOrigem,
        nome: fields.origemSelecionada,
    };
    
    const produto: any = {
        id_podio: fields.idProduto,
        titulo: fields.produtoSelecionado
    };

    if (rota === 'voluntario-global') {
        produto.id_expa = 7;
    } else if (rota === 'talento-global') {
        produto.id_expa = 8;
    } else if (rota === 'professor-global') {
        produto.id_expa = 9;
    }

    /**
     * Função responsável por processar e enviar os dados do formulário para a API,
     * diferenciando o comportamento entre a Etapa 1 (Pré-cadastro) e a Etapa 2 (Qualificação).
     */
    const enviarDados = async () => {
        modals.setCarregandoEnvio(true);
        let resultado = null;
        if (step === 1) {
            const jsonPreCadastro: any = {
                nome,
                sobrenome,
                senha,
                dataNascimento,
                email,
                telefone,
                produto,
                origem,
                autorizacao: 1
            };
            
            if (fields.marcarSemUniversidade) {
                jsonPreCadastro.comite = comite;
            } else {
                jsonPreCadastro.universidade = universidade;
            }
           
            try {
                const response:any = await apiOgxClient.post('/new-lead-ogx/cadastro', jsonPreCadastro);
                // 💡 Ajuste para capturar o item_id retornado pelo backend (ex: response.data.item_id ou ajuste conforme sua API)
                if (response?.data?.item_id) {
                    fields.setItemId(response.data.item_id);
                }
                resultado = response?.sucesso;
            } catch (error:any) {
                const dadosErro = error.response?.data?.data;
                if (error.response.status === 409){
                    const conteudoModal = dadosErro.erro 
                    ? dadosErro.erro.replace("EXPA", "").trim() 
                    : dadosErro;
                    modals.setDataConflito(conteudoModal)
                    modals.setModalConflitoAberta(true)
                } else {
                    modals.setTipoErroConexao('bug');
                    modals.setModalErroConexaoAberta(true);
                }
                console.log('Erro ao enviar dados:', dadosErro);
            } finally {
                modals.setCarregandoEnvio(false);
            }
            return resultado
            
        } else if (step === 2) {
            const jsonQualificacao: any = {
                item_id : fields.itemId
            };

            if (fields.curso){
                jsonQualificacao.curso = fields.curso;
            }

            if (fields.anexoPdf) {
                jsonQualificacao.curriculo = {
                    nome: fields.anexoPdf.name,
                    base64: fields.anexoBase64
                };
            }

            if (fields.idiomasSelecionados.length > 0){
                jsonQualificacao.idiomas = fields.idiomasSelecionados.map((nome:string,index:number) => ({
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

            if (fields.areaAtuacaoSelecionada){
                jsonQualificacao.areaAtuacao = {
                    id: fields.idAreaAtuacao,
                    nome: fields.areaAtuacaoSelecionada
                }
            }

            if (fields.nivelAtuacaoSelecionado){
                jsonQualificacao.nivelAtuacao = {
                    id: fields.idNivelAtuacao,
                    nome: fields.nivelAtuacaoSelecionado
                }
            }

            
            try {
                const response:any = await apiOgxClient.put('/new-lead-ogx/cadastro', jsonQualificacao);
                resultado = response?.sucesso;
            } catch (error:any) {
                const dadosErro = error.response?.data?.data;
                if (error.response.status === 409){
                    const conteudoModal = dadosErro.erro 
                    ? dadosErro.erro.replace("EXPA", "").trim() 
                    : dadosErro;
                    modals.setDataConflito(conteudoModal)
                    modals.setModalConflitoAberta(true)
                } else {
                    modals.setTipoErroConexao('bug');
                    modals.setModalErroConexaoAberta(true);
                }
                console.log('Erro ao enviar dados:', dadosErro);
            } finally {
                modals.setCarregandoEnvio(false);
            }
            return resultado;
        }
    };

    return {
        carregandoMetadados,
        erroMetadados,
        listaProdutos,
        listaOrigens,
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
        enviarDados
    };
}
import { useEffect, useState } from 'react';
import apiOgxClient from '../service/clients/apiOgxClient';
import { traduzirPalavras } from '../helpers/formatter';

interface OpcaoFormulario {
    id: number | string;
    nome: string;
}

const tituloTermoPadrao = 'Eu concordo com a coleta e uso dos meus dados conforme a Política de Privacidade *';

// ==========================================
// CACHE GLOBAL EM MEMÓRIA (SINGLETON DO MÓDULO)
// ==========================================
let cacheGlobal: {
    listaProdutos: OpcaoFormulario[];
    listaOrigens: OpcaoFormulario[];
    listaUniversidades: any[];
    listaEscritorios: OpcaoFormulario[];
    listaIdiomas: OpcaoFormulario[];
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
    opcoesEmail: [],
    opcoesTelefone: [],
    tituloTermoLGPD: tituloTermoPadrao,
    descricaoTermoLGPD: '',
    jaCarregou: false,
};

export function useDadosFormulario() {
    // Inicializa com o cache caso já tenha sido carregado antes
    const [carregandoMetadados, setCarregandoMetadados] = useState(!cacheGlobal.jaCarregou);
    const [erroMetadados, setErroMetadados] = useState(false);

    const [listaProdutos, setListaProdutos] = useState<OpcaoFormulario[]>(cacheGlobal.listaProdutos);
    const [listaOrigens, setListaOrigens] = useState<OpcaoFormulario[]>(cacheGlobal.listaOrigens);
    const [listaUniversidades, setListaUniversidades] = useState<any[]>(cacheGlobal.listaUniversidades);
    const [listaEscritorios, setListaEscritorios] = useState<OpcaoFormulario[]>(cacheGlobal.listaEscritorios);
    const [listaIdiomas, setListaIdiomas] = useState<OpcaoFormulario[]>(cacheGlobal.listaIdiomas);
    const [opcoesEmail, setOpcoesEmail] = useState<any[]>(cacheGlobal.opcoesEmail);
    const [opcoesTelefone, setOpcoesTelefone] = useState<any[]>(cacheGlobal.opcoesTelefone);
    const [tituloTermoLGPD, setTituloTermoLGPD] = useState(cacheGlobal.tituloTermoLGPD);
    const [descricaoTermoLGPD, setDescricaoTermoLGPD] = useState(cacheGlobal.descricaoTermoLGPD);

    useEffect(() => {
        // Se já carregou anteriormente, não faz a requisição de novo
        if (cacheGlobal.jaCarregou) {
            setCarregandoMetadados(false);
            return;
        }

        let componenteMontado = true;

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

                const encontrarCampo = (identificador: string) =>
                    metadados.find((item: any) => item.external_id === identificador);

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

                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(campoEmail?.options ? ordenarOpcoes(campoEmail.options) : []),
                    traduzirPalavras(campoTelefone?.options ? ordenarOpcoes(campoTelefone.options) : []),
                ]);

                const novoTitulo = campoLGPD?.name || tituloTermoPadrao;
                const novaDescricao = campoLGPD?.description || '';
                const novasUniversidades = respostaUniversidades?.data?.universidades || [];
                const novosEscritorios = (campoEscritorio?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novosProdutos = (campoProduto?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novasOrigens = (campoOrigem?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));
                const novosIdiomas = (campoIdiomas?.options || []).map((item: any) => ({ id: item.id, nome: item.text }));

                // Atualiza o cache global
                cacheGlobal = {
                    listaProdutos: novosProdutos,
                    listaOrigens: novasOrigens,
                    listaUniversidades: novasUniversidades,
                    listaEscritorios: novosEscritorios,
                    listaIdiomas: novosIdiomas,
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
                }
            } catch {
                if (componenteMontado) setErroMetadados(true);
            } finally {
                if (componenteMontado) setCarregandoMetadados(false);
            }
        };

        carregarDados();

        return () => {
            componenteMontado = false;
        };
    }, []);

    return {
        carregandoMetadados,
        erroMetadados,
        listaProdutos,
        listaOrigens,
        listaUniversidades,
        listaEscritorios,
        listaIdiomas,
        opcoesEmail,
        opcoesTelefone,
        tituloTermoLGPD,
        descricaoTermoLGPD,
    };
}
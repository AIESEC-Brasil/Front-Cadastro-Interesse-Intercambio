import { useEffect, useState } from 'react';
import apiOgxClient from '../service/clients/apiOgxClient';
import { traduzirPalavras } from '../helpers/formatter';

interface OpcaoFormulario {
    id: number | string;
    nome: string;
}

const tituloTermoPadrao = 'Eu concordo com a coleta e uso dos meus dados conforme a Política de Privacidade *';

export function useDadosFormulario() {
    const [carregandoMetadados, setCarregandoMetadados] = useState(true);
    const [erroMetadados, setErroMetadados] = useState(false);
    const [listaProdutos, setListaProdutos] = useState<OpcaoFormulario[]>([]);
    const [listaOrigens, setListaOrigens] = useState<OpcaoFormulario[]>([]);
    const [listaUniversidades, setListaUniversidades] = useState<any[]>([]);
    const [listaEscritorios, setListaEscritorios] = useState<OpcaoFormulario[]>([]);
    const [listaIdiomas, setListaIdiomas] = useState<OpcaoFormulario[]>([]);
    const [opcoesEmail, setOpcoesEmail] = useState<any[]>([]);
    const [opcoesTelefone, setOpcoesTelefone] = useState<any[]>([]);
    const [tituloTermoLGPD, setTituloTermoLGPD] = useState(tituloTermoPadrao);
    const [descricaoTermoLGPD, setDescricaoTermoLGPD] = useState('');

    useEffect(() => {
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

                if (campoLGPD.name) setTituloTermoLGPD(campoLGPD.name);
                if (campoLGPD.description) setDescricaoTermoLGPD(campoLGPD.description);

                setOpcoesEmail(emailFormatado);
                setOpcoesTelefone(telefoneFormatado);
                setListaUniversidades(respostaUniversidades?.data?.universidades || []);
                setListaEscritorios((campoEscritorio?.options || []).map((item: any) => ({ id: item.id, nome: item.text })));
                setListaProdutos((campoProduto?.options || []).map((item: any) => ({ id: item.id, nome: item.text })));
                setListaOrigens((campoOrigem?.options || []).map((item: any) => ({ id: item.id, nome: item.text })));
                setListaIdiomas((campoIdiomas?.options || []).map((item: any) => ({ id: item.id, nome: item.text })));
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
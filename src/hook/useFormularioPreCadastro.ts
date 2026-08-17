import { useState, useEffect } from 'react';
import apiOgxClient from '../service/clients/apiOgxClient';
import { traduzirPalavras, removerMascaraData, aplicarMascaraTelefone,removerMascaraTelefone } from '../helpers/formatter';
import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';

export function useFormularioPreCadastro(rota: string, state: (step: number | any) => void) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields);
    const modals = useFormModals();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [listaProdutos, setListaProdutos] = useState<any[]>([]);
    const [listaOrigens, setListaOrigens] = useState<any[]>([]);
    const [listaUniversidades, setListaUniversidades] = useState<any[]>([]);
    const [listaEscritorios, setListaEscritorios] = useState<any[]>([]);
    const [opcoesEmail, setOpcoesEmail] = useState<any[]>([]);
    const [opcoesTelefone, setOpcoesTelefone] = useState<any[]>([]);
    const [tituloTermoLGPD, setTituloTermoLGPD] = useState<string>('Eu concordo com a coleta e uso dos meus dados conforme a Política de Privacidade *');
    const [descricaoTermoLGPD, setDescricaoTermoLGPD] = useState<string>('');

    // Busca de Metadados Iniciais
    useEffect(() => {
        let isMounted = true;
        const carregarDadosIniciais = async () => {
            modals.setCarregandoMetadados(true);
            try {
                const [resMeta, resUni] = await Promise.all([
                    apiOgxClient.get('/new-lead-ogx/metadados'),
                    apiOgxClient.get('/divisao-mercado/universidades'),
                ]);

                const metadados = resMeta?.data;
                if (!isMounted || !Array.isArray(metadados)) return;

                const campoEmail = metadados.find((item: any) => item.external_id === 'email');
                const campoTelefone = metadados.find((item: any) => item.external_id === 'telefone');
                const campoEscritorio = metadados.find((item: any) => item.external_id === 'aiesec-mais-proxima');
                const campoProduto = metadados.find((item: any) => item.external_id === 'produto');
                const campoOrigem = metadados.find((item: any) => item.external_id === 'tag-origem-2');
                const campoLGPD = metadados.find((item: any) => item.external_id === 'eu-concordo-com-a-coleta-e-uso-dos-meus-dados-conforme-');

                const ordenar = (opts: string[]) => [...opts].sort((a, b) => a.toLowerCase() === 'other' ? -1 : b.toLowerCase() === 'other' ? 1 : 0);

                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(campoEmail?.options ? ordenar(campoEmail.options) : []),
                    traduzirPalavras(campoTelefone?.options ? ordenar(campoTelefone.options) : [])
                ]);

                if (campoLGPD) {
                    if (campoLGPD.name) setTituloTermoLGPD(campoLGPD.name);
                    if (campoLGPD.description) setDescricaoTermoLGPD(campoLGPD.description);
                }

                if (isMounted) {
                    setOpcoesEmail(emailFormatado);
                    setOpcoesTelefone(telefoneFormatado);
                    setListaUniversidades(resUni?.data.universidades || []);
                    setListaEscritorios((campoEscritorio?.options || []).map((d: any) => ({ id: d.id, nome: d.text })));
                    setListaProdutos((campoProduto?.options || []).map((d: any) => ({ id: d.id, nome: d.text })));
                    setListaOrigens((campoOrigem?.options || []).map((d: any) => ({ id: d.id, nome: d.text })));
                    modals.setModalErroConexaoAberta(false);
                }
            } catch (error) {
                if (isMounted) modals.setModalErroConexaoAberta(true);
                modals.setTipoErroConexao('conexao');
            } finally {
                if (isMounted) modals.setCarregandoMetadados(false);
            }
        };
        carregarDadosIniciais();
        return () => { isMounted = false; };
    }, []);

    // Pré-seleção por Rota
    useEffect(() => {
        if (listaProdutos.length === 0) return;
        if (rota === 'voluntario-global') {
            const encontrado = listaProdutos.find(p => p.nome.toLowerCase().includes('voluntário global') || p.nome.toLowerCase().includes('voluntario global'));
            if (encontrado) { fields.setProdutoSelecionado(encontrado.nome); fields.setIdProduto(encontrado.id); }
        } else if (rota === 'professor-global') {
            const encontrado = listaProdutos.find(p => p.nome.toLowerCase().includes('professor global'));
            if (encontrado) { fields.setProdutoSelecionado(encontrado.nome); fields.setIdProduto(encontrado.id); }
        }
    }, [rota, listaProdutos]);

    const validarEProcessar = async () => {
        modals.setCarregandoEnvio(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { temErros, errosJson } = validarTudo();

        if (temErros) {
            modals.setErrosJson(errosJson);
            modals.setModalErroAberta(true);
        } else {
            const jsonResumo: any = { 
                nome: fields.nome, 
                sobrenome: fields.sobrenome, 
                produto: fields.produtoSelecionado, 
                idProduto: fields.idProduto, 
                origem: fields.origemSelecionada, 
                idOrigem: fields.idOrigem,
                "Data de Nascimento": fields.dataNascimento, 
                email: fields.emails.map((e: any) => e.valor), 
                telefone: fields.telefones.map((t: any) => t.valor), 
                termoLGPD: fields.termoLGPD ? "Concordo" : "Não Concordo",
            };
            if (!fields.marcarSemUniversidade) jsonResumo.universidade = fields.universidadeSelecionada;
            else jsonResumo.escritorio = fields.escritorioSelecionado;

            modals.setDadosResumo(jsonResumo);
            modals.setModalSucessoAberta(true);
        }
        modals.setCarregandoEnvio(false);
    };

    const nome = fields.nome;
    const sobrenome = fields.sobrenome;
    const senha = fields.senha;
    const dataNascimento = removerMascaraData(fields.dataNascimento);
    const email = fields.emails.map(e => ({ tipo: e.tipo, email: e.valor }));
    const telefone = fields.telefones.map(e => ({ tipo: e.tipo, numero: removerMascaraTelefone(e.valor) }));
    
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
    } else if (rota === 'professor-global') {
        produto.id_expa = 9;
    } else if (rota === 'talento-global') {
        produto.id_expa = 8;
    }

    const enviarDados = async () => {
        modals.setCarregandoEnvio(true);
        
        const json: any = {
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
            json.comite = comite;
        } else {
            json.universidade = universidade;
        }
        console.log(json)
        try {
            const response = await apiOgxClient.post('/new-lead-ogx/cadastro', json);
            
            // 💡 Ajuste para capturar o item_id retornado pelo backend (ex: response.data.item_id ou ajuste conforme sua API)
            if (response?.data?.item_id) {
                fields.setItemId(response.data.item_id);
            }

            modals.setModalSucessoCadastroAberta(true);
        } catch (error) {
            modals.setTipoErroConexao('bug');
            modals.setModalErroConexaoAberta(true);
            console.error('Erro ao enviar dados:', error);
        } finally {
            modals.setCarregandoEnvio(false);
        }
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        isOpen, setIsOpen,
        listaProdutos, listaOrigens, listaUniversidades, listaEscritorios,
        opcoesEmail, opcoesTelefone, tituloTermoLGPD, descricaoTermoLGPD,
        validarEProcessar,
        aplicarMascaraTelefone,
        enviarDados
    };
}
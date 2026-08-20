import { useState, useEffect } from 'react';
import apiOgxClient from '../service/clients/apiOgxClient';
import { removerMascaraData, aplicarMascaraTelefone,removerMascaraTelefone } from '../helpers/formatter';
import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';
import { useDadosFormulario } from './useDadosFormulario';

export function useFormularioPreCadastro(rota: string, state: (step: number | any) => void,dados:any) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields);
    const modals = useFormModals();
    const dadosFormulario = useDadosFormulario();

    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Pré-seleção por Rota
    useEffect(() => {
        if (dadosFormulario.listaProdutos.length === 0) return;
        if (rota === 'voluntario-global') {
            const encontrado = dadosFormulario.listaProdutos.find(p => p.nome.toLowerCase().includes('voluntário global') || p.nome.toLowerCase().includes('voluntario global'));
            if (encontrado) { fields.setProdutoSelecionado(encontrado.nome); fields.setIdProduto(encontrado.id); }
        } else if (rota === 'professor-global') {
            const encontrado = dadosFormulario.listaProdutos.find(p => p.nome.toLowerCase().includes('professor global'));
            if (encontrado) { fields.setProdutoSelecionado(encontrado.nome); fields.setIdProduto(encontrado.id); }
        }
    }, [rota, dadosFormulario.listaProdutos]);

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
        } catch (error:any) {
            const dadosErro = error.response?.data?.data;
            console.log(dadosErro)
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
            console.log('Erro ao enviar dados:', error);
        } finally {
            modals.setCarregandoEnvio(false);
        }
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        isOpen, setIsOpen,
        ...dadosFormulario,
        validarEProcessar,
        aplicarMascaraTelefone,
        enviarDados
    };
}
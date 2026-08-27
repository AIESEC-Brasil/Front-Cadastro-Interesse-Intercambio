import { useState, useEffect } from 'react';
import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';
import { useDadosFormulario } from './useDadosFormulario';
import {aplicarMascaraTelefone } from '../helpers/formatter';

/**
 * Orquestra a primeira etapa do cadastro.
 *
 * Este hook junta quatro responsabilidades que precisam conversar entre si:
 * campos compartilhados, validação, modais e dados carregados da API. O
 * componente visual apenas descreve os campos e chama os handlers devolvidos
 * aqui. Assim, a regra de negócio continua fora do JSX.
 */
export function useFormularioPreCadastro(rota: string, state: (step: number) => void,step:number) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields,step);
    const modals = useFormModals();
    const dadosFormulario = useDadosFormulario(modals,fields,step,rota);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Algumas páginas entram já associadas a um programa conhecido. A seleção
    // automática só acontece quando os metadados já chegaram da API.
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

    /**
     * Valida a primeira etapa e, quando tudo está correto, prepara o resumo que
     * o usuário verá antes do POST definitivo. A confirmação desse resumo é
     * separada e acontece em `realizarPreCadastro`.
     */
    const validarEProcessar = async () => {
        modals.setCarregandoEnvio(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { temErros, errosJson } = validarTudo();

        if (temErros) {
            modals.setErrosJson(errosJson);
            modals.setModalErroAberta(true);
        } else {
            const jsonResumo: Record<string, string | string[]> = {
                ["Nome"]: fields.nome, 
                ["Sobrenome"]: fields.sobrenome, 
                ["Programa"]: fields.produtoSelecionado, 
                ["Como conheceu a AIESEC"]: fields.origemSelecionada, 
                ["Data de Nascimento"]: fields.dataNascimento, 
                ["E-mail"]: fields.emails.map((email) => email.valor),
                ["Telefone"]: fields.telefones.map((telefone) => telefone.valor),
                ["Politica de Privacidade"]: fields.termoLGPD ? "Concordo" : "Não Concordo",
            };
            if (!fields.marcarSemUniversidade) jsonResumo["Universidade"] = fields.universidadeSelecionada;
            else jsonResumo["AIESEC mais Próxima"] = fields.escritorioSelecionado;

            modals.setDadosResumo(jsonResumo);
            modals.setModalSucessoAberta(true);
        }
        modals.setCarregandoEnvio(false);
    };

    const handleAdicionarEmail = () => fields.setEmails([...fields.emails, { tipo: 'other', valor: '' }]);
    const handleRemoverEmail = (indice: number) => fields.setEmails(fields.emails.filter((_, index) => index !== indice));
    const handleAtualizarTipoEmail = (indice: number, valor: string) => {
        fields.setEmails(fields.emails.map((item, index) => index === indice ? { ...item, tipo: valor } : item));
    };
    const handleAtualizarValorEmail = (indice: number, valor: string) => {
        fields.setEmails(fields.emails.map((item, index) => index === indice ? { ...item, valor } : item));
    };

    const handleAdicionarTelefone = () => fields.setTelefones([...fields.telefones, { tipo: 'other', valor: '' }]);
    const handleRemoverTelefone = (indice: number) => fields.setTelefones(fields.telefones.filter((_, index) => index !== indice));
    const handleAtualizarTipoTelefone = (indice: number, valor: string) => {
        fields.setTelefones(fields.telefones.map((item, index) => index === indice ? { ...item, tipo: valor } : item));
    };
    const handleAtualizarValorTelefone = (indice: number, valor: string) => {
        fields.setTelefones(fields.telefones.map((item, index) => index === indice ? { ...item, valor: aplicarMascaraTelefone(valor) } : item));
    };

    const handleSelecionarProduto = (nome: string, id: number | string) => {
        fields.setProdutoSelecionado(nome);
        fields.setIdProduto(id);
        setIsOpen(false);
    };
    const handleLimparProduto = () => {
        fields.setProdutoSelecionado("");
        fields.setIdProduto("");
        setIsOpen(false);
    };
    const handleSelecionarUniversidade = (nome: string, id: number | string) => {
        fields.setUniversidadeSelecionada(nome);
        fields.setIdUniversidade(id);
    };
    /** Universidade e comitê são alternativas: o checkbox limpa a seleção que
     * deixou de ser aplicável para evitar enviar as duas no mesmo cadastro. */
    const handleAlternarUniversidade = (marcada: boolean) => {
        fields.setMarcarSemUniversidade(marcada);
        if (marcada) {
            fields.setUniversidadeSelecionada('');
        } else {
            fields.setEscritorioSelecionado('');
        }
    };
    const handleSelecionarEscritorio = (nome: string, id: number | string) => {
        fields.setEscritorioSelecionado(nome);
        fields.setIdEscritorio(id);
    };
    const handleSelecionarOrigem = (nome: string, id: number | string) => {
        fields.setOrigemSelecionada(nome);
        fields.setIdOrigem(id);
    };

    const fecharModalSucessoCadastro = () => {
        modals.setModalSucessoCadastroAberta(false);
        if (typeof state === 'function') {
            state(2);
        }
    };

    /** Fecha o resumo, envia o cadastro e abre o sucesso intermediário somente
     * se a API confirmar a criação. O avanço para a qualificação ocorre depois. */
    const realizarPreCadastro = async () => {
        modals.setModalSucessoAberta(false);
        const response = await dadosFormulario.enviarDados();
        if (response) {
            modals.setModalSucessoCadastroAberta(true);
        }
    }

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        isOpen, setIsOpen,
        validarEProcessar,
        aplicarMascaraTelefone,
        handleAdicionarEmail, handleRemoverEmail, handleAtualizarTipoEmail, handleAtualizarValorEmail,
        handleAdicionarTelefone, handleRemoverTelefone, handleAtualizarTipoTelefone, handleAtualizarValorTelefone,
        handleSelecionarProduto, handleLimparProduto, handleSelecionarUniversidade,
        handleAlternarUniversidade, handleSelecionarEscritorio, handleSelecionarOrigem,fecharModalSucessoCadastro,realizarPreCadastro
    };
}
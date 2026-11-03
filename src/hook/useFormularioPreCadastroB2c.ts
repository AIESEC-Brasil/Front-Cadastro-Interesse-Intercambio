import { useState } from 'react';
import { useCamposFormulario } from './useCamposFormulario';
import { useValidacaoFormulario } from './useValidacaoFormulario';
import { useModaisFormulario } from './useModaisFormulario';
import { useDadosFormularioB2c } from './useDadosFormularioB2c';
import { aplicarMascaraTelefone } from '@/helpers/formatter';

/**
 * Hook do formulário B2C que valida os dados e envia o pré-cadastro.
 *
 * Junta quatro módulos de responsabilidade:
 * - `useCamposFormulario`: gerenciamento do estado dos inputs do formulário.
 * - `useValidacaoFormulario`: validação dos campos obrigatórios e formato dos dados.
 * - `useModaisFormulario`: controle das modais de confirmação, resumo, erro e carregamento.
 * - `useDadosFormularioB2c`: busca metadados e envia apenas o contrato B2C.
 * @returns Objeto com estados dos campos, erros de validação, controle de modais, dados da API e funções handlers.
 */
export function useFormularioPreCadastroB2c() {
    const fields = useCamposFormulario();
    const { erros, validarTudo } = useValidacaoFormulario(
        fields,
        1,
        undefined,
        { exigirSenha: false, exigirAutorizacao: false }
    );
    const modals = useModaisFormulario();
    const dadosFormulario = useDadosFormularioB2c({ modals, fields });
    const [isOpen, setIsOpen] = useState<boolean>(false);

    /**
     * Valida a primeira etapa do formulário e, caso não haja erros,
     * compõe o JSON com o resumo dos dados para confirmação do usuário antes do envio.
     */
    const validarEProcessar = async (): Promise<void> => {
        modals.setCarregandoEnvio(true);
        try {
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));

            const { temErros, errosJson } = validarTudo();

            if (temErros) {
                modals.setErrosJson(errosJson);
                modals.setModalErroAberta(true);
            } else {
                const jsonResumo: Record<string, string | string[]> = {
                    Nome: fields.nome,
                    Sobrenome: fields.sobrenome,
                    'Data de Nascimento': fields.dataNascimento,
                    'E-mail': fields.emails.map((email) => email.valor),
                    Telefone: fields.telefones.map((telefone) => telefone.valor),
                    'Como conheceu a AIESEC': fields.origemSelecionada,
                    Programa: fields.produtoSelecionado,
                };

                if (!fields.marcarSemUniversidade) {
                    jsonResumo.Universidade = fields.universidadeSelecionada;
                } else {
                    jsonResumo['AIESEC mais Próxima'] = fields.escritorioSelecionado;
                }

                modals.setDadosResumo(jsonResumo);
                modals.setModalSucessoAberta(true);
            }
        } finally {
            modals.setCarregandoEnvio(false);
        }
    };

    /** Adiciona um novo campo de e-mail ao formulário. */
    const aoAdicionarEmail = () => fields.setEmails((emails) =>
        emails.length >= 2 ? emails : [...emails, { tipo: 'other', valor: '' }],
    );

    /** Remove um campo de e-mail específico pelo índice. */
    const aoRemoverEmail = (indice: number) => fields.setEmails(fields.emails.filter((_, index) => index !== indice));

    /** Atualiza o tipo da conta de e-mail (ex: pessoal, trabalho). */
    const aoAtualizarTipoEmail = (indice: number, valor: string) => {
        fields.setEmails(fields.emails.map((item, index) => index === indice ? { ...item, tipo: valor } : item));
    };

    /** Atualiza o valor textual do e-mail digitado. */
    const aoAtualizarValorEmail = (indice: number, valor: string) => {
        fields.setEmails(fields.emails.map((item, index) => index === indice ? { ...item, valor } : item));
    };

    /** Adiciona um novo campo de telefone ao formulário. */
    const aoAdicionarTelefone = () => fields.setTelefones((telefones) =>
        telefones.length >= 2 ? telefones : [...telefones, { tipo: 'other', valor: '' }],
    );

    /** Remove um campo de telefone específico pelo índice. */
    const aoRemoverTelefone = (indice: number) => fields.setTelefones(fields.telefones.filter((_, index) => index !== indice));

    /** Atualiza o tipo de telefone (ex: celular, fixo). */
    const aoAtualizarTipoTelefone = (indice: number, valor: string) => {
        fields.setTelefones(fields.telefones.map((item, index) => index === indice ? { ...item, tipo: valor } : item));
    };

    /** Aplica máscara e atualiza o número de telefone no formulário. */
    const aoAtualizarValorTelefone = (indice: number, valor: string) => {
        fields.setTelefones(fields.telefones.map((item, index) => index === indice ? { ...item, valor: aplicarMascaraTelefone(valor) } : item));
    };

    /** Seleciona um produto/programa e fecha o menu dropdown/modal. */
    const aoSelecionarProduto = (nome: string, id: number | string) => {
        fields.setProdutoSelecionado(nome);
        fields.setIdProduto(id);
        setIsOpen(false);
    };

    /** Reseta o produto selecionado. */
    const aoLimparProduto = () => {
        fields.setProdutoSelecionado("");
        fields.setIdProduto("");
        setIsOpen(false);
    };

    /** Define a universidade selecionada e seu ID. */
    const aoSelecionarUniversidade = (nome: string, id: number | string) => {
        fields.setUniversidadeSelecionada(nome);
        fields.setIdUniversidade(id);
    };

    /**
     * Alterna entre seleção de Universidade e Escritório Local.
     * Como são opções mutuamente exclusivas, a seleção oposta é zerada.
     */
    const aoAlternarUniversidade = (marcada: boolean) => {
        fields.setMarcarSemUniversidade(marcada);
        if (marcada) {
            fields.setUniversidadeSelecionada('');
            fields.setIdUniversidade('');
        } else {
            fields.setEscritorioSelecionado('');
            fields.setIdEscritorio('');
        }
    };

    /** Define o escritório local/comitê selecionado. */
    const aoSelecionarEscritorio = (nome: string, id: number | string) => {
        fields.setEscritorioSelecionado(nome);
        fields.setIdEscritorio(id);
    };

    /** Define a origem/canal onde o usuário conheceu a AIESEC. */
    const aoSelecionarOrigem = (nome: string, id: number | string) => {
        fields.setOrigemSelecionada(nome);
        fields.setIdOrigem(id);
    };

    /** Fecha a confirmação final do pré-cadastro B2C. */
    const fecharModalSucessoCadastro = () => {
        modals.setModalSucessoCadastroAberta(false);
    };

    /**
     * Executa a requisição final para envio dos dados ao servidor.
     * Em caso de resposta positiva da API, exibe a modal de sucesso.
     */
    const realizarPreCadastro = async (): Promise<void> => {
        modals.setModalSucessoAberta(false);
        const response = await dadosFormulario.enviarDados();
        if (response) {
            fields.limpar();
            setIsOpen(false);
            modals.setModalSucessoCadastroAberta(true);
        }
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        tag: fields.tag,
        setTag: fields.setTag,
        isOpen,
        setIsOpen,
        validarEProcessar,
        handleAdicionarEmail: aoAdicionarEmail,
        handleRemoverEmail: aoRemoverEmail,
        handleAtualizarTipoEmail: aoAtualizarTipoEmail,
        handleAtualizarValorEmail: aoAtualizarValorEmail,
        handleAdicionarTelefone: aoAdicionarTelefone,
        handleRemoverTelefone: aoRemoverTelefone,
        handleAtualizarTipoTelefone: aoAtualizarTipoTelefone,
        handleAtualizarValorTelefone: aoAtualizarValorTelefone,
        handleSelecionarProduto: aoSelecionarProduto,
        handleLimparProduto: aoLimparProduto,
        handleSelecionarUniversidade: aoSelecionarUniversidade,
        handleAlternarUniversidade: aoAlternarUniversidade,
        handleSelecionarEscritorio: aoSelecionarEscritorio,
        handleSelecionarOrigem: aoSelecionarOrigem,
        fecharModalSucessoCadastro,
        realizarPreCadastro
    };
}
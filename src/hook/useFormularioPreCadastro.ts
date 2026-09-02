import { useState, useEffect } from 'react';
import { useCamposFormulario } from './useCamposFormulario';
import { useValidacaoFormulario } from './useValidacaoFormulario';
import { useModaisFormulario } from './useModaisFormulario';
import { useDadosFormulario } from './useDadosFormulario';
import { aplicarMascaraTelefone } from '@/helpers/formatter';
import { siglaProduto, escritorios } from '@/helpers/dicionario';
// Auxiliares de formatação e mapeamentos estáticos
import { slugify } from '@/helpers/formatter';
import { params } from '@/types/componentes';

/**
 * Hook customizado para orquestrar a primeira etapa do pré-cadastro da AIESEC.
 *
 * Junta quatro módulos de responsabilidade:
 * - `useCamposFormulario`: gerenciamento do estado dos inputs do formulário.
 * - `useValidacaoFormulario`: validação dos campos obrigatórios e formato dos dados.
 * - `useModaisFormulario`: controle das modais de confirmação, resumo, erro e carregamento.
 * - `useDadosFormulario`: busca de dados de suporte (listas de produtos, origens, meios, escritórios) e requisição HTTP final.
 *
 * @param rota - Identificador da rota/página atual (ex: 'voluntario-global', 'professor-global', 'talento-global').
 * @param state - Função callback para avançar as etapas/passos do formulário.
 * @param step - Número da etapa atual do formulário.
 * @param params - Objeto opcional contendo os parâmetros passados via URL (ex: UTMs).
 * 
 * @returns Objeto com estados dos campos, erros de validação, controle de modais, dados da API e funções handlers.
 */
export function useFormularioPreCadastro(
    rota: string, 
    state: (step: number) => void, 
    step: number, 
    params?: params
) {
    const fields = useCamposFormulario();
    const { erros, validarTudo } = useValidacaoFormulario(fields, step, params);
    const modals = useModaisFormulario();
    const dadosFormulario = useDadosFormulario({ modals, fields, step, rota });
    const [isOpen, setIsOpen] = useState<boolean>(false);

    /**
     * Efeito responsável pela seleção e preenchimento automático de campos do formulário
     * com base na rota atual e nos parâmetros passados via URL (UTMs).
     */
    useEffect(() => {
        // Aguarda a API retornar a lista de produtos antes de executar qualquer autoseleção
        if (dadosFormulario.listaProdutos.length === 0) return;

        // 1. Definição do produto/programa com base na rota ou no utm_content
        if (rota === 'voluntario-global') {
            const encontrado = dadosFormulario.listaProdutos.find(
                p => p.nome.toLowerCase().includes('voluntário global') || 
                     p.nome.toLowerCase().includes('voluntario global')
            );
            if (encontrado) { 
                fields.setProdutoSelecionado(encontrado.nome); 
                fields.setIdProduto(encontrado.id); 
            }
        } else if (rota === 'professor-global') {
            const encontrado = dadosFormulario.listaProdutos.find(
                p => p.nome.toLowerCase().includes('professor global')
            );
            if (encontrado) { 
                fields.setProdutoSelecionado(encontrado.nome); 
                fields.setIdProduto(encontrado.id); 
            }
        } else if (rota === 'talento-global' && (params?.utm_content === 'gtast' || params?.utm_content === 'gtalt')) {
            const produto = siglaProduto?.filter((e: any) => e?.sigla.toLowerCase() === params?.utm_content)[0]?.nome;
            if (produto) {
                const encontrado = dadosFormulario.listaProdutos.find(
                    (p:any) => p.nome.toLowerCase() === produto.toLowerCase()
                );
                if (encontrado) { 
                    fields.setProdutoSelecionado(encontrado.nome); 
                    fields.setIdProduto(encontrado.id); 
                }
            }
        }

        // 2. Preenchimento automático da Origem (Como conheceu a AIESEC) via utm_source
        if (params?.utm_source) {
            const origem = dadosFormulario.listaOrigens.find(
                (o:any) => slugify(o.nome.toLowerCase()) === params?.utm_source?.toLowerCase()
            );
            if (origem) { 
                fields.setOrigemSelecionada(origem.nome); 
                fields.setIdOrigem(origem.id); 
                console.log()
            }
        }

        // 3. Preenchimento automático do Meio de divulgação via utm_medium
        if (params?.utm_medium) {
            const meio = dadosFormulario.listaMeio.find(
                (o:any) => slugify(o.nome.toLowerCase()) === params?.utm_medium?.toLowerCase()
            );
            if (meio) { 
                fields.setMeioSelecionado(meio.nome); 
                fields.setIdMeio(meio.id); 
            }
        }

        // 4. Seleção automática do Escritório Local (CL) via utm_term e desativação de universidade
        if (params?.utm_term) {
            fields.setMarcarSemUniversidade(true);
            const cl = escritorios?.filter((e: any) => e?.sigla.toLowerCase() === params?.utm_term)[0]?.nome;
            if (cl) {
                const escritorio = dadosFormulario.listaEscritorios.filter(
                    o => o.nome
                    .replace('AIESEC em', '')
                    .replace('AIESEC no', '')
                    .replace('São Paulo Unidade','').toLowerCase().trim() === cl?.toLowerCase()
                )[0];
                if (escritorio) { 
                    fields.setEscritorioSelecionado(escritorio.nome); 
                    fields.setIdEscritorio(escritorio.id); 
                }
            }
        }
        
    }, [
        rota, 
        dadosFormulario.listaProdutos, 
        dadosFormulario.listaOrigens, 
        dadosFormulario.listaMeio, 
        dadosFormulario.listaEscritorios, 
        params
    ]);

    /**
     * Valida a primeira etapa do formulário e, caso não haja erros, 
     * compõe o JSON com o resumo dos dados para confirmação do usuário antes do envio.
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
                ["Data de Nascimento"]: fields.dataNascimento,
                ["E-mail"]: fields.emails.map((email) => email.valor),
                ["Telefone"]: fields.telefones.map((telefone) => telefone.valor),
                ["Politica de Privacidade"]: fields.termoLGPD ? "Concordo" : "Não Concordo",
            };

            if (!params?.utm_source){
                jsonResumo["Como conheceu a AIESEC"] = fields.origemSelecionada;
            };

            if (!params?.utm_content) {
                jsonResumo["Programa"] = fields.produtoSelecionado;
            };

            // Condicional para exibição do campo de localização acadêmica no resumo
            if (!fields.marcarSemUniversidade) {
                jsonResumo["Universidade"] = fields.universidadeSelecionada;
            } else if (!params?.utm_term) {
                // Exibe o escritório local apenas se a universidade não for selecionada e não houver utm_term
                jsonResumo["AIESEC mais Próxima"] = fields.escritorioSelecionado;
            };

            modals.setDadosResumo(jsonResumo);
            modals.setModalSucessoAberta(true);
        };
        modals.setCarregandoEnvio(false);
    };

    /** Adiciona um novo campo de e-mail ao formulário. */
    const aoAdicionarEmail = () => fields.setEmails([...fields.emails, { tipo: 'other', valor: '' }]);

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
    const aoAdicionarTelefone = () => fields.setTelefones([...fields.telefones, { tipo: 'other', valor: '' }]);

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
        } else {
            fields.setEscritorioSelecionado('');
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

    /** Fecha a modal de sucesso do cadastro e avança para a próxima etapa (step 2). */
    const fecharModalSucessoCadastro = () => {
        modals.setModalSucessoCadastroAberta(false);
        if (typeof state === 'function') {
            state(2);
        }
    };

    /**
     * Executa a requisição final para envio dos dados ao servidor.
     * Em caso de resposta positiva da API, exibe a modal de sucesso.
     */
    const realizarPreCadastro = async () => {
        modals.setModalSucessoAberta(false);
        const response = await dadosFormulario.enviarDados();
        if (response) {
            modals.setModalSucessoCadastroAberta(true);
        }
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        isOpen, 
        setIsOpen,
        validarEProcessar,
        aplicarMascaraTelefone,
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
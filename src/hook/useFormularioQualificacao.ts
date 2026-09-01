import { useCamposFormulario } from './useCamposFormulario';
import { useValidacaoFormulario } from './useValidacaoFormulario';
import { useModaisFormulario } from './useModaisFormulario';
import { useDadosFormulario } from './useDadosFormulario';

/**
 * Orquestra a segunda etapa, chamada de qualificação.
 *
 * Diferentemente do pré-cadastro, os campos desta tela podem ser deixados
 * vazios. Quando há preenchimento, nomes e IDs precisam permanecer alinhados
 * para que a API receba tanto o texto escolhido quanto sua identificação.
 */
export function useFormularioQualificacao(rota: string, state: (step: number) => void,step:number) {
    const fields = useCamposFormulario();
    const { erros, validarTudo } = useValidacaoFormulario(fields,step);
    const modals = useModaisFormulario();
    const dadosFormulario = useDadosFormulario({modals,fields,step,rota});
    
    // O componente de seleção trabalha com objetos; o estado global guarda os
    // nomes e IDs em arrays paralelos para manter compatibilidade com o payload.
    const idiomaFormatado = fields.idiomasSelecionados.map((nome: string, index: number) => ({
        id: fields.idIdiomas[index],
        nome
    }));

    // Converte a lista rica do componente para os dois arrays simples do estado.
    const aoAtualizarIdiomas = (novosSelecionados: Array<{ id: number | string; nome: string }>) => {
        const nomes = novosSelecionados.map(item => item.nome);
        const ids = novosSelecionados.map(item => item.id);

        fields.setIdiomasSelecionados(nomes);
        fields.setIdIdiomas(ids);
    };

    const aoAtualizarSemestre = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setSemestreSelecionado(nomeSelecionado);
        fields.setIdSemestre(idSelecionado);
    };

    const aoAtualizarCurriculo = (arquivo: File | null, base64: string | null) => {
        fields.setAnexoBase64(base64)
        fields.setAnexoPdf(arquivo)
    }

    const aoAtualizarAreaAtuacao = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setAreaAtuacao(nomeSelecionado);
        fields.setIdAreaAtuacao(idSelecionado);
    }

    const aoAtualizarNivelAtuacao = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setNivelAtuacao(nomeSelecionado);
        fields.setIdNivelAtuacao(idSelecionado);
    }

    /** Valida o que foi preenchido e decide entre resumo de confirmação ou
     * sucesso direto quando a qualificação foi deixada totalmente vazia. */
    const validarEProcessar = async () => {
        modals.setCarregandoEnvio(true);
        
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { temErros, errosJson } = validarTudo();

        if (temErros) {
            modals.setErrosJson(errosJson);
            modals.setModalErroAberta(true);
        } else {
            const jsonResumo: any = {};
            const campoOpicionalPreenchido = fields.idiomasSelecionados.length > 0 
            || fields.curso || 
            fields.semestreSelecionado || 
            fields.anexoPdf || fields.areaAtuacaoSelecionada || fields.nivelAtuacaoSelecionado;
            if (campoOpicionalPreenchido){
                if (fields.idiomasSelecionados.length > 0) {
                    jsonResumo["Idiomas"] = fields.idiomasSelecionados
                }

                if (fields.curso){
                    jsonResumo["Curso"] = fields.curso
                }

                if (fields.semestreSelecionado){
                    jsonResumo["Semestre"] = fields.semestreSelecionado
                }

                if (fields.anexoPdf) {
                    jsonResumo["Curriculo"] = fields.anexoPdf.name;
                }

                if (fields.areaAtuacaoSelecionada) {
                    jsonResumo["Área de Atuação"] = fields.areaAtuacaoSelecionada;
                }

                if (fields.nivelAtuacaoSelecionado) {
                    jsonResumo["Nível de Atuação"] = fields.nivelAtuacaoSelecionado;
                }

                modals.setDadosResumo(jsonResumo);
                modals.setModalSucessoAberta(true);
            } else {
                modals.setModalSucessoQualificaco(true);
            }
        }
        modals.setCarregandoEnvio(false);
    };

    /** Confirma o resumo e envia a atualização da qualificação para a API. */
    const atualizarDadosQualificacao = async () => {
                    modals.setModalSucessoAberta(false);
                    const resultado = await dadosFormulario.enviarDados();
                    if (resultado) {
                        modals.setModalSucessoQualificaco(true);
                    }
                }
    
    /**
     * Se tudo ocorrer bem essa função vai se chamada pra fechar tudo limpar os dados e voltar pro state 1 do formulario
     */
    const fecharModalSucessoQualificacao = () => {
        modals.setModalSucessoQualificaco(false);
        fields.limpar();
        if (typeof state === 'function') {
            state(1);
        }
    }

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        idiomaFormatado,
        handleAtualizarIdiomas: aoAtualizarIdiomas,
        handleAtualizarSemestre: aoAtualizarSemestre,
        handleAtualizarCurriculo: aoAtualizarCurriculo,
        handleAtualizarAreaAtuacao: aoAtualizarAreaAtuacao,
        handleAtualizarNivelAtuacao: aoAtualizarNivelAtuacao,
        validarEProcessar,
        atualizarDadosQualificacao,
        fecharModalSucessoQualificacao,
    }
}
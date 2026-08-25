import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';
import { useDadosFormulario } from './useDadosFormulario';

export function useFormularioQualificacao(rota: string, state: (step: number | any) => void,step:number) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields,step);
    const modals = useFormModals();
    const dadosFormulario = useDadosFormulario(modals,fields,step,rota);
    
    const idiomaFomartado = fields.idiomasSelecionados.map((nome,index) => ({
        id: fields.idIdiomas[index],
        nome
    }));

    // Função que recebe a nova lista do input e atualiza os dois arrays separadamente no hook
    const handleAtualizarIdiomas = (novosSelecionados: Array<{ id: number | string; nome: string }>) => {
        const nomes = novosSelecionados.map(item => item.nome);
        const ids = novosSelecionados.map(item => item.id);

        fields.setIdiomasSelecionados(nomes);
        fields.setIdIdiomas(ids);
    };

    const handleAtualizarSemestre = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setSemestreSelecionado(nomeSelecionado);
        fields.setIdSemestre(idSelecionado);
    };

    const handleAtualizarCurriculo = (arquivo: File | null, base64: string | null) => {
        fields.setAnexoBase64(base64)
        fields.setAnexoPdf(arquivo)
    }

    const handleAtualizarAreaAtuacao = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setAreaAtuacao(nomeSelecionado);
        fields.setIdAreaAtuacao(idSelecionado);
    }

    const handleAtualizarNivelAtuacao = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setNivelAtuacao(nomeSelecionado);
        fields.setIdNivelAtuacao(idSelecionado);
    }

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
        state(1);
    }

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        idiomaFomartado,
        handleAtualizarIdiomas,
        handleAtualizarSemestre,
        handleAtualizarCurriculo,
        handleAtualizarAreaAtuacao,
        handleAtualizarNivelAtuacao,
        validarEProcessar,
        atualizarDadosQualificacao,
        fecharModalSucessoQualificacao,
    }
}
import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';
import { useDadosFormulario } from './useDadosFormulario';

export function useFormularioQualificacao(rota: string, state: (step: number | any) => void,step:number) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields,step);
    const modals = useFormModals();
    const dadosFormulario = useDadosFormulario(modals,fields,step,rota);
    console.log(fields.itemId)
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
        console.log(nomes,ids);
    };

    const handleAtualizarSemestre = (nomeSelecionado: string, idSelecionado: number | string) => {
        fields.setSemestreSelecionado(nomeSelecionado);
        fields.setIdSemestre(idSelecionado);
        console.log(nomeSelecionado,idSelecionado);
    };

    const handleAtualizarCurriculo = (arquivo: File | null, base64: string | null) => {
        fields.setAnexoBase64(base64)
        fields.setAnexoPdf(arquivo)
        console.log(base64)
        if (arquivo){
            console.log(arquivo.name)
        }
    }

    const processarEnvio = () => {
        const { temErros, errosJson } = validarTudo();
        console.log(errosJson)
        console.log(fields.anexoPdf)
        if (temErros) {
            modals.setErrosJson(errosJson);
            modals.setModalErroAberta(true);
        } else {
            const jsonResumo: any = {};
            if (fields.idiomasSelecionados.length > 0 || fields.curso || fields.semestreSelecionado || fields.anexoPdf ){
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

                modals.setDadosResumo(jsonResumo);
                modals.setModalSucessoAberta(true);
            } else {
                modals.setModalSucessoQualificaco(true);
            }
        }
        modals.setCarregandoEnvio(false);
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        idiomaFomartado,
        handleAtualizarIdiomas,
        handleAtualizarSemestre,
        handleAtualizarCurriculo,
        processarEnvio
    }
}
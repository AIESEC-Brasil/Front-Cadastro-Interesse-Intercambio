import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';
import { useDadosFormulario } from './useDadosFormulario';

export function useFormularioQualificacao(rota: string, state: (step: number | any) => void) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields);
    const modals = useFormModals();
    const dadosFormulario = useDadosFormulario(modals);

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

    const processarEnvio = () => {
        console.log("Idiomas Nomes:", fields.idiomasSelecionados);
        console.log("Idiomas IDs:", fields.idIdiomas);
        
        // Exemplo avançando o step (ex: ir para o próximo passo)
        if (typeof state === 'function') {
            state(3);
        }
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        idiomaFomartado,
        handleAtualizarIdiomas,
        handleAtualizarSemestre,
        processarEnvio
    }
}
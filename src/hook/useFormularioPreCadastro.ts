import { useState, useEffect } from 'react';
import apiOgxClient from '../service/clients/apiOgxClient';
import { useFormFields } from './useFormFields';
import { useFormValidation } from './useFormValidation';
import { useFormModals } from './useFormModals';
import { useDadosFormulario } from './useDadosFormulario';
import {aplicarMascaraTelefone } from '../helpers/formatter';

export function useFormularioPreCadastro(rota: string, state: (step: number | any) => void,step:number) {
    const fields = useFormFields();
    const { erros, validarTudo } = useFormValidation(fields,step);
    const modals = useFormModals();
    const dadosFormulario = useDadosFormulario(modals,fields,step,rota);
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
                ["Nome"]: fields.nome, 
                ["Sobrenome"]: fields.sobrenome, 
                ["Programa"]: fields.produtoSelecionado, 
                ["Como conheceu a AIESEC"]: fields.origemSelecionada, 
                ["Data de Nascimento"]: fields.dataNascimento, 
                ["E-mail"]: fields.emails.map((e: any) => e.valor), 
                ["Telefone"]: fields.telefones.map((t: any) => t.valor), 
                ["Politica de Privacidade"]: fields.termoLGPD ? "Concordo" : "Não Concordo",
            };
            if (!fields.marcarSemUniversidade) jsonResumo["Universidade"] = fields.universidadeSelecionada;
            else jsonResumo["AIESEC mais Próxima"] = fields.escritorioSelecionado;

            modals.setDadosResumo(jsonResumo);
            modals.setModalSucessoAberta(true);
        }
        modals.setCarregandoEnvio(false);
    };

    return {
        ...fields,
        ...erros,
        ...modals,
        ...dadosFormulario,
        isOpen, setIsOpen,
        validarEProcessar,
        aplicarMascaraTelefone
    };
}
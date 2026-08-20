"use client";

/**
 * @file FormularioQualificacao.tsx
 * @description Componente de formulário para qualificação de idiomas do lead.
 * Renderiza o input multiselect de idiomas consumindo a lógica do custom hook sem utilizar tag form.
 */

import React from 'react';
import InputMultiSelectIdiomas from '../ui/input/InputMultiSelectIdiomas';
import InputTexto from '../ui/input/InputTexto';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';

import LoadSpinner from '../loading/LoadSpinner';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';

import { useFormularioQualificacao } from '../../hook/useFormularioQualificacao';

interface FormularioQualificacaoProps {
    rota: string;
    state: (step: number | any) => void;
}

const FormularioQualificacao = ({ rota, state }: FormularioQualificacaoProps) => {
    const {
        curso,setCurso,erroCurso,
        listaIdiomas,
        carregandoEnvio,
        carregandoMetadados,
        handleAtualizarIdiomas,
        idiomasFormatados,
        processarEnvio
    } = useFormularioQualificacao(rota, state);
    
    return (
        <div className="relative">
            {/* Esqueleto de carregamento exibido enquanto metadados são buscados */}
            <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[1, 1]} />
            {!carregandoMetadados && (
                <div id="meuFormQuali" className="flex flex-col gap-4">
                    
                    {/* Input MultiSelect de Idiomas */}
                    <div className="flex flex-col">
                        <InputMultiSelectIdiomas 
                            id="idiomas"
                            legenda="Idiomas e Proficiência"
                            selecionados={idiomasFormatados}
                            atualizar={handleAtualizarIdiomas}
                            opcoes={listaIdiomas || []}
                            obrigatorio={false}
                        />
                    </div>

                    <InputTexto 
                            id="curso" 
                            legenda="Qual seu Curso?" 
                            valor={curso} 
                            atualizar={(e: any) => setCurso(e.target.value)} 
                            error={erroCurso} 
                            obrigatorio={false}
                        />

                    <ButtonConfirmar 
                        texto="Avançar" 
                        aoClicar={processarEnvio} 
                        type="button" 
                    />
                </div>
            )}

            {/* Loaders */}
            <LoadSpinner aberta={carregandoEnvio} />
        </div>
    );
};

export default FormularioQualificacao;
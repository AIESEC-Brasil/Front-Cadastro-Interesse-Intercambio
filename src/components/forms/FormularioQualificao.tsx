"use client";

/**
 * @file FormularioQualificacao.tsx
 * @description Componente de formulário para qualificação de idiomas do lead.
 * Renderiza o input multiselect de idiomas consumindo a lógica do custom hook sem utilizar tag form.
 */

import React from 'react';
import InputMultiSelectIdiomas from '../ui/input/InputMultiSelectIdiomas';
import InputTexto from '../ui/input/InputTexto';
import InputAutoComplete from '../ui/input/InputAutoComplete';
import InputAnexoPdf from '../ui/input/InputAnexoPdf';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';

import ModalErro from '../modal/ModalErro';
import ModalErroConexao from '../modal/ModalErroConexao';

import LoadSpinner from '../loading/LoadSpinner';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';

import { useFormularioQualificacao } from '../../hook/useFormularioQualificacao';

interface FormularioQualificacaoProps {
    rota: string;
    state: (step: number | any) => void;
    step: number
}

const FormularioQualificacao = ({ rota, state,step }: FormularioQualificacaoProps) => {
    const {
        curso,setCurso,erroCurso,semestreSelecionados,idiomasSelecionados,
        anexoPdf,
        listaIdiomas,listaSemestres,
        modalErroConexaoAberta,tipoErroConexao,
        carregandoEnvio,
        carregandoMetadados,
        idiomaFomartado,
        handleAtualizarIdiomas,
        handleAtualizarSemestre,
        handleAtualizarCurriculo,
        processarEnvio,
        setModalErroAberta,
        modalErroAberta,
        errosJson,
    } = useFormularioQualificacao(rota, state,step);
    
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
                            legenda="Idiomas e Proficiência(Opcional)"
                            selecionados={idiomaFomartado}
                            atualizar={handleAtualizarIdiomas}
                            opcoes={listaIdiomas}
                            obrigatorio={false}
                        />
                    </div>

                    { rota === 'voluntario-global' && <InputTexto 
                            id="curso" 
                            legenda="Qual seu curso?(Opcional)" 
                            valor={curso} 
                            atualizar={(e: any) => setCurso(e.target.value)} 
                            error={erroCurso} 
                            obrigatorio={false}
                        />}

                    <InputAutoComplete 
                            id="semestre-curso"
                            legenda="Em que semestre se encontra?(Opicional)" 
                            opcoes={listaSemestres} 
                            valor={semestreSelecionados} 
                            atualizar={handleAtualizarSemestre} 
                            obrigatorio={false}
                        />

                    <InputAnexoPdf
                        id="anexoPdf"
                        legenda="Anexe seu Curriculo em PDF"
                        arquivo={anexoPdf}
                        atualizar={handleAtualizarCurriculo}
                        tamanhoMaximoMb={5}
                        obrigatorio
                    />

                    <ButtonConfirmar 
                        texto="Cadastrar" 
                        aoClicar={processarEnvio} 
                        type="button" 
                    />
                </div>
            )} 

            {/* Loaders */}
            <LoadSpinner aberta={carregandoEnvio} />

            <ModalErroConexao 
                aberta={modalErroConexaoAberta} 
                tipo={tipoErroConexao}
                aoTentarNovamente={() => window.parent.location.reload()} 
            />

             <ModalErro 
                aberta={modalErroAberta} 
                titulo="Dados incorretos." 
                erros={errosJson} 
                aoFechar={() => setModalErroAberta(false)} 
            />
        </div>
    );
};

export default FormularioQualificacao;
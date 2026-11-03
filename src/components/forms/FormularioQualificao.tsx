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

import ModalConfirmacao from '../modal/ModalConfirmacao';
import ModalSucesso from '../modal/ModalSucesso';
import ModalErro from '../modal/ModalErro';

import LoadSpinner from '../loading/LoadSpinner';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';

import { useFormularioQualificacao } from '../../hook/useFormularioQualificacao';

import type { FormularioProps } from '../../types/componentes';

/**
 * Segunda tela do fluxo de cadastro.
 *
 * Os idiomas, semestre, curso, área, nível e currículo são complementos do
 * cadastro inicial. A maior parte deles é opcional; por isso esta tela pode
 * concluir diretamente ou abrir um resumo, dependendo do que foi preenchido.
 */
const FormularioQualificacao = ({ rota, state,step }: FormularioProps) => {
    const {
        curso,setCurso,erroCurso,semestreSelecionado,areaAtuacaoSelecionada,nivelAtuacaoSelecionado,
        anexoPdf,
        listaIdiomas,listaSemestres,listaAreaAtuacao,listaNivelMercado,
        modalErroConexaoAberta,tipoErroConexao,
        carregandoEnvio,
        carregandoMetadados,
        idiomaFormatado,
        handleAtualizarIdiomas,
        handleAtualizarSemestre,
        handleAtualizarCurriculo,
        handleAtualizarAreaAtuacao,
        handleAtualizarNivelAtuacao,
        validarEProcessar,
        setModalErroAberta,
        setModalErroConexaoAberta,
        setModalSucessoAberta,
        modalSucessoQualificaco,
        modalErroAberta,
        modalSucessoAberta,
        errosJson,
        atualizarDadosQualificacao,
        dadosResumo,
        fecharModalSucessoQualificacao,
    } = useFormularioQualificacao(rota, state,step);
    
    return (
        <div className="relative">
            {/* Esqueleto de carregamento exibido enquanto metadados são buscados */}
            <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[1, 1]} />
            {!carregandoMetadados && (
                <div id="meuFormQuali" className="flex flex-col gap-4">
                    
                    {/* Idiomas: o hook converte os objetos escolhidos para nomes e IDs do payload. */}
                    <div className="flex flex-col">
                        <InputMultiSelectIdiomas 
                            id="idiomas"
                            legenda="Idiomas e Proficiência(Opcional)"
                            selecionados={idiomaFormatado}
                            atualizar={handleAtualizarIdiomas}
                            opcoes={listaIdiomas}
                            obrigatorio={false}
                        />
                    </div>

                    {/* Curso só faz sentido para o fluxo de voluntário global. */}
                    { rota === 'voluntario-global' && <InputTexto 
                            id="curso" 
                            legenda="Qual seu curso?(Opcional)" 
                            valor={curso} 
                            atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setCurso(e.target.value)} 
                            error={erroCurso} 
                            obrigatorio={false}
                        />}

                    {/* Talento e professor usam dados profissionais em vez do campo de curso. */}
                    {['talento-global','professor-global'].includes(rota) && (
                        <>

                            <InputAutoComplete 
                                id="area-atuacao"
                                legenda="Qual sua Área de Atuação?(Opicional)" 
                                opcoes={listaAreaAtuacao} 
                                valor={areaAtuacaoSelecionada} 
                                atualizar={handleAtualizarAreaAtuacao} 
                                obrigatorio={false}
                            />

                            <InputAutoComplete 
                                id="nivel-atuacao"
                                legenda="Qual seu Nivel de Atuação no mercado?(Opicional)" 
                                opcoes={listaNivelMercado} 
                                valor={nivelAtuacaoSelecionado} 
                                atualizar={handleAtualizarNivelAtuacao} 
                                obrigatorio={false}
                            />

                        </>
                    )}

                    <InputAutoComplete 
                            id="semestre-curso"
                            legenda="Em que semestre se encontra?(Opicional)" 
                            opcoes={listaSemestres} 
                            valor={semestreSelecionado} 
                            atualizar={handleAtualizarSemestre} 
                            obrigatorio={false}
                        />

                    <InputAnexoPdf
                        id="anexoPdf"
                        legenda="Anexe seu Curriculo em PDF"
                        arquivo={anexoPdf}
                        atualizar={handleAtualizarCurriculo}
                        tamanhoMaximoMb={5}
                        obrigatorio={false}
                    />

                    <ButtonConfirmar 
                        texto="Cadastrar" 
                        aoClicar={validarEProcessar} 
                        type="button" 
                    />
                </div>
            )} 

            {/* Loaders */}
            <LoadSpinner aberta={carregandoEnvio} />

            <ModalConfirmacao
                aberta={modalSucessoAberta} 
                titulo="Confirme" 
                resumoDados={dadosResumo} 
                aoConfirmar={atualizarDadosQualificacao} 
                aoEditar={() => setModalSucessoAberta(false)} 
            />

            <ModalErro
                aberta={modalErroAberta || modalErroConexaoAberta}
                tipo={modalErroConexaoAberta ? tipoErroConexao : 'validacao'}
                erros={errosJson}
                aoFechar={() => {
                    setModalErroAberta(false);
                    setModalErroConexaoAberta(false);
                }}
                aoTentarNovamente={() => window.parent.location.reload()}
            />

            <ModalSucesso
                aberta={modalSucessoQualificaco}
                tipo="qualificacao"
                aoFechar={fecharModalSucessoQualificacao}
            />
        </div>
    );
};

export default FormularioQualificacao;
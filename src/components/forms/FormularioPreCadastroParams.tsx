"use client";

/**
 * @file FormularioPreCadastroParams.tsx
 * @description Componente de formulário simplificado para pré-cadastro de leads AIESEC.
 * Renderiza os inputs, listas dinâmicas e modais consumindo os parâmetros do hook.
 */

import React from 'react';
import InputTexto from '../ui/input/InputTexto';
import InputSenha from '../ui/input/InputSenha';
import InputData from '../ui/input/InputData';
import InputDinamico from '../ui/input/InputDinamico';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';

import ModalErro from '../modal/ModalErro';
import ModalSucesso from '../modal/ModalSucesso';
import ModalErroConexao from '../modal/ModalErroConexao';
import ModalSucessoCadastro from '../modal/ModalSucessoCadastro';
import ModalConflito from '../modal/ModalConflito';
import LoadSpinner from '../loading/LoadSpinner';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';

import { useFormularioPreCadastro } from '../../hook/useFormularioPreCadastro';

import type { FormularioProps } from '../../types/componentes';

/**
 * Formulário de pré-cadastro simplificado ativado por parâmetros.
 */
const FormularioPreCadastroParams = ({ rota, state, step, params }: FormularioProps) => {
    const {
        nome, setNome,
        sobrenome, setSobrenome,
        senha, setSenha,
        dataNascimento, setDataNascimento,
        emails,
        telefones,
        termoLGPD, setTermoLGPD,

        opcoesEmail, opcoesTelefone, tituloTermoLGPD, descricaoTermoLGPD,

        carregandoMetadados, carregandoEnvio,
        modalErroAberta, setModalErroAberta,
        modalErroConexaoAberta, modalConflitoAberta, setModalConflitoAberta,
        modalSucessoAberta, setModalSucessoAberta,
        modalSucessoCadastroAberta,
        tipoErroConexao, errosJson, dadosResumo, dataConflito,

        erroNome, erroSobrenome, erroSenha, erroDataNascimento,
        erroEmail, erroTelefone, erroTermoLGPD,

        validarEProcessar,
        handleAdicionarEmail, handleRemoverEmail, handleAtualizarTipoEmail, handleAtualizarValorEmail,
        handleAdicionarTelefone, handleRemoverTelefone, handleAtualizarTipoTelefone, handleAtualizarValorTelefone,
        fecharModalSucessoCadastro,
        realizarPreCadastro
    } = useFormularioPreCadastro(rota, state, step, params);

    return (
        <div className="relative">
            {/* Esqueleto de carregamento exibido enquanto metadados são buscados */}
            <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[2, 1, 1, 2, 2]} />

            {!carregandoMetadados && (
                <div id="meuForm" className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputTexto
                            id="nome"
                            legenda="Nome"
                            valor={nome}
                            atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                            error={erroNome}
                            obrigatorio
                        />
                        <InputTexto
                            id="sobrenome"
                            legenda="Sobrenome"
                            valor={sobrenome}
                            atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setSobrenome(e.target.value)}
                            error={erroSobrenome}
                            obrigatorio
                        />
                    </div>

                    <InputSenha
                        id="senha"
                        legenda="Definir senha"
                        valor={senha}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
                        error={erroSenha}
                        obrigatorio
                    />

                    <InputData
                        id="dataNascimento"
                        legenda="Data de Nascimento"
                        valor={dataNascimento}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setDataNascimento(e.target.value)}
                        error={erroDataNascimento}
                        obrigatorio
                    />

                    <InputDinamico
                        placeholderInput="E-mail"
                        tituloLabel="Email"
                        tipoInput="email"
                        itens={emails}
                        opcoesTipo={opcoesEmail}
                        aoAdicionar={handleAdicionarEmail}
                        aoRemover={handleRemoverEmail}
                        aoAtualizarTipo={handleAtualizarTipoEmail}
                        aoAtualizarValor={handleAtualizarValorEmail}
                        erros={erroEmail}
                        obrigatorio
                    />

                    <InputDinamico
                        placeholderInput="(99) 9 9999-9999"
                        tituloLabel="Telefone"
                        tipoInput="tel"
                        itens={telefones}
                        opcoesTipo={opcoesTelefone}
                        aoAdicionar={handleAdicionarTelefone}
                        aoRemover={handleRemoverTelefone}
                        aoAtualizarTipo={handleAtualizarTipoTelefone}
                        aoAtualizarValor={handleAtualizarValorTelefone}
                        erros={erroTelefone}
                        obrigatorio
                    />

                    {/* Termo LGPD */}
                    <div className="flex flex-col">
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="termoLGPD"
                                checked={termoLGPD}
                                onChange={(e) => setTermoLGPD(e.target.checked)}
                                className="mt-1"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="termoLGPD" className="text-base font-semibold text-blue-900 cursor-pointer select-none">
                                    {tituloTermoLGPD}
                                </label>
                                {descricaoTermoLGPD && (
                                    <span className="text-sm text-gray-600 mt-1">
                                        {descricaoTermoLGPD}
                                    </span>
                                )}
                            </div>
                        </div>
                        {erroTermoLGPD && <span className="min-h-4 text-xs text-red-500 mt-0.5">{erroTermoLGPD}</span>}
                    </div>

                    <ButtonConfirmar
                        texto="Continuar"
                        aoClicar={validarEProcessar}
                        type="button"
                    />
                </div>
            )}

            {/* Modais e Loaders */}
            <LoadSpinner aberta={carregandoEnvio} />

            <ModalErro
                aberta={modalErroAberta}
                titulo="Dados incorretos."
                erros={errosJson}
                aoFechar={() => setModalErroAberta(false)}
            />

            <ModalSucesso
                aberta={modalSucessoAberta}
                titulo="Confirme"
                resumoDados={dadosResumo}
                aoConfirmar={realizarPreCadastro}
                aoEditar={() => setModalSucessoAberta(false)}
            />

            <ModalSucessoCadastro
                aberta={modalSucessoCadastroAberta}
                senha={senha}
                emailReferencia={emails[0]?.valor || ''}
                aoConcluir={fecharModalSucessoCadastro}
            />

            <ModalErroConexao
                aberta={modalErroConexaoAberta}
                tipo={tipoErroConexao}
                aoTentarNovamente={() => window.parent.location.reload()}
            />

            <ModalConflito aberta={modalConflitoAberta} dadosErro={dataConflito} aoFechar={() => { setModalConflitoAberta(false) }} />
        </div>
    );
};

export default FormularioPreCadastroParams;
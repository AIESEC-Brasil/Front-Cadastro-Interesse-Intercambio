"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Componente de formulário para pré-cadastro de leads AIESEC.
 * Renderiza os inputs, listas dinâmicas e modais consumindo a lógica do custom hook.
 */

import React, { Suspense } from 'react';
import { ChevronDown } from 'lucide-react';
import InputTexto from '../ui/input/InputTexto';
import InputData from '../ui/input/InputData';
import InputDinamico from '../ui/input/InputDinamico';
import InputAutoComplete from '../ui/input/InputAutoComplete';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';

import ModalErro from '../modal/ModalErro';
import ModalConfirmacao from '../modal/ModalConfirmacao';
import ModalSucesso from '../modal/ModalSucesso';
import ModalConflito from '../modal/ModalConflito';
import LoadSpinner from '../loading/LoadSpinner';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';

import { useFormularioPreCadastroB2c } from '../../hook/useFormularioPreCadastroB2c';

const FormularioPreCadastroB2c = () => {
    const {
        nome, setNome,
        sobrenome, setSobrenome,
        dataNascimento, setDataNascimento,
        tag, setTag,
        emails,
        telefones,
        produtoSelecionado,
        origemSelecionada,
        marcarSemUniversidade,
        universidadeSelecionada,
        escritorioSelecionado,
        termoLGPD, setTermoLGPD,

        isOpen, setIsOpen,
        listaProdutos, listaOrigens, listaUniversidades, listaEscritorios,
        opcoesEmail, opcoesTelefone, tituloTermoLGPD, descricaoTermoLGPD,

        carregandoMetadados, carregandoEnvio,
        modalErroAberta, setModalErroAberta,
        modalErroConexaoAberta, setModalErroConexaoAberta, modalConflitoAberta, setModalConflitoAberta,
        modalSucessoAberta, setModalSucessoAberta,
        modalSucessoCadastroAberta,
        tipoErroConexao, errosJson, dadosResumo,
        dataConflito,
        tagCampanha,

        erroNome, erroSobrenome, erroDataNascimento,
        erroEmail, erroTelefone, erroProduto, erroOrigem,
        erroUniversidade, erroEscritorio, erroTermoLGPD,

        validarEProcessar,
        handleAdicionarEmail, handleRemoverEmail, handleAtualizarTipoEmail, handleAtualizarValorEmail,
        handleAdicionarTelefone, handleRemoverTelefone, handleAtualizarTipoTelefone, handleAtualizarValorTelefone,
        handleSelecionarProduto, handleLimparProduto, handleSelecionarUniversidade,
        handleAlternarUniversidade, handleSelecionarEscritorio, handleSelecionarOrigem, fecharModalSucessoCadastro,
        realizarPreCadastro
    } = useFormularioPreCadastroB2c();

    return (
        <div className="relative">
            {/* Esqueleto de carregamento exibido enquanto metadados gerais são buscados */}
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

                    <InputData
                        id="dataNascimento"
                        legenda="Data de Nascimento"
                        valor={dataNascimento}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setDataNascimento(e.target.value)}
                        error={erroDataNascimento}
                        obrigatorio
                    />

                    {/* Inputs dinâmicos com opções assíncronas */}
                    <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                        <InputDinamico
                            placeholderInput="E-mail"
                            tituloLabel="Email"
                            tipoInput="email"
                            itens={emails}
                            maxItens={2}
                            opcoesTipo={opcoesEmail}
                            aoAdicionar={handleAdicionarEmail}
                            aoRemover={handleRemoverEmail}
                            aoAtualizarTipo={handleAtualizarTipoEmail}
                            aoAtualizarValor={handleAtualizarValorEmail}
                            erros={erroEmail}
                            obrigatorio
                        />
                    </Suspense>

                    <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                        <InputDinamico
                            placeholderInput="(99) 9 9999-9999"
                            tituloLabel="Telefone"
                            tipoInput="tel"
                            itens={telefones}
                            maxItens={2}
                            opcoesTipo={opcoesTelefone}
                            aoAdicionar={handleAdicionarTelefone}
                            aoRemover={handleRemoverTelefone}
                            aoAtualizarTipo={handleAtualizarTipoTelefone}
                            aoAtualizarValor={handleAtualizarValorTelefone}
                            erros={erroTelefone}
                            obrigatorio
                        />
                    </Suspense>

                    {/* Seleção de Produto */}
                    <div className="flex flex-col">
                        <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                            <InputAutoComplete
                                id="produto"
                                legenda="Qual Produto de interesse do lead?"
                                opcoes={listaProdutos}
                                valor={produtoSelecionado}
                                atualizar={handleSelecionarProduto}
                                error={erroProduto}
                                obrigatorio
                            />
                        </Suspense>
                    </div>

                    {/* Divisão de Mercado: Universidade ou Escritório */}
                    <div className="flex flex-col">
                        <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                            <InputAutoComplete
                                id="universidade"
                                legenda="Qual a Universidade do Lead?"
                                opcoes={listaUniversidades}
                                valor={universidadeSelecionada}
                                atualizar={handleSelecionarUniversidade}
                                error={erroUniversidade}
                                desabilitado={marcarSemUniversidade}
                                obrigatorio={!marcarSemUniversidade}
                            />
                        </Suspense>

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="semUniversidade"
                                checked={marcarSemUniversidade}
                                onChange={(e) => handleAlternarUniversidade(e.target.checked)}
                            />
                            <label htmlFor="semUniversidade" className="text-base cursor-pointer select-none text-blue-900">
                                A Universidade não está listada ou o Lead não cursa nenhuma
                            </label>
                        </div>

                        {marcarSemUniversidade && (
                            <div className="flex flex-col gap-2 mt-7">
                                <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                                    <InputAutoComplete
                                        id="escritorio"
                                        legenda="Qual AIESEC está realizando o Cadastro?"
                                        opcoes={listaEscritorios}
                                        valor={escritorioSelecionado}
                                        atualizar={handleSelecionarEscritorio}
                                        error={erroEscritorio}
                                        obrigatorio={marcarSemUniversidade}
                                    />
                                </Suspense>
                            </div>
                        )}
                    </div>

                    {/* Origem */}
                    <div className="flex flex-col">
                        <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
                            <InputAutoComplete
                                id="origem"
                                legenda="Qual Meio Utilizado para atração?"
                                opcoes={listaOrigens}
                                valor={origemSelecionada}
                                atualizar={handleSelecionarOrigem}
                                error={erroOrigem}
                                obrigatorio
                            />
                        </Suspense>
                    </div>

                    <InputTexto
                        id="tag"
                        legenda="Tag(Opicional)"
                        valor={tag[0] ?? ''}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setTag([e.target.value])}
                        obrigatorio={false}
                    />

                    <ButtonConfirmar
                        texto="Cadastrar"
                        aoClicar={validarEProcessar}
                        type="button"
                    />
                </div>
            )}

            {/* Modais e Loaders */}
            <LoadSpinner aberta={carregandoEnvio} />

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

            <ModalConfirmacao
                aberta={modalSucessoAberta}
                titulo="Confirme"
                resumoDados={dadosResumo}
                aoConfirmar={realizarPreCadastro}
                aoEditar={() => setModalSucessoAberta(false)}
            />

            <ModalSucesso
                aberta={modalSucessoCadastroAberta}
                tipo="preCadastroB2c"
                aoFechar={fecharModalSucessoCadastro}
            />

            <ModalConflito
                aberta={modalConflitoAberta}
                tipo="b2c"
                dadosErro={dataConflito}
                aoFechar={() => setModalConflitoAberta(false)}
            />
        </div>
    );
};

export default FormularioPreCadastroB2c;
"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Componente de formulário para pré-cadastro de leads AIESEC.
 * Renderiza os inputs, listas dinâmicas e modais consumindo a lógica do custom hook.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import InputTexto from '../ui/input/InputTexto';
import InputSenha from '../ui/input/InputSenha';
import InputData from '../ui/input/InputData';
import InputDinamico from '../ui/input/InputDinamico';
import InputAutoComplete from '../ui/input/InputAutoComplete';
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
 * Primeira etapa do cadastro de interesse.
 *
 * O componente é deliberadamente voltado à renderização: valores, handlers,
 * validação, chamadas de API e estados de modal vêm de `useFormularioPreCadastro`.
 * A universidade e o comitê são alternativas, e o produto só é exibido
 * manualmente para a rota de talento quando não houve pré-seleção automática.
 */
const FormularioPreCadastro = ({ rota, state, step }: FormularioProps) => {
    const {
        nome, setNome,
        sobrenome, setSobrenome,
        senha, setSenha,
        dataNascimento, setDataNascimento,
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
        modalErroConexaoAberta, modalConflitoAberta, setModalConflitoAberta,
        modalSucessoAberta, setModalSucessoAberta,
        modalSucessoCadastroAberta,
        tipoErroConexao, errosJson, dadosResumo, dataConflito,

        erroNome, erroSobrenome, erroSenha, erroDataNascimento,
        erroEmail, erroTelefone, erroProduto, erroOrigem,
        erroUniversidade, erroEscritorio, erroTermoLGPD,

        validarEProcessar,
        handleAdicionarEmail, handleRemoverEmail, handleAtualizarTipoEmail, handleAtualizarValorEmail,
        handleAdicionarTelefone, handleRemoverTelefone, handleAtualizarTipoTelefone, handleAtualizarValorTelefone,
        handleSelecionarProduto, handleLimparProduto, handleSelecionarUniversidade,
        handleAlternarUniversidade, handleSelecionarEscritorio, handleSelecionarOrigem, fecharModalSucessoCadastro,
        realizarPreCadastro
    } = useFormularioPreCadastro(rota, state, step);

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

                    {/* Seleção de Produto */}
                    {rota === 'talento-global' && (
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-sm font-medium text-gray-700">
                                Produto <span className="text-red-500">*</span>
                            </label>

                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-full p-2.5 border rounded-lg bg-white text-gray-900 cursor-pointer flex justify-between items-center ${erroProduto ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
                                    }`}
                            >
                                <span>{produtoSelecionado || "Selecione"}</span>
                                <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isOpen && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden py-2 px-1 space-y-1 max-h-60 overflow-y-auto">
                                    <div
                                        className="px-3 py-2.5 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-700 text-sm"
                                        onClick={handleLimparProduto}
                                    >
                                        Selecione
                                    </div>
                                    {listaProdutos.filter(p => p.nome.toLowerCase().includes("talento global")).map((prod) => (
                                        <div
                                            key={prod.id}
                                            className="px-3 py-2.5 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-900 text-sm"
                                            onClick={() => handleSelecionarProduto(prod.nome, prod.id)}
                                        >
                                            {prod.nome}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {erroProduto && <span className="min-h-4 text-xs text-red-500 mt-0.5">{erroProduto}</span>}
                        </div>
                    )}

                    {/* Divisão de Mercado: Universidade ou Escritório */}
                    <div className="flex flex-col">
                        <InputAutoComplete
                            id="universidade"
                            legenda="Qual sua Universidade?"
                            opcoes={listaUniversidades}
                            valor={universidadeSelecionada}
                            atualizar={handleSelecionarUniversidade}
                            error={erroUniversidade}
                            desabilitado={marcarSemUniversidade}
                            obrigatorio={!marcarSemUniversidade}
                        />

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="semUniversidade"
                                checked={marcarSemUniversidade}
                                onChange={(e) => handleAlternarUniversidade(e.target.checked)}
                            />
                            <label htmlFor="semUniversidade" className="text-base cursor-pointer select-none text-blue-900">
                                Minha universidade não está listada ou não tenho vínculo com nenhum universidade
                            </label>
                        </div>

                        {marcarSemUniversidade && (
                            <div className="flex flex-col gap-2 mt-7">
                                <InputAutoComplete
                                    id="escritorio"
                                    legenda="Qual AIESEC mais próxima?"
                                    opcoes={listaEscritorios}
                                    valor={escritorioSelecionado}
                                    atualizar={handleSelecionarEscritorio}
                                    error={erroEscritorio}
                                    obrigatorio={marcarSemUniversidade}
                                />
                            </div>
                        )}
                    </div>

                    {/* Origem */}
                    <div className="flex flex-col">
                        <InputAutoComplete
                            id="origem"
                            legenda="Como conheceu a AIESEC?"
                            opcoes={listaOrigens}
                            valor={origemSelecionada}
                            atualizar={handleSelecionarOrigem}
                            error={erroOrigem}
                            obrigatorio
                        />
                    </div>

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

export default FormularioPreCadastro;
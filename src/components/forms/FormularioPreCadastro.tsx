"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Formulário com validação restrita. 
 * As propriedades `rota` e `state` definem e controlam respectivamente a rota e a função para mudar o step (ex: state(2)).
 */

import React, { useState, useEffect, useRef } from 'react';

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
import LoadSpinner from '../loading/LoadSpinner';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';

import apiOgxClient from '../../service/clients/apiOgxClient';
import { 
    validarTexto, 
    validarSenha, 
    validarEmail, 
    validarTelefone, 
    validarData 
} from '../../utils/validates';
import { 
    traduzirPalavras, 
    aplicarMascaraTelefone, 
    removerMascaraTelefone, 
    aplicarMascaraData, 
    removerMascaraData 
} from '../../helpers/formatter';

interface OpcaoTipo {
    original: string;
    traduzido: string;
}

interface ItemDinamico {
    tipo: string;
    valor: string;
}

interface ProdutoOpcao {
    id: number | string;
    nome: string;
}

/**
 * Interface de propriedades do componente FormularioPreCadastro.
 * @property {string} rota - Identificador da rota atual (Obrigatório).
 * @property {(step: number | any) => void} state - Função callback para alterar o step/estado no componente pai após o sucesso.
 */
interface FormularioPreCadastroProps {
    rota: string;
    state: (step: number | any) => void;
}

/**
 * Componente principal do formulário de pré-cadastro.
 * 
 * @param {FormularioPreCadastroProps} props - Propriedades obrigatórias do componente.
 * @returns {JSX.Element} O elemento TSX renderizado do formulário.
 */
const FormularioPreCadastro = ({ rota, state }: FormularioPreCadastroProps) => {
    // Estados principais de dados
    const [nome, setNome] = useState<string>('');
    const [sobrenome, setSobrenome] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [dataNascimento, setDataNascimento] = useState<string>('');
    const [isOpen,setIsOpen] = useState<boolean>(false);

    // Estado do Produto (mapeado de metadados salvando { id, nome })
    const [listaProdutos, setListaProdutos] = useState<ProdutoOpcao[]>([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState<string>('');
    const [idProduto, setIdProduto] = useState<number | string>('');
    const [erroProduto, setErroProduto] = useState<string>('');

    // Estados de Divisão de Mercado (com suporte a IDs exigidos pelo InputAutoComplete)
    const [marcarSemUniversidade, setMarcarSemUniversidade] = useState<boolean>(false);
    const [listaUniversidades, setListaUniversidades] = useState<any[]>([]);
    const [listaEscritorios, setListaEscritorios] = useState<any[]>([]);

    const [universidadeSelecionada, setUniversidadeSelecionada] = useState<string>('');
    const [idUniversidade, setIdUniversidade] = useState<number | string>('');

    const [escritorioSelecionado, setEscritorioSelecionado] = useState<string>('');
    const [idEscritorio, setIdEscritorio] = useState<number | string>('');

    // Controle de Carregamento
    const [carregandoMetadados, setCarregandoMetadados] = useState<boolean>(true);
    const [carregandoEnvio, setCarregandoEnvio] = useState<boolean>(false);

    // Dados dinâmicos da API
    const [opcoesEmail, setOpcoesEmail] = useState<OpcaoTipo[]>([]);
    const [opcoesTelefone, setOpcoesTelefone] = useState<OpcaoTipo[]>([]);
    const [emails, setEmails] = useState<ItemDinamico[]>([{ tipo: '', valor: '' }]);
    const [telefones, setTelefones] = useState<ItemDinamico[]>([{ tipo: '', valor: '' }]);

    // Erros de campos persistentes
    const [erroNome, setErroNome] = useState<string>('');
    const [erroSobrenome, setErroSobrenome] = useState<string>('');
    const [erroSenha, setErroSenha] = useState<string[]>([]);
    const [erroDataNascimento, setErroDataNascimento] = useState<string>('');
    const [erroEmail, setErroEmail] = useState<string[]>([]);
    const [erroTelefone, setErroTelefone] = useState<string[]>([]);
    const [erroUniversidade, setErroUniversidade] = useState<string>('');
    const [erroEscritorio, setErroEscritorio] = useState<string>('');

    // Modais
    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [modalErroConexaoAberta, setModalErroConexaoAberta] = useState<boolean>(false);
    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [modalSucessoCadastroAberta, setModalSucessoCadastroAberta] = useState<boolean>(false);
    const [tipoErroConexao, setTipoErroConexao] = useState<'conexao' | 'bug'>('conexao');
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});
    const [dadosResumo, setDadosResumo] = useState<Record<string, any>>({});

    const prevEmailsLen = useRef(emails.length);
    const prevTelefonesLen = useRef(telefones.length);

    useEffect(() => {
        let isMounted = true;

        const carregarDadosIniciais = async () => {
            setCarregandoMetadados(true);
            try {
                const [resMeta, resUni] = await Promise.all([
                    apiOgxClient.get('/new-lead-ogx/metadados'),
                    apiOgxClient.get('/divisao-mercado/universidades'),
                ]);

                const metadados = resMeta?.data;
                if (!isMounted || !Array.isArray(metadados)) return;

                const campoEmail = metadados.find((item: any) => item.external_id === 'email');
                const campoTelefone = metadados.find((item: any) => item.external_id === 'telefone');
                const campoEscritorio = metadados.find((item: any) => item.external_id === 'aiesec-mais-proxima');
                const campoProduto = metadados.find((item: any) => item.external_id === 'produto');

                const ordenar = (opts: string[]) => [...opts].sort((a, b) => a.toLowerCase() === 'other' ? -1 : b.toLowerCase() === 'other' ? 1 : 0);

                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(campoEmail?.options ? ordenar(campoEmail.options) : []),
                    traduzirPalavras(campoTelefone?.options ? ordenar(campoTelefone.options) : [])
                ]);

                const escritorioOpcoes = (campoEscritorio?.options || []).map((data: any) => ({
                    id: data.id,
                    nome: data.text
                }));

                // Mapeamento dinâmico das opções de produto baseando-se no external_id "produto" com estrutura { id, nome: text }
                const produtoOpcoes = (campoProduto?.options || []).map((data: any) => ({
                    id: data.id,
                    nome: data.text
                }));

                if (isMounted) {
                    setOpcoesEmail(emailFormatado);
                    setOpcoesTelefone(telefoneFormatado);
                    setListaUniversidades(resUni?.data.universidades || []);
                    setListaEscritorios(escritorioOpcoes);
                    setListaProdutos(produtoOpcoes);
                    setModalErroConexaoAberta(false);
                }
            } catch (error) {
                console.error("Erro ao carregar metadados ou divisão de mercado:", error);
                if (isMounted) setModalErroConexaoAberta(true);
                setTipoErroConexao('conexao');
            } finally {
                if (isMounted) setCarregandoMetadados(false);
            }
        };

        carregarDadosIniciais();
        return () => { isMounted = false; };
    }, []);

    // Lógica ajustada: Pré-define o produto com base na rota e opções mapeadas do metadado
    useEffect(() => {
        if (listaProdutos.length === 0) return;

        if (rota === 'voluntario-global') {
            const encontrado = listaProdutos.find(p => p.nome.toLowerCase().includes('voluntário global') || p.nome.toLowerCase().includes('voluntario global'));
            if (encontrado) {
                setProdutoSelecionado(encontrado.nome);
                setIdProduto(encontrado.id);
            }
        } else if (rota === 'professor-global') {
            const encontrado = listaProdutos.find(p => p.nome.toLowerCase().includes('professor global'));
            if (encontrado) {
                setProdutoSelecionado(encontrado.nome);
                setIdProduto(encontrado.id);
            }
        }
    }, [rota, listaProdutos]);

    // Validação contínua rigorosa aplicada a todos os campos (estáticos e dinâmicos)
    useEffect(() => {
        if (nome) {
            const eNome = validarTexto(nome, "nome");
            if (!eNome || (eNome.length > 0 && eNome[0] === '')) {
                setErroNome('');
            } else if (eNome && eNome[0]) {
                setErroNome(eNome[0]);
            }
        } 

        if (sobrenome) {
            const eSobrenome = validarTexto(sobrenome, "sobrenome");
            if (!eSobrenome || (eSobrenome.length > 0 && eSobrenome[0] === '')) {
                setErroSobrenome('');
            } else if (eSobrenome && eSobrenome[0]) {
                setErroSobrenome(eSobrenome[0]);
            }
        } 

        if (senha) {
            const eSenha = validarSenha(senha);
            if (!eSenha || eSenha.length === 0) {
                setErroSenha([]);
            } else {
                setErroSenha(eSenha);
            }
        } 

        if (dataNascimento) {
            const eData = validarData(dataNascimento);
            if (!eData || eData.length === 0 || eData[0] === '') {
                setErroDataNascimento('');
            } else if (eData && eData[0]) {
                setErroDataNascimento(eData[0]);
            }
        } 

        if (emails.some(e => e.valor !== '')){
            setErroEmail(validarEmail(emails.map((i) => i.valor)));
        }

        if (telefones.some(t => t.valor !== '')){
            setErroTelefone(validarTelefone(telefones.map((i) => i.valor)));
        }

        if (produtoSelecionado) {
            setErroProduto('');
        }

        if (!marcarSemUniversidade) {
            if (universidadeSelecionada) {
                setErroUniversidade('');
            }
            setErroEscritorio('');
        } else {
            if (escritorioSelecionado) {
                setErroEscritorio('');
            }
            setErroUniversidade('');
        }

        prevEmailsLen.current = emails.length;
        prevTelefonesLen.current = telefones.length;
    }, [nome, sobrenome, senha, dataNascimento, emails, telefones, produtoSelecionado, marcarSemUniversidade, universidadeSelecionada, escritorioSelecionado]);

    const validarEProcessar = async () => {
        setCarregandoEnvio(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const eNome = validarTexto(nome, "nome");
        const eSobrenome = validarTexto(sobrenome, "sobrenome");
        const eSenha = validarSenha(senha);
        const eData = validarData(dataNascimento);

        const errsE = validarEmail(emails.map(i => i.valor));
        const errsT = validarTelefone(telefones.map(i => i.valor));

        const errProd = !produtoSelecionado ? 'Campo obrigatório.' : '';
        const errUni = !marcarSemUniversidade && !universidadeSelecionada ? 'Campo obrigatório.' : '';
        const errEsc = marcarSemUniversidade && !escritorioSelecionado ? 'Campo obrigatório.' : '';

        const temErro = [
            eNome && eNome[0] !== '', 
            eSobrenome && eSobrenome[0] !== '', 
            eSenha && eSenha[0] !== '', 
            eData && eData[0] !== '', 
            errsE.some(e => e !== ''), 
            errsT.some(e => e !== ''),
            Boolean(errProd),
            Boolean(errUni),
            Boolean(errEsc)
        ].some(Boolean);

        if (temErro) {
            const erroJson: any = {};

            if (eNome && eNome.length > 0 && eNome[0] !== '') {
                setErroNome(eNome[0]);
                erroJson.nome = eNome;
            }
            if (eSobrenome && eSobrenome.length > 0 && eSobrenome[0] !== '') {
                setErroSobrenome(eSobrenome[0]);
                erroJson.sobrenome = eSobrenome;
            }
            if (eSenha && eSenha.length > 0 && eSenha[0] !== '') {
                setErroSenha(eSenha);
                erroJson.senha = eSenha;
            }
            if (eData && eData.length > 0 && eData[0] !== '') {
                setErroDataNascimento(eData[0]);
                erroJson["Data de Nascimento"] = eData;
            }

            if (errsE.some(e => e !== '')) {
                setErroEmail(errsE);
                erroJson.email = errsE.filter(e => e !== '');
            }

            if (errsT.some(e => e !== '')) {
                setErroTelefone(errsT);
                erroJson.telefone = errsT.filter(e => e !== '');
            }

            if (errProd) {
                setErroProduto(errProd);
                erroJson.produto = [errProd];
            }

            if (errUni) {
                setErroUniversidade(errUni);
                erroJson.universidade = [errUni];
            }

            if (errEsc) {
                setErroEscritorio(errEsc);
                erroJson.escritorio = [errEsc];
            }

            setErrosJson(erroJson);
            setModalErroAberta(true);
        } else {
            const dataFormatadaParaEnvio = removerMascaraData(dataNascimento);
            const jsonResumo: any = { 
                nome, 
                sobrenome,
                produto: produtoSelecionado,
                idProduto: idProduto,
                "Data de Nascimento": aplicarMascaraData(dataFormatadaParaEnvio.split('-').reverse().join('/')), 
                email: emails.map((e) => e.valor), 
                telefone: telefones.map((t) => t.valor),
            };
            console.log(telefones)
            if (!marcarSemUniversidade){
                jsonResumo.universidade = universidadeSelecionada;
            } else {
                jsonResumo.escritorio = escritorioSelecionado;
            }

            setDadosResumo(jsonResumo);
            setModalSucessoAberta(true);
        }
        setCarregandoEnvio(false);
    };

    return (
        <div className="relative">
            {/* Esqueleto de carregamento */}
            <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[2, 1, 1, 2, 2]} />

            {/* Formulário visível apenas após sucesso na carga dos metadados */}
            {!carregandoMetadados && !modalErroConexaoAberta && (
                <div id="meuForm" className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputTexto 
                            id="nome" 
                            legenda="Nome" 
                            valor={nome} 
                            atualizar={(e: any) => setNome(e.target.value
                                .split(' ')
                                .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' '))
                            } 
                            error={erroNome} 
                            obrigatorio 
                        />
                        <InputTexto 
                            id="sobrenome" 
                            legenda="Sobrenome" 
                            valor={sobrenome} 
                            atualizar={(e: any) => setSobrenome(e.target.value
                                .split(' ')
                                .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' '))
                            } 
                            error={erroSobrenome} 
                            obrigatorio 
                        />
                    </div>

                    <InputSenha 
                        id="senha" 
                        legenda="Definir senha" 
                        valor={senha} 
                        atualizar={(e: any) => setSenha(e.target.value)} 
                        error={erroSenha} 
                        obrigatorio 
                    />

                    <InputData 
                        id="dataNascimento" 
                        legenda="Data de Nascimento" 
                        valor={dataNascimento} 
                        atualizar={(e: any) => setDataNascimento(aplicarMascaraData(e.target.value))} 
                        error={erroDataNascimento} 
                        obrigatorio 
                    />

                    <InputDinamico 
                        placeholderInput="E-mail" 
                        tituloLabel="Email" 
                        tipoInput="email" 
                        itens={emails} 
                        opcoesTipo={opcoesEmail} 
                        aoAdicionar={() => setEmails([...emails, { tipo: 'other', valor: '' }])} 
                        aoRemover={(i) => setEmails(emails.filter((_, idx) => idx !== i))} 
                        aoAtualizarTipo={(i, v) => setEmails(emails.map((item, idx) => idx === i ? {...item, tipo: v} : item))} 
                        aoAtualizarValor={(i, v) => setEmails(emails.map((item, idx) => idx === i ? {...item, valor: v} : item))} 
                        erros={erroEmail} 
                        obrigatorio 
                    />

                    <InputDinamico 
                        placeholderInput="(99) 9 9999-9999" 
                        tituloLabel="Telefone" 
                        tipoInput="tel" 
                        itens={telefones} 
                        opcoesTipo={opcoesTelefone} 
                        aoAdicionar={() => setTelefones([...telefones, { tipo: 'other', valor: '' }])} 
                        aoRemover={(i) => setTelefones(telefones.filter((_, idx) => idx !== i))} 
                        aoAtualizarTipo={(i, v) => setTelefones(telefones.map((item, idx) => idx === i ? {...item, tipo: v} : item))} 
                        aoAtualizarValor={(i, v) => setTelefones(telefones.map((item, idx) => idx === i ? {...item, valor: aplicarMascaraTelefone(v)} : item))} 
                        erros={erroTelefone} 
                        obrigatorio 
                    />

                    {rota === 'talento-global' && (
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-sm font-medium text-gray-700">
                                Produto <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Botão que simula o select */}
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-full p-2.5 border rounded-lg bg-white text-gray-900 cursor-pointer flex justify-between items-center ${
                                    erroProduto ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
                                }`}
                            >
                                <span>{produtoSelecionado || "Selecione"}</span>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>

                            {/* Menu customizado com opções em lista */}
                            {isOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden py-2 px-1 space-y-1">
                                    <div
                                        className="px-3 py-2.5 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-700"
                                        onClick={() => {
                                            setProdutoSelecionado("");
                                            setIdProduto("");
                                            setIsOpen(false);
                                        }}
                                    >
                                        Selecione
                                    </div>
                                    {listaProdutos.filter(p => p.nome.toLowerCase().includes("talento global")).map((prod) => (
                                        <div
                                            key={prod.id}
                                            className="px-3 py-2.5 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-900"
                                            onClick={() => {
                                                setProdutoSelecionado(prod.nome);
                                                setIdProduto(prod.id);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {prod.nome}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {erroProduto && <span className="text-xs text-red-500 mt-1">{erroProduto}</span>}
                        </div>
                    )}

                    {/* Divisão de Mercado adaptada ao contrato do InputAutoComplete */}
                    <div className="flex flex-col gap-2">
                        <InputAutoComplete 
                            id="universidade"
                            legenda="Universidade" 
                            opcoes={listaUniversidades} 
                            valor={universidadeSelecionada} 
                            atualizar={(nomeSel, idSel) => {
                                setUniversidadeSelecionada(nomeSel);
                                setIdUniversidade(idSel);
                                if (nomeSel) setErroUniversidade('');
                            }} 
                            error={erroUniversidade}
                            desabilitado={marcarSemUniversidade}
                            obrigatorio={!marcarSemUniversidade}
                        />

                        <div className="flex items-center gap-2 mt-1">
                            <input 
                                type="checkbox" 
                                id="semUniversidade" 
                                checked={marcarSemUniversidade} 
                                onChange={(e) => {
                                    setMarcarSemUniversidade(e.target.checked);
                                    if (e.target.checked) {
                                        setUniversidadeSelecionada('');
                                        setIdUniversidade('');
                                        setErroUniversidade('');
                                    } else {
                                        setEscritorioSelecionado('');
                                        setIdEscritorio('');
                                        setErroEscritorio('');
                                    }
                                }} 
                            />
                            <label htmlFor="semUniversidade" className="text-sm cursor-pointer select-none text-blue-600">
                                Minha universidade não está listada ou não tenho vínculo com nenhum universidade
                            </label>
                        </div>

                        {marcarSemUniversidade && (
                            <InputAutoComplete 
                                id="escritorio"
                                legenda="Qual AIESEC mais próxima" 
                                opcoes={listaEscritorios} 
                                valor={escritorioSelecionado} 
                                atualizar={(nomeSel, idSel) => {
                                    setEscritorioSelecionado(nomeSel);
                                    setIdEscritorio(idSel);
                                    if (nomeSel) setErroEscritorio('');
                                }} 
                                error={erroEscritorio}
                                obrigatorio={marcarSemUniversidade}
                            />
                        )}
                    </div>

                    <ButtonConfirmar 
                        texto="Continuar" 
                        aoClicar={validarEProcessar} 
                        type="button" 
                    />
                </div>
            )}

            {/* Modais */}
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
                aoConfirmar={() => {
                    setModalSucessoAberta(false);
                    setModalSucessoCadastroAberta(true);
                    if (typeof state === 'function') {
                        state(2);
                    }
                }} 
                aoEditar={() => setModalSucessoAberta(false)} 
            />

            <ModalSucessoCadastro 
                aberta={modalSucessoCadastroAberta}
                senha={senha}
                emailReferencia={emails[0]?.valor || ''}
                aoConcluir={() => setModalSucessoCadastroAberta(false)}
            />

            {/* Modal de Conexão com disparador de reload (suportando iframe via parent) */}
            <ModalErroConexao 
                aberta={modalErroConexaoAberta} 
                tipo={tipoErroConexao}
                aoTentarNovamente={() => window.parent.location.reload()} 
            />
        </div>
    );
};

export default FormularioPreCadastro;
"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Formulário completo com validação, máscara de telefone, carregamento assíncrono de metadados e tratamento robusto de erros de conexão.
 */

import React, { useState, useEffect } from 'react';

import InputTexto from '../ui/input/InputTexto';
import InputSenha from '../ui/input/InputSenha';
import InputDinamico from '../ui/input/InputDinamico';
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
    aplicarMascaraTelefone, 
    removerMascaraTelefone 
} from '../../utils/validates';
import { traduzirPalavras } from '../../helpers/formatter';

interface OpcaoTipo {
    original: string;
    traduzido: string;
}

interface ItemDinamico {
    tipo: string;
    valor: string;
}

const FormularioPreCadastro = () => {
    // Estados principais de dados
    const [nome, setNome] = useState<string>('');
    const [sobrenome, setSobrenome] = useState<string>('');
    const [senha, setSenha] = useState<string>('');

    // Controle de Carregamento
    const [carregandoMetadados, setCarregandoMetadados] = useState<boolean>(true);
    const [carregandoEnvio, setCarregandoEnvio] = useState<boolean>(false);

    // Dados dinâmicos da API
    const [opcoesEmail, setOpcoesEmail] = useState<OpcaoTipo[]>([]);
    const [opcoesTelefone, setOpcoesTelefone] = useState<OpcaoTipo[]>([]);
    const [emails, setEmails] = useState<ItemDinamico[]>([{ tipo: '', valor: '' }]);
    const [telefones, setTelefones] = useState<ItemDinamico[]>([{ tipo: '', valor: '' }]);

    // Erros de campos
    const [erroNome, setErroNome] = useState<string>('');
    const [erroSobrenome, setErroSobrenome] = useState<string>('');
    const [erroSenha, setErroSenha] = useState<string[]>([]);
    const [erroEmail, setErroEmail] = useState<string[]>([]);
    const [erroTelefone, setErroTelefone] = useState<string[]>([]);

    // Modais
    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [modalErroConexaoAberta, setModalErroConexaoAberta] = useState<boolean>(false);
    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [modalSucessoCadastroAberta, setModalSucessoCadastroAberta] = useState<boolean>(false);
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});
    const [dadosResumo, setDadosResumo] = useState<Record<string, any>>({});

    useEffect(() => {
        let isMounted = true;

        const carregarMetadados = async () => {
            setCarregandoMetadados(true);
            try {
                const response = await apiOgxClient.get('/new-lead-ogx/metadados');
                const metadados = response?.data;
                
                if (!isMounted || !Array.isArray(metadados)) return;

                const campoEmail = metadados.find((item: any) => item.external_id === 'email');
                const campoTelefone = metadados.find((item: any) => item.external_id === 'telefone');

                const ordenar = (opts: string[]) => [...opts].sort((a, b) => a.toLowerCase() === 'other' ? -1 : b.toLowerCase() === 'other' ? 1 : 0);
                
                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(campoEmail?.options ? ordenar(campoEmail.options) : []),
                    traduzirPalavras(campoTelefone?.options ? ordenar(campoTelefone.options) : [])
                ]);

                if (isMounted) {
                    setOpcoesEmail(emailFormatado);
                    setOpcoesTelefone(telefoneFormatado);
                    setModalErroConexaoAberta(false);
                }
            } catch (error) {
                console.error("Erro ao carregar metadados:", error);
                if (isMounted) setModalErroConexaoAberta(true);
            } finally {
                if (isMounted) setCarregandoMetadados(false);
            }
        };

        carregarMetadados();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const eNome = nome ? validarTexto(nome, "nome") : null;
        const eSobrenome = sobrenome ? validarTexto(sobrenome, "sobrenome") : null;
        const eSenha = senha ? validarSenha(senha) : null;

        setErroNome(eNome && eNome[0] ? eNome[0] : '');
        setErroSobrenome(eSobrenome && eSobrenome[0] ? eSobrenome[0] : '');
        setErroSenha(eSenha || []);

        const checkErros = (items: ItemDinamico[], validator: any) => {
            const temDados = items.some(i => i.valor.trim() !== '');
            return temDados ? items.map(i => i.valor.trim() ? (validator([i.valor])[0] || '') : '') : [];
        };

        setErroEmail(checkErros(emails, validarEmail));
        setErroTelefone(checkErros(telefones, validarTelefone));
    }, [nome, sobrenome, senha, emails, telefones]);

    const validarEProcessar = async () => {
        setCarregandoEnvio(true);
        // Pequeno delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 1000));

        const eNome = validarTexto(nome, "nome");
        const eSobrenome = validarTexto(sobrenome, "sobrenome");
        const eSenha = validarSenha(senha);
        const errsE = emails.map(i => validarEmail([i.valor])[0] || '');
        const errsT = telefones.map(i => validarTelefone([i.valor])[0] || '');

        const temErro = [eNome, eSobrenome, eSenha, errsE, errsT].some(e => e && e.length > 0 && e[0] !== '');

        if (temErro) {
            setErrosJson({ 
                nome: eNome || [], sobrenome: eSobrenome || [], senha: eSenha || [], 
                email: errsE.filter(Boolean), telefone: errsT.filter(Boolean) 
            });
            setModalErroAberta(true);
        } else {
            setDadosResumo({ nome, sobrenome, email: emails, telefone: telefones });
            setModalSucessoAberta(true);
        }
        setCarregandoEnvio(false);
    };

    return (
        <div className="relative">
            {/* Esqueleto de carregamento */}
            <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[2, 1, 2, 2]} />

            {/* Formulário visível apenas após sucesso na carga dos metadados */}
            {!carregandoMetadados && !modalErroConexaoAberta && (
                <div id="meuForm" className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputTexto id="nome" legenda="Nome" valor={nome} atualizar={(e: any) => setNome(e.target.value)} error={erroNome} obrigatorio />
                        <InputTexto id="sobrenome" legenda="Sobrenome" valor={sobrenome} atualizar={(e: any) => setSobrenome(e.target.value)} error={erroSobrenome} obrigatorio />
                    </div>
                    
                    <InputSenha id="senha" legenda="Definir senha" valor={senha} atualizar={(e: any) => setSenha(e.target.value)} error={erroSenha} obrigatorio />
                    
                    <InputDinamico placeholderInput="E-mail" tituloLabel="Email" tipoInput="email" itens={emails} opcoesTipo={opcoesEmail} aoAdicionar={() => setEmails([...emails, { tipo: '', valor: '' }])} aoRemover={(i) => setEmails(emails.filter((_, idx) => idx !== i))} aoAtualizarTipo={(i, v) => setEmails(emails.map((item, idx) => idx === i ? {...item, tipo: v} : item))} aoAtualizarValor={(i, v) => setEmails(emails.map((item, idx) => idx === i ? {...item, valor: v} : item))} erros={erroEmail} obrigatorio />
                    
                    <InputDinamico placeholderInput="(99) 9 9999-9999" tituloLabel="Telefone" tipoInput="tel" itens={telefones} opcoesTipo={opcoesTelefone} aoAdicionar={() => setTelefones([...telefones, { tipo: '', valor: '' }])} aoRemover={(i) => setTelefones(telefones.filter((_, idx) => idx !== i))} aoAtualizarTipo={(i, v) => setTelefones(telefones.map((item, idx) => idx === i ? {...item, tipo: v} : item))} aoAtualizarValor={(i, v) => setTelefones(telefones.map((item, idx) => idx === i ? {...item, valor: aplicarMascaraTelefone(v)} : item))} erros={erroTelefone} obrigatorio />
                    
                    <ButtonConfirmar texto="Continuar" aoClicar={validarEProcessar} type="button" />
                </div>
            )}

            {/* Modais */}
            <LoadSpinner aberta={carregandoEnvio} />
            <ModalErro aberta={modalErroAberta} titulo="Dados incorretos." erros={errosJson} aoFechar={() => setModalErroAberta(false)} />
            <ModalSucesso 
                aberta={modalSucessoAberta} 
                titulo="Confirme" 
                resumoDados={dadosResumo} 
                aoConfirmar={() => {
                    setModalSucessoAberta(false);
                    setModalSucessoCadastroAberta(true);
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
                aoTentarNovamente={() => window.parent.location.reload()} 
            />
        </div>
    );
};

export default FormularioPreCadastro;
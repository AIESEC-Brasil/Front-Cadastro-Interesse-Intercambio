"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Formulário limpo: sem valores pré-setados, populado via API.
 */

import React, { useState, useEffect } from 'react';
import styles from "./style.module.css";

import InputTexto from '../ui/input/InputTexto';
import InputSenha from '../ui/input/InputSenha';
import InputDinamico from '../ui/input/InputDinamico';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';

import ModalErro from '../modal/ModalErro';
import ModalSucesso from '../modal/ModalSucesso';

import apiOgxClient from '../../service/clients/apiOgxClient';
import { validarTexto, validarSenha } from '../../utils/validates';
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
    const [nome, setNome] = useState<string>('');
    const [sobrenome, setSobrenome] = useState<string>('');
    const [senha, setSenha] = useState<string>('');

    const [opcoesEmail, setOpcoesEmail] = useState<OpcaoTipo[]>([]);
    const [opcoesTelefone, setOpcoesTelefone] = useState<OpcaoTipo[]>([]);

    const [emails, setEmails] = useState<ItemDinamico[]>([{ tipo: '', valor: '' }]);
    const [telefones, setTelefones] = useState<ItemDinamico[]>([{ tipo: '', valor: '' }]);

    const [erroNome, setErroNome] = useState<string>('');
    const [erroSobrenome, setErroSobrenome] = useState<string>('');
    const [erroSenha, setErroSenha] = useState<string[]>([]);

    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});

    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [dadosResumo, setDadosResumo] = useState<Record<string, any>>({});

    useEffect(() => {
        let isMounted = true;

        // Função auxiliar para ordenar deixando o 'other' em primeiro
        const ordenarOpcoes = (options: string[]) => {
            return [...options].sort((a, b) => {
                if (a.toLowerCase() === 'other') return -1;
                if (b.toLowerCase() === 'other') return 1;
                return 0;
            });
        };

        const carregarMetadados = async () => {
            try {
                const response = await apiOgxClient.get('/new-lead-ogx/metadados');
                const metadados = response.data?.data;

                if (!isMounted || !Array.isArray(metadados)) return;

                const campoEmail = metadados.find((item: any) => item.external_id === 'email');
                const campoTelefone = metadados.find((item: any) => item.external_id === 'telefone');

                const optionsEmailOrdenadas = campoEmail?.options ? ordenarOpcoes(campoEmail.options) : [];
                const optionsTelefoneOrdenadas = campoTelefone?.options ? ordenarOpcoes(campoTelefone.options) : [];

                const [emailFormatado, telefoneFormatado] = await Promise.all([
                    traduzirPalavras(optionsEmailOrdenadas),
                    traduzirPalavras(optionsTelefoneOrdenadas)
                ]);

                if (isMounted) {
                    setOpcoesEmail(emailFormatado);
                    setOpcoesTelefone(telefoneFormatado);
                }
            } catch (error) {
                console.error("Erro ao carregar metadados:", error);
            }
        };

        carregarMetadados();

        return () => {
            isMounted = false;
        };
    }, []);

    const adicionarEmail = () => setEmails(prev => [...prev, { tipo: '', valor: '' }]);
    const removerEmail = (idx: number) => setEmails(prev => prev.filter((_, i) => i !== idx));
    const atualizarEmail = (idx: number, field: keyof ItemDinamico, val: string) => {
        setEmails(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };

    const adicionarTelefone = () => setTelefones(prev => [...prev, { tipo: '', valor: '' }]);
    const removerTelefone = (idx: number) => setTelefones(prev => prev.filter((_, i) => i !== idx));
    const atualizarTelefone = (idx: number, field: keyof ItemDinamico, val: string) => {
        setTelefones(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };

    const validarEProcessar = async () => {
        let temErro = false;
        const listaErros: Record<string, string[]> = {};

        const eNome = validarTexto(nome, "nome");
        const eSobrenome = validarTexto(sobrenome, "sobrenome");
        const eSenha = validarSenha(senha);

        if (eNome?.[0]) { setErroNome(eNome[0]); listaErros.nome = eNome; temErro = true; }
        if (eSobrenome?.[0]) { setErroSobrenome(eSobrenome[0]); listaErros.sobrenome = eSobrenome; temErro = true; }
        if (eSenha?.[0]) { setErroSenha(eSenha); listaErros.senha = eSenha; temErro = true; }

        if (temErro) { setErrosJson(listaErros); setModalErroAberta(true); return; }

        // Formatação exata exigida pelo contrato para e-mail e telefone
        const emailsFormatados = emails.map(item => ({
            email: item.valor,
            tipo: item.tipo
        }));

        const telefonesFormatados = telefones.map(item => ({
            numero: item.valor,
            tipo: item.tipo
        }));

        const payloadFinal = {
            autorizacao: 1,
            comite: {
                id: 32,
                nome: "Recife(PE)"
            },
            dataNascimento: "2019-08-24T14:15:22Z",
            email: emailsFormatados,
            meio: {
                id: 11,
                nome: "ads"
            },
            nome: nome,
            origem: {
                id: 77,
                nome: "atados"
            },
            produto: {
                id_expa: 7,
                id_podio: 1,
                titulo: "voluntario global"
            },
            senha: senha,
            sobrenome: sobrenome,
            tag: [
                "string"
            ],
            telefone: telefonesFormatados,
            universidade: {
                id: 102,
                nome: "Universidade de São Paulo"
            }
        };

        setDadosResumo(payloadFinal);
        setModalSucessoAberta(true);
    };

    return (
        <>
            <div id="meuForm" className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputTexto id="nome" legenda="Nome" valor={nome} atualizar={(e: any) => setNome(e.target.value)} error={erroNome} obrigatorio />
                    <InputTexto id="sobrenome" legenda="Sobrenome" valor={sobrenome} atualizar={(e: any) => setSobrenome(e.target.value)} error={erroSobrenome} obrigatorio />
                </div>

                <InputSenha id="senha" legenda="Definir senha" valor={senha} atualizar={(e: any) => setSenha(e.target.value)} error={erroSenha} obrigatorio />

                <InputDinamico
                    tituloLabel="Email"
                    placeholderInput="Email"
                    tipoInput="email"
                    itens={emails}
                    opcoesTipo={opcoesEmail}
                    aoAdicionar={adicionarEmail}
                    aoRemover={removerEmail}
                    aoAtualizarTipo={(i, v) => atualizarEmail(i, 'tipo', v)}
                    aoAtualizarValor={(i, v) => atualizarEmail(i, 'valor', v)}
                    obrigatorio
                />

                <InputDinamico
                    tituloLabel="Telefone"
                    placeholderInput="Telefone"
                    tipoInput="tel"
                    itens={telefones}
                    opcoesTipo={opcoesTelefone}
                    aoAdicionar={adicionarTelefone}
                    aoRemover={removerTelefone}
                    aoAtualizarTipo={(i, v) => atualizarTelefone(i, 'tipo', v)}
                    aoAtualizarValor={(i, v) => atualizarTelefone(i, 'valor', v)}
                    obrigatorio
                />
                
                <ButtonConfirmar texto="Avançar" aoClicar={validarEProcessar} type="button" />
            </div>

            <ModalErro aberta={modalErroAberta} titulo="Dados incorretos." erros={errosJson} aoFechar={() => setModalErroAberta(false)} />
            <ModalSucesso aberta={modalSucessoAberta} titulo="Confirme" resumoDados={dadosResumo} aoConfirmar={() => setModalSucessoAberta(false)} aoEditar={() => setModalSucessoAberta(false)} />
        </>
    );
};

export default FormularioPreCadastro;
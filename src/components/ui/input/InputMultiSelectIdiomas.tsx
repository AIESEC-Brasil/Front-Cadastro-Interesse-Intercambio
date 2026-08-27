"use client";

/**
 * @file InputMultiSelectIdiomas.tsx
 * @description Componente de múltipla seleção para idiomas sem container desnecessário no input.
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from "./style.module.css";
import type { LanguageMultiSelectProps } from '../../../type/components';

/**
 * Permite selecionar níveis de idioma sem repetir o mesmo idioma-base.
 *
 * Por exemplo, depois de escolher “Inglês - Básico”, as demais opções de
 * inglês são ocultadas, embora outros idiomas continuem disponíveis. O estado
 * externo recebe a lista completa de objetos selecionados.
 */
const InputMultiSelectIdiomas: React.FC<LanguageMultiSelectProps> = ({
    id,
    legenda,
    selecionados,
    atualizar,
    opcoes,
    error,
    obrigatorio = false,
    placeholder = " ",
    desabilitado = false
}) => {
    const [valorInput, setValorInput] = useState<string>("");
    const [ativo, setAtivo] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Função auxiliar para extrair o idioma base (ex: "Inglês - Básico" vira "inglês")
    const obterIdiomaBase = (nome: string) => {
        return nome.split('-')[0].trim().toLowerCase();
    };

    const idiomasBaseSelecionados = selecionados.map(item => obterIdiomaBase(item.nome));

    // Filtra as opções baseadas no texto digitado E remove os já escolhidos/mesmo idioma base
    const opcoesFiltradas = opcoes.filter((item) => {
        const idiomaBase = obterIdiomaBase(item.nome);
        const jaSelecionado = selecionados.some(s => s.id === item.id);
        const mesmoIdiomaEscolhido = idiomasBaseSelecionados.includes(idiomaBase);

        if (jaSelecionado || mesmoIdiomaEscolhido) return false;

        return item.nome.toLowerCase().includes(valorInput.toLowerCase());
    });

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAtivo(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selecionarOpcao = (opcao: LanguageMultiSelectProps['opcoes'][number]) => {
        atualizar([...selecionados, opcao]);
        setValorInput("");
        setAtivo(false);
    };

    const removerOpcao = (idParaRemover: number | string) => {
        const novosSelecionados = selecionados.filter(item => item.id !== idParaRemover);
        atualizar(novosSelecionados);
    };

    return (
        <div 
            className={`${styles.inputGroup} ${error ? styles.hasError : ''} relative w-full`} 
            ref={containerRef}
        >
            {/* Input e Label diretamente no container principal (sem div embrulhando) */}
            <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
                <input
                    id={id}
                    name={id}
                    type="text"
                    value={valorInput}
                    disabled={desabilitado}
                    required={obrigatorio && selecionados.length === 0}
                    onChange={(e) => {
                        setValorInput(e.target.value);
                        setAtivo(true);
                    }}
                    onFocus={() => setAtivo(true)}
                    placeholder={placeholder}
                    className={desabilitado ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'w-full bg-white px-4 py-3 text-base text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10'}
                    autoComplete="off"
                />

                <label htmlFor={id}>
                    {legenda} {obrigatorio && <span className="text-red-500">*</span>}
                </label>
            </div>

            {/* Lista suspensa de opções (abre ao focar/clicar) */}
            {!desabilitado && ativo && opcoesFiltradas.length > 0 && (
                <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto py-2 px-1 space-y-1">
                    {opcoesFiltradas.map((opcao) => (
                        <li
                            key={opcao.id}
                            onClick={() => selecionarOpcao(opcao)}
                            className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                        >
                            {opcao.nome}
                        </li>
                    ))}
                </ul>
            )}

            {/* Balões (Tags) dos idiomas selecionados logo abaixo do input */}
            {selecionados.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {selecionados.map((item) => (
                        <span 
                            key={item.id}
                            onClick={() => !desabilitado && removerOpcao(item.id)}
                            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors group"
                            title="Clique para remover"
                        >
                            {item.nome}
                            <span className="text-blue-400 group-hover:text-red-500 font-bold">×</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Mensagem de Erro */}
            {!desabilitado && error && (
                <div className="min-h-2 mt-1">
                    <span className="text-xs text-red-500 block" id={`erro-${id}`} role="alert">
                        {error}
                    </span>
                </div>
            )}
        </div>
    );
};

export default InputMultiSelectIdiomas;
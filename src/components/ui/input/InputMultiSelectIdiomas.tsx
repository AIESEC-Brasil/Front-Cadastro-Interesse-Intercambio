"use client";

/**
 * @file InputMultiSelectIdiomas.tsx
 * @description Componente de seleção múltipla de idiomas otimizado para alto desempenho em Mobile.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styles from "./style.module.css";
import type { LanguageMultiSelectProps } from '../../../types/componentes';

const LIMITE_RENDERIZACAO_MOBILE = 50;

// Extrai o idioma base (ex: "Inglês - Básico" vira "inglês")
const obterIdiomaBase = (nome: string): string => {
    const separadorIndice = nome.indexOf('-');
    const base = separadorIndice !== -1 ? nome.slice(0, separadorIndice) : nome;
    return base.trim().toLowerCase();
};

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
    const [indiceAtivo, setIndiceAtivo] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listaRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Busca em tempo constante O(1) usando Set para IDs e Idiomas Base
    const { idsSelecionados, idiomasBaseSelecionados } = useMemo(() => {
        const ids = new Set<number | string>();
        const idiomas = new Set<string>();

        for (let i = 0; i < selecionados.length; i++) {
            ids.add(selecionados[i].id);
            idiomas.add(obterIdiomaBase(selecionados[i].nome));
        }

        return { idsSelecionados: ids, idiomasBaseSelecionados: idiomas };
    }, [selecionados]);

    // 2. Loop com corte antecipado (break) e trava de renderização no DOM para Mobile
    const opcoesFiltradas = useMemo(() => {
        if (!opcoes || opcoes.length === 0) return [];

        const termoLimpo = valorInput.trim().toLowerCase();
        const resultado: typeof opcoes = [];

        for (let i = 0; i < opcoes.length; i++) {
            const item = opcoes[i];

            // Pula verificação se já estiver selecionado ou se o mesmo idioma base já tiver sido escolhido
            if (idsSelecionados.has(item.id)) continue;
            const idiomaBase = obterIdiomaBase(item.nome);
            if (idiomasBaseSelecionados.has(idiomaBase)) continue;

            // Filtra por termo digitado se houver
            if (!termoLimpo || item.nome.toLowerCase().includes(termoLimpo)) {
                resultado.push(item);
                if (resultado.length >= LIMITE_RENDERIZACAO_MOBILE) break;
            }
        }

        return resultado;
    }, [opcoes, valorInput, idsSelecionados, idiomasBaseSelecionados]);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAtivo(false);
                setIndiceAtivo(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selecionarOpcao = useCallback((opcao: LanguageMultiSelectProps['opcoes'][number]) => {
        atualizar([...selecionados, opcao]);
        setValorInput("");
        setAtivo(false);
        setIndiceAtivo(-1);
        inputRef.current?.blur();
    }, [atualizar, selecionados]);

    const removerOpcao = useCallback((idParaRemover: number | string) => {
        const novosSelecionados = selecionados.filter(item => item.id !== idParaRemover);
        atualizar(novosSelecionados);
    }, [atualizar, selecionados]);

    useEffect(() => {
        if (indiceAtivo < 0) return;
        listaRef.current
            ?.querySelector<HTMLElement>(`[data-option-index="${indiceAtivo}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [indiceAtivo]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (opcoesFiltradas.length === 0) return;
            event.preventDefault();
            setAtivo(true);
            setIndiceAtivo((indiceAtual) => {
                if (!ativo || indiceAtual < 0 || indiceAtual >= opcoesFiltradas.length) {
                    return event.key === 'ArrowDown' ? 0 : opcoesFiltradas.length - 1;
                }
                const direcao = event.key === 'ArrowDown' ? 1 : -1;
                return (indiceAtual + direcao + opcoesFiltradas.length) % opcoesFiltradas.length;
            });
        } else if (event.key === 'Enter' && ativo && indiceAtivo >= 0) {
            event.preventDefault();
            const opcao = opcoesFiltradas[indiceAtivo];
            if (opcao) selecionarOpcao(opcao);
        } else if (event.key === 'Escape' && ativo) {
            event.preventDefault();
            setAtivo(false);
            setIndiceAtivo(-1);
        }
    };

    return (
        <div 
            className={`${styles.inputGroup} ${styles.autoComplete} ${error ? styles.hasError : ''} relative w-full`}
            ref={containerRef}
        >
            <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                error 
                    ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' 
                    : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
                <input
                    ref={inputRef}
                    id={id}
                    name={id}
                    type="text"
                    value={valorInput}
                    disabled={desabilitado}
                    required={obrigatorio && selecionados.length === 0}
                    aria-required={obrigatorio}
                    aria-describedby={`erro-${id}`}
                    onChange={(e) => {
                        setValorInput(e.target.value);
                        setAtivo(true);
                        setIndiceAtivo(-1);
                    }}
                    onFocus={() => {
                        setAtivo(true);
                        setIndiceAtivo(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={
                        desabilitado 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                            : 'w-full bg-white px-4 py-3 text-base text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10'
                    }
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={ativo && opcoesFiltradas.length > 0}
                    aria-controls={`${id}-opcoes`}
                    aria-activedescendant={indiceAtivo >= 0 ? `${id}-opcao-${indiceAtivo}` : undefined}
                />

                <label htmlFor={id}>
                    {legenda} {obrigatorio && <span className="text-red-500">*</span>}
                </label>
            </div>

            {/* Lista de sugestões otimizada */}
            {!desabilitado && ativo && opcoesFiltradas.length > 0 && (
                <ul
                    id={`${id}-opcoes`}
                    ref={listaRef}
                    role="listbox"
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto py-2 px-1 space-y-1"
                >
                    {opcoesFiltradas.map((opcao, index) => (
                        <li
                            key={opcao.id}
                            id={`${id}-opcao-${index}`}
                            data-option-index={index}
                            role="option"
                            aria-selected={indiceAtivo === index}
                            onClick={() => selecionarOpcao(opcao)}
                            className={`px-3 py-2.5 text-sm rounded-xl cursor-pointer transition-colors ${
                                indiceAtivo === index
                                    ? 'bg-blue-500 text-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {opcao.nome}
                        </li>
                    ))}
                </ul>
            )}

            {/* Balões (Tags) dos idiomas selecionados */}
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
"use client";

/**
 * @file InputAutoComplete.tsx
 * @description Componente reutilizável de campo com autocomplete otimizado para Mobile.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

import styles from "./style.module.css";
import type { AutoCompleteProps } from '../../../types/componentes';

const LIMITE_EXIBICAO_MOBILE = 50; // Renderiza no máximo 50 itens por vez para não travar a DOM do celular

const InputAutoComplete: React.FC<AutoCompleteProps> = ({
    id,
    legenda,
    valor,
    atualizar,
    opcoes,
    error,
    obrigatorio = false,
    placeholder = " ",
    desabilitado = false
}) => {
    const [ativo, setAtivo] = useState<boolean>(false);
    const [indiceAtivo, setIndiceAtivo] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listaRef = useRef<HTMLUListElement>(null);

    // 1. Otimização de Busca: Filtra e limita a renderização para evitar Long Tasks no Mobile
    const opcoesFiltradas = useMemo(() => {
        if (!opcoes || opcoes.length === 0) return [];
        
        const termoLimpo = valor.trim().toLowerCase();

        // Se não houver nada digitado, renderiza apenas as primeiras N opções para não pesar a DOM
        if (!termoLimpo) {
            return opcoes.slice(0, LIMITE_EXIBICAO_MOBILE);
        }

        const resultado: typeof opcoes = [];
        for (let i = 0; i < opcoes.length; i++) {
            if (opcoes[i].nome.toLowerCase().includes(termoLimpo)) {
                resultado.push(opcoes[i]);
                // Corta a busca assim que atinge o limite seguro de exibição
                if (resultado.length >= LIMITE_EXIBICAO_MOBILE) break;
            }
        }

        return resultado;
    }, [opcoes, valor]);

    useEffect(() => {
        setIndiceAtivo(-1);
    }, [opcoesFiltradas]);

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

    const selecionarOpcao = useCallback((opcao: AutoCompleteProps['opcoes'][number]) => {
        atualizar(opcao.nome, opcao.id);
        setAtivo(false);
        setIndiceAtivo(-1);
    }, [atualizar]);

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
                if (!ativo || indiceAtual < 0) {
                    return event.key === 'ArrowDown' ? 0 : opcoesFiltradas.length - 1;
                }
                const direcao = event.key === 'ArrowDown' ? 1 : -1;
                return (indiceAtual + direcao + opcoesFiltradas.length) % opcoesFiltradas.length;
            });
        } else if (event.key === 'Enter' && ativo && indiceAtivo >= 0) {
            event.preventDefault();
            selecionarOpcao(opcoesFiltradas[indiceAtivo]);
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
                error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
                {/* Campo de entrada de texto */}
                <input
                    id={id}
                    name={id}
                    type="text"
                    value={valor}
                    disabled={desabilitado}
                    required={obrigatorio}
                    aria-required={obrigatorio}
                    aria-describedby={`erro-${id}`}
                    onChange={(e) => {
                        atualizar(e.target.value, '');
                        setAtivo(true);
                        setIndiceAtivo(-1);
                    }}
                    onFocus={() => {
                        setAtivo(true);
                        setIndiceAtivo(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={desabilitado ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed w-full px-4 py-3 text-sm rounded-xl pr-10' : 'w-full bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10'}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={ativo && opcoesFiltradas.length > 0}
                    aria-controls={`${id}-opcoes`}
                    aria-activedescendant={indiceAtivo >= 0 ? `${id}-opcao-${indiceAtivo}` : undefined}
                />

                {/* Rótulo (Label) flutuante */}
                <label htmlFor={id}>
                    {legenda} {obrigatorio && <span className="text-red-500">*</span>}
                </label>

                {/* Ícone ChevronDown */}
                <ChevronDown
                    size={18}
                    className={`absolute right-4 text-gray-500 transition-transform pointer-events-none ${ativo ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Lista de opções do Autocomplete (Limitada para fluidez em celulares) */}
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

            {/* Exibição de Erro */}
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

export default InputAutoComplete;
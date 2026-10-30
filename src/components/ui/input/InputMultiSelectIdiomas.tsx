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
    const containerRef = useRef<HTMLDivElement>(null);

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
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selecionarOpcao = useCallback((opcao: LanguageMultiSelectProps['opcoes'][number]) => {
        atualizar([...selecionados, opcao]);
        setValorInput("");
        setAtivo(false);
    }, [atualizar, selecionados]);

    const removerOpcao = useCallback((idParaRemover: number | string) => {
        const novosSelecionados = selecionados.filter(item => item.id !== idParaRemover);
        atualizar(novosSelecionados);
    }, [atualizar, selecionados]);

    return (
        <div 
            className={`${styles.inputGroup} ${error ? styles.hasError : ''} relative w-full`} 
            ref={containerRef}
        >
            <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                error 
                    ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' 
                    : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
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
                    className={
                        desabilitado 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                            : 'w-full bg-white px-4 py-3 text-base text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10'
                    }
                    autoComplete="off"
                />

                <label htmlFor={id}>
                    {legenda} {obrigatorio && <span className="text-red-500">*</span>}
                </label>
            </div>

            {/* Lista de sugestões otimizada */}
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
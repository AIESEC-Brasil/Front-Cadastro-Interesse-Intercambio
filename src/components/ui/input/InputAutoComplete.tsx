"use client";

/**
 * @file InputAutoComplete.tsx
 * @description Componente reutilizável de campo com autocomplete, suporte a label flutuante e acessibilidade.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Importação dos estilos modulares específicos para o layout do input.
 */
import styles from "./style.module.css";
import type { AutoCompleteProps } from '../../../types/componentes';

/**
 * Campo de texto com sugestões vindas da API.
 *
 * Digitar chama `atualizar` com ID vazio, pois o texto pode ainda não
 * corresponder a uma opção oficial. Somente clicar em uma sugestão devolve o
 * ID real; essa diferença permite que a validação rejeite texto não selecionado.
 */
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
    const containerRef = useRef<HTMLDivElement>(null);

    const opcoesFiltradas = opcoes.filter((item) =>
        item.nome.toLowerCase().includes(valor.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAtivo(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selecionarOpcao = (opcao: AutoCompleteProps['opcoes'][number]) => {
        atualizar(opcao.nome, opcao.id);
        setAtivo(false);
    };

    return (
        <div 
            className={`${styles.inputGroup} ${error ? styles.hasError : ''} relative w-full`} 
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
                    }}
                    onFocus={() => setAtivo(true)}
                    placeholder={placeholder}
                    className={desabilitado ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed w-full px-4 py-3 text-sm rounded-xl pr-10' : 'w-full bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10'}
                    autoComplete="off"
                />

                {/* Rótulo (Label) flutuante */}
                <label htmlFor={id}>
                    {legenda} {obrigatorio && <span className="text-red-500">*</span>}
                </label>

                {/* Ícone ChevronDown posicionado ao lado direito */}
                <ChevronDown 
                    size={18} 
                    className={`absolute right-4 text-gray-500 transition-transform pointer-events-none ${ativo ? 'rotate-180' : ''}`} 
                />
                
            </div>

            {/* Lista de opções do Autocomplete (exibe tudo ao focar/clicar, filtrando conforme digita) */}
            {!desabilitado && ativo && opcoesFiltradas.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto py-2 px-1 space-y-1">
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
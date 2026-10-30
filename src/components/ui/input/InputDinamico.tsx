"use client";

/**
 * @file InputDinamico.tsx
 * @description Componente reutilizável para múltiplos inputs de contatos com otimizações de performance e usabilidade mobile.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronDown } from 'lucide-react';
import ButtonConfirmar from '../buttons/ButtonConfirmar';
import styles from "./style.module.css";
import type { DynamicInputProps } from '../../../types/componentes';

const InputDinamico: React.FC<DynamicInputProps> = ({
  tituloLabel,
  placeholderInput,
  tipoInput = "text",
  itens,
  opcoesTipo,
  erros = [],
  maxItens,
  aoAdicionar,
  aoRemover,
  aoAtualizarTipo,
  aoAtualizarValor,
  obrigatorio = true
}) => {
  const apenasUmItem = itens.length === 1;
  const [dropdownAbertoIndex, setDropdownAbertoIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Mapeamento O(1) de Tipos para rápida recuperação da tradução
  const mapaOpcoesTipo = useMemo(() => {
    const mapa = new Map<string, string>();
    for (let i = 0; i < opcoesTipo.length; i++) {
      mapa.set(opcoesTipo[i].original, opcoesTipo[i].traduzido);
    }
    return mapa;
  }, [opcoesTipo]);

  // 2. Event listener para fechar dropdown ao clicar fora (Essencial em Mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownAbertoIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = useCallback((index: number) => {
    setDropdownAbertoIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleSelecionarTipo = useCallback((index: number, valorOriginal: string) => {
    aoAtualizarTipo(index, valorOriginal);
    setDropdownAbertoIndex(null);
  }, [aoAtualizarTipo]);

  return (
    <div className={styles.containerDinamico} ref={containerRef}>
      <label className={styles.labelPrincipal}>
        {tituloLabel} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      {itens.map((item, index) => {
        const erroAtual = erros[index];
        const isOpen = dropdownAbertoIndex === index;
        const textoTraduzido = mapaOpcoesTipo.get(item.tipo) || "Selecione";

        // Chave estável para evitar renderizações desnecessárias no DOM
        const keyItem = (item as { id?: string | number }).id ?? `${item.tipo}-${index}`;

        return (
          <React.Fragment key={keyItem}>
            <div className="flex flex-col mb-3">
              <div className={`${styles.linhaItem} ${erroAtual ? styles.hasError : ''}`}>
                
                {/* Select Customizado de Tipo */}
                <div className="relative w-1/3">
                  <div
                    onClick={() => handleToggleDropdown(index)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer flex justify-between items-center select-none"
                  >
                    <span className="truncate">{textoTraduzido}</span>
                    <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                      {opcoesTipo.map((opcao) => (
                        <div
                          key={opcao.original}
                          className="p-2.5 hover:bg-gray-100 cursor-pointer text-gray-900 text-sm"
                          onClick={() => handleSelecionarTipo(index, opcao.original)}
                        >
                          {opcao.traduzido}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input de Valor */}
                <div className={styles.inputWrapper}>
                  <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                    erroAtual ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                  }`}>
                    <input
                      type={tipoInput}
                      placeholder={placeholderInput}
                      aria-describedby={`erro-dinamico-${tituloLabel.toLowerCase()}-${index}`}
                      value={item.valor}
                      onChange={(e) => aoAtualizarValor(index, e.target.value)}
                      className={styles.inputValor}
                    />
                  </div>
                </div>

                {/* Botão de Remover */}
                <button
                  type="button"
                  disabled={apenasUmItem}
                  onClick={() => !apenasUmItem && aoRemover(index)}
                  className={`${styles.botaoRemover} ${apenasUmItem ? styles.bloqueado : styles.ativo}`}
                  aria-label={`Remover ${tituloLabel.toLowerCase()}`}
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            {/* Mensagem de erro por linha */}
            <div className="min-h-2 mt-1">
              {erroAtual && (
                <span
                  className="errorMsg block text-xs text-red-500"
                  id={`erro-dinamico-${tituloLabel.toLowerCase()}-${index}`}
                  role="alert"
                  aria-live="polite"
                >
                  {erroAtual}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* Botão Adicionar Outro */}
      {(maxItens === undefined || itens.length < maxItens) && (
        <div className={styles.botaoAdicionarWrapper}>
          <ButtonConfirmar
            texto="Adicionar outro"
            aoClicar={aoAdicionar}
            type="button"
          />
        </div>
      )}
    </div>
  );
};

export default InputDinamico;
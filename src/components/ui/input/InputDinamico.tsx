"use client";

/**
 * @file InputDinamico.tsx
 * @description Componente reutilizável para múltiplos inputs com suporte a erros individuais por linha e correção de fragmentação de tags (React.Fragment).
 */

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import ButtonConfirmar from '../buttons/ButtonConfirmar';
import styles from "./style.module.css";
import type { DynamicInputProps } from '../../../type/componentes';
import type { OpcaoTraduzida } from '../../../type/comum';

/**
 * Renderiza uma lista editável de e-mails ou telefones.
 *
 * Cada linha tem um tipo e um valor, e o índice da linha conecta o campo ao
 * erro correspondente. A última linha não pode ser removida para que o
 * formulário nunca fique sem o único contato obrigatório inicial.
 */
const InputDinamico = ({
  tituloLabel,
  placeholderInput,
  tipoInput = "text",
  itens,
  opcoesTipo,
  erros = [],
  aoAdicionar,
  aoRemover,
  aoAtualizarTipo,
  aoAtualizarValor,
  obrigatorio = true
}: DynamicInputProps) => {
  const apenasUmItem = itens.length === 1;

  // Estado para controlar qual índice está com o select aberto (evita abrir todos ao mesmo tempo)
  const [dropdownAbertoIndex, setDropdownAbertoIndex] = useState<number | null>(null);
  
  return (
    <div className={styles.containerDinamico}>
      <label className={styles.labelPrincipal}>
        {tituloLabel} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      {itens.map((item, index) => {
        const erroAtual = erros[index];
        const isOpen = dropdownAbertoIndex === index;
        const opcaoSelecionada = opcoesTipo.find((o: TranslatedOption) => o.original === item.tipo)

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col mb-3">
              <div className={`${styles.linhaItem} ${erroAtual ? styles.hasError : ''}`}>
                
                {/* Select Customizado de Tipo com bordas arredondadas */}
                <div className="relative w-1/3">
                  <div
                    onClick={() => setDropdownAbertoIndex(isOpen ? null : index)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer flex justify-between items-center select-none"
                  >
                    <span className="truncate" >{opcaoSelecionada ? opcaoSelecionada.traduzido : "Selecione"}</span>
                    <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                      {opcoesTipo.map((opcao) => (
                        <div
                          key={opcao.original}
                          className="p-2.5 hover:bg-gray-100 cursor-pointer text-gray-900 text-sm"
                          onClick={() => {
                            aoAtualizarTipo(index, opcao.original);
                            setDropdownAbertoIndex(null);
                          }}
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

            {/* Mensagem de erro específica para esta linha */}
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
      <div className={styles.botaoAdicionarWrapper}>
        <ButtonConfirmar
          texto="Adicionar outro"
          aoClicar={aoAdicionar}
          type="button"
        />
      </div>
    </div>
  );
};

export default InputDinamico;
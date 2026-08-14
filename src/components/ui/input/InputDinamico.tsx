"use client";

/**
 * @file InputDinamico.tsx
 * @description Componente reutilizável para múltiplos inputs com suporte a erros individuais por linha e correção de fragmentação de tags (React.Fragment).
 */

import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import ButtonConfirmar from '../buttons/ButtonConfirmar';
import styles from "./style.module.css";

interface ItemDinamico {
  tipo: string;
  valor: string;
}

interface OpcaoTipo {
  original: string;
  traduzido: string;
}

interface InputDinamicoProps {
  tituloLabel: string;
  placeholderInput: string;
  tipoInput?: string;
  itens: ItemDinamico[];
  opcoesTipo: OpcaoTipo[];
  erros?: string[]; // Recebe um array de erros correspondente a cada linha
  aoAdicionar: () => void;
  aoRemover: (index: number) => void;
  aoAtualizarTipo: (index: number, novoTipo: string) => void;
  aoAtualizarValor: (index: number, novoValor: string) => void;
  obrigatorio?: boolean;
}

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
}: InputDinamicoProps) => {
  const apenasUmItem = itens.length === 1;

  return (
    <div className={styles.containerDinamico}>
      <label className={styles.labelPrincipal}>
        {tituloLabel} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      {itens.map((item, index) => {
        const erroAtual = erros[index];

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col mb-3">
              <div className={`${styles.linhaItem} ${erroAtual ? styles.hasError : ''}`}>
                {/* Select de Tipo */}
                <div className={styles.selectWrapper}>
                  <select
                    value={item.tipo}
                    onChange={(e) => aoAtualizarTipo(index, e.target.value)}
                    className={styles.selectTipo}
                  >
                    {opcoesTipo.map((opcao) => (
                      <option key={opcao.original} value={opcao.original}>
                        {opcao.traduzido}
                      </option>
                    ))}
                  </select>
                  <div className={styles.setaIcone}>
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Input de Valor */}
                <div className={styles.inputWrapper}>
                  <input
                    type={tipoInput}
                    placeholder={placeholderInput}
                    aria-describedby={`erro-dinamico-${tituloLabel.toLowerCase()}-${index}`}
                    value={item.valor}
                    onChange={(e) => aoAtualizarValor(index, e.target.value)}
                    className={styles.inputValor}
                  />
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
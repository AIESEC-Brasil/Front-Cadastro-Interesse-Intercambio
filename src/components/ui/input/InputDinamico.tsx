"use client";

/**
 * @file InputDinamico.tsx
 * @description Componente reutilizável para múltiplos inputs utilizando objetos de tradução (original vs traduzido).
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
  opcoesTipo: OpcaoTipo[]; // Agora recebe objetos com original e traduzido
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

      {itens.map((item, index) => (
        <div key={index} className={styles.linhaItem}>
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
      ))}

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
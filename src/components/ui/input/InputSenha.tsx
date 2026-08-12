"use client";

/**
 * @file InputSenha.tsx
 * @description Componente reutilizável de campo de senha com suporte a label flutuante, 
 * alternância de visibilidade, exibição de lista de erros e acessibilidade integrada.
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Importação dos estilos modulares específicos para o layout do input.
 */
import styles from "./style.module.css";

/**
 * Propriedades aceitas pelo componente InputSenha.
 */
interface InputSenhaProps {
  id: string;
  legenda: string;
  valor: string;
  atualizar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Permite receber uma string única ou uma lista de condições/erros não atingidos. */
  error?: string[];
  obrigatorio?: boolean;
}

const InputSenha = ({
  id,
  legenda,
  valor,
  atualizar,
  error,
  obrigatorio = true
}: InputSenhaProps) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Transforma o erro em array para garantir que possamos iterar sobre ele facilmente
  const listaErros: string[] = error ?? [];
  const temErro = listaErros.length > 0 && listaErros[0] !== '';

  return (
    <div className={`${styles.inputGroup} ${temErro ? styles.hasError : ''} ${styles.senha}`}>
      {/* Campo de entrada de senha */}
      <input
        type={mostrarSenha ? "text" : "password"}
        id={id}
        name={id}
        placeholder=" "
        required={obrigatorio}
        aria-required={obrigatorio}
        aria-describedby={`erro-${id}`}
        value={valor}
        onChange={atualizar}
      />

      {/* Rótulo (Label) flutuante */}
      <label htmlFor={id}>
        {legenda} {obrigatorio && <span className="text-red-500">*</span>}
      </label>

      {/* Botão para exibir/ocultar senha */}
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setMostrarSenha(!mostrarSenha)}
        aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
      >
        {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

      {/* Exibição condicional da lista de condições/erros não atingidos */}
      {temErro && (
        <div
          className="errorMsg list-disc list-inside mt-1 space-y-0.5"
          id={`erro-${id}`}
          role="alert"
          aria-live="polite"
        >
          {listaErros.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default InputSenha;
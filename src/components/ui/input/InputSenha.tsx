"use client";

/**
 * @file InputSenha.tsx
 * @description Componente reutilizável de campo de senha com suporte a label flutuante, 
 * alternância de visibilidade, exibição de lista de erros e acessibilidade integrada.
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { validarSenha } from '../../../utils/validates';

/**
 * Importação dos estilos modulares específicos para o layout do input.
 */
import styles from "./style.module.css";
import type { PasswordInputProps } from '../../../types/componentes';

/**
 * Propriedades aceitas pelo componente InputSenha.
 */
const InputSenha = ({
  id,
  legenda,
  valor,
  atualizar,
  error,
  confirmarValor,
  atualizarConfirmacao,
  erroConfirmacao,
  obrigatorio = true
}: PasswordInputProps) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const listaErros = Array.isArray(error) ? error : error ? [error] : [];
  const listaErrosConfirmacao = Array.isArray(erroConfirmacao)
    ? erroConfirmacao
    : erroConfirmacao ? [erroConfirmacao] : [];
  const errosRequisitosSenha = validarSenha(valor);
  const errosRequisitosConfirmacao = validarSenha(confirmarValor);
  const senhasValidasEConfirmadas = valor !== ''
    && valor === confirmarValor
    && errosRequisitosSenha.every((mensagem) => mensagem === '')
    && errosRequisitosConfirmacao.every((mensagem) => mensagem === '');
  const temErro = !senhasValidasEConfirmadas && listaErros.some((mensagem) => mensagem !== '');
  const temErroConfirmacao = !senhasValidasEConfirmadas
    && listaErrosConfirmacao.some((mensagem) => mensagem !== '');
  const classeBorda = senhasValidasEConfirmadas
    ? 'border-green-500 focus-within:ring-2 focus-within:ring-green-200'
    : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100';

  return (
    <div className="flex flex-col gap-4">
      <div className={`${styles.inputGroup} ${temErro ? styles.hasError : ''} ${styles.senha}`}>
        <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
          temErro ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : classeBorda
        }`}>
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
          <label htmlFor={id}>
            {legenda} {obrigatorio && <span className="text-red-500">*</span>}
          </label>
        </div>
        <button
          type="button"
          name="visor-senha"
          className={`${styles.eye} ${temErro ? styles.hasError : ''} absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none`}
          onClick={() => setMostrarSenha(!mostrarSenha)}
          aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
        >
          {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {temErro && (
          <div
            className="errorMsg list-disc list-inside mt-1 space-y-0.5"
            id={`erro-${id}`}
            role="alert"
            aria-live="polite"
          >
            {listaErros.filter(Boolean).map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
      </div>

      <div className={`${styles.inputGroup} ${temErroConfirmacao ? styles.hasError : ''} ${styles.senha}`}>
        <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
          temErroConfirmacao ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : classeBorda
        }`}>
          <input
            type={mostrarConfirmacao ? "text" : "password"}
            id={`${id}-confirmacao`}
            name={`${id}-confirmacao`}
            placeholder=" "
            required={obrigatorio}
            aria-required={obrigatorio}
            aria-describedby={`erro-${id}-confirmacao`}
            value={confirmarValor}
            onChange={atualizarConfirmacao}
          />
          <label htmlFor={`${id}-confirmacao`}>
            Confirme sua senha {obrigatorio && <span className="text-red-500">*</span>}
          </label>
        </div>
        <button
          type="button"
          name="visor-senha-confirmacao"
          className={`${styles.eye} ${temErroConfirmacao ? styles.hasError : ''} absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none`}
          onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
          aria-label={mostrarConfirmacao ? "Ocultar confirmação de senha" : "Exibir confirmação de senha"}
        >
          {mostrarConfirmacao ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {temErroConfirmacao && (
          <div
            className="errorMsg list-disc list-inside mt-1 space-y-0.5"
            id={`erro-${id}-confirmacao`}
            role="alert"
            aria-live="polite"
          >
            {listaErrosConfirmacao.filter(Boolean).map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSenha;
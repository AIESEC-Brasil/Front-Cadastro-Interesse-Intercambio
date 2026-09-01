/**
 * @file InputTexto.tsx
 * @description Componente reutilizável de campo de texto com suporte a label flutuante, 
 * tratamento de erros e acessibilidade integrada.
 */
import React from 'react';

/**
 * Importação dos estilos modulares específicos para o comportamento e layout do campo de texto.
 */
import styles from "./style.module.css";
import type { TextInputProps } from '../../../type/componentes';

/**
 * Propriedades aceitas pelo componente InputTexto.
 */
/**
 * Componente reutilizável de campo de texto com suporte a label flutuante,
 * tratamento de erros e acessibilidade integrada.
 * 
 * @param {TextInputProps} props - Propriedades do componente.
 * @returns {JSX.Element} O elemento estrutural do input com label flutuante e validação.
 */
const InputTexto = ({
  id,
  legenda,
  valor,
  atualizar,
  error,
  obrigatorio = true
}: TextInputProps) => {
  return (
    <div className={`${styles.inputGroup} ${error ? styles.hasError : ''}`}>
      <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
        {/* Campo de entrada de texto com atributos de controle, obrigatoriedade e acessibilidade */}
        <input
          type="text"
          id={id}
          name={id}
          placeholder=" "
          required={obrigatorio}
          aria-required={obrigatorio}
          aria-describedby={`erro-${id}`}
          value={valor}
          onChange={atualizar}
        />

        {/* Rótulo (Label) flutuante que se movimenta ao focar ou preencher o input */}
        <label htmlFor={id}>
          {legenda} {obrigatorio && <span className="text-red-500">*</span>}
        </label>
      </div>
      {/* Exibição condicional da mensagem de erro com altura mínima reservada para manter o grid alinhado */}
      <div className="min-h-2 mt-1">
        {error && (
          <span
            className="errorMsg block text-xs text-red-500"
            id={`erro-${id}`}
            role="alert"
            aria-live="polite"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Exportação padrão do componente InputTexto para utilização em outras partes da aplicação.
 */
export default InputTexto;
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

/**
 * Propriedades aceitas pelo componente InputTexto.
 */
interface InputTextoProps {
  /** Identificador único do input (usado para vincular o label e os atributos de acessibilidade). */
  id: string;
  /** Texto descritivo (rótulo) exibido junto ao input. */
  legenda: string;
  /** Valor atual armazenado no campo (para inputs controlados). */
  valor: string;
  /** Função de callback disparada sempre que o valor do input é alterado. */
  atualizar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Mensagem de erro de validação opcional exibida abaixo do campo. */
  error?: string;
  /** Define se o campo é obrigatório (padrão: true). Adiciona um asterisco vermelho e regras de validação. */
  obrigatorio?: boolean;
}

/**
 * Componente reutilizável de campo de texto com suporte a label flutuante,
 * tratamento de erros e acessibilidade integrada.
 * 
 * @param {InputTextoProps} props - Propriedades do componente.
 * @returns {JSX.Element} O elemento estrutural do input com label flutuante e validação.
 */
const InputTexto = ({
  id,
  legenda,
  valor,
  atualizar,
  error,
  obrigatorio = true
}: InputTextoProps) => {
  return (
    <div className={`${styles.inputGroup} ${error ? styles.hasError : ''}`}>
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

      {/* Exibição condicional da mensagem de erro com altura mínima reservada para manter o grid alinhado */}
      <div className="min-h-4 mt-1">
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
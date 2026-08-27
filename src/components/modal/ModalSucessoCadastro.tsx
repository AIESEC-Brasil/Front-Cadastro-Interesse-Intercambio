// src/components/modal/ModalSucessoCadastro.tsx
import React from 'react';
import type { CadastroSuccessModalProps } from '../../type/components';

/** Confirma a criação da primeira etapa e oferece a entrada na qualificação. */
export default function ModalSucessoCadastro({
  aberta,
  senha,
  emailReferencia,
  aoConcluir,
}: CadastroSuccessModalProps) {
  if (!aberta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-xl font-bold text-green-600 mb-3">Cadastro Realizado com Sucesso!</h2>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Em breve entraremos em contato com você, fique atento ao e-mail ou ao telefone que você informou.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg mb-6 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <p><strong className="text-zinc-900 dark:text-zinc-100">E-mail referência:</strong> {emailReferencia}</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Senha cadastrada:</strong> {senha}</p>
        </div>

        <button 
          onClick={aoConcluir}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
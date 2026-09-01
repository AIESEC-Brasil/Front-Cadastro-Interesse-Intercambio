// src/components/modal/ModalErroConexao.tsx
import React from 'react';

import type { ConnectionErrorModalProps } from '../../types/componentes';

/** Diferencia falha ao buscar metadados de erro inesperado durante o envio. */
export default function ModalErroConexao({ aberta, aoTentarNovamente, tipo}: ConnectionErrorModalProps) {
  if (!aberta) return null;

  const mensagens = {
    conexao: "Não conseguimos carregar as informações necessárias. Por favor, verifique sua internet e tente novamente.",
    bug: "Ocorreu um erro inesperado ao processar os dados do sistema. Por favor, recarregue a página e tente novamente."
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          {tipo === 'conexao' ? 'Falha na Conexão' : 'Ops, ocorreu um erro!'}
        </h2>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          {mensagens[tipo]}
        </p>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Caso o problema persista, contate o email: <span className="font-semibold text-zinc-800 dark:text-zinc-200">contato@aiesec.org.br</span> enviando:
        </p>
        
        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 mb-6 space-y-1">
          <li>Nome completo</li>
          <li>E-mail</li>
          <li>Telefone</li>
          <li>Cidade</li>
          <li>Programa de interesse</li>
        </ul>

        <button 
          onClick={aoTentarNovamente}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          {tipo === 'conexao' ? 'Tentar Novamente' : 'Recarregar Página'}
        </button>
      </div>
    </div>
  );
}
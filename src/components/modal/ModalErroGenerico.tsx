'use client';

import React from 'react';

import type { ConnectionErrorModalProps } from '../../types/componentes';

export default function ModalErroGenerico({ aberta, tipo, aoTentarNovamente }: ConnectionErrorModalProps) {
  if (!aberta) return null;

  return (
    // Backdrop escuro semitransparente
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Container do Modal */}
      <div className="w-full max-w-md bg-[#121214] text-white rounded-xl p-6 shadow-2xl border border-gray-800 space-y-6">
        
        {/* Conteúdo */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-red-600">
            Falha na Conexão
          </h2>
          
          <p className="text-sm text-gray-300 leading-relaxed">
            Não conseguimos carregar as informações necessárias. Por favor, verifique sua conexão com a internet e tente novamente.
          </p>
        </div>

        {/* Botão de Ação */}
        <button
          onClick={aoTentarNovamente}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer text-sm"
        >
          Tentar Novamente
        </button>

      </div>
    </div>
  );
}
"use client";

/**
 * @file ModalErro.tsx
 * @description Modal de erro dinâmica que lê um JSON de campos contendo listas de erros, totalmente em português e com botão de fechar (×).
 */

import React from 'react';
import ButtonEditar from '../ui/buttons/ButtonEditar';
import type { ErrorModalProps } from '../../types/componentes';

/** Apresenta erros agrupados por campo, no formato `{ campo: [mensagens] }`. */
const ModalErro = ({ aberta, titulo = "Dados incorretos.", erros, aoFechar }: ErrorModalProps) => {
    if (!aberta) return null;

    const entradasErros = Object.entries(erros);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative">
                
                {/* Cabeçalho com o botão X para fechar */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-red-600">{titulo}</h3>
                    <button 
                        onClick={aoFechar}
                        className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold leading-none cursor-pointer"
                        aria-label="Fechar"
                    >
                        &times;
                    </button>
                </div>

                {/* Corpo com a listagem dos campos e suas sub-listas de erros */}
                <div className="p-6 max-h-80 overflow-y-auto">
                    <p className="text-gray-700 mb-4 font-medium">Por favor, corrija os erros e tente novamente:</p>
                    
                    <ul className="space-y-3">
                        {entradasErros.map(([campo, mensagens], index) => (
                            <li key={index} className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <strong className="text-red-800 block mb-1">{campo}:</strong>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    {mensagens.map((msg, idx) => (
                                        <li key={idx} className="text-sm text-red-700">{msg}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Rodapé */}
                <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <ButtonEditar 
                        texto="Corrigir" 
                        aoClicar={aoFechar} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ModalErro;
"use client";

/**
 * @file ModalErro.tsx
 * @description Modal de erro dinâmica que lê um JSON de campos contendo listas de erros, totalmente em português e com botão de fechar (×).
 */

import React from 'react';
import ButtonEditar from '../ui/buttons/ButtonEditar';
import type { ErrorModalProps } from '../../types/componentes';

/** Mostra erros de validação ou falhas de conexão conforme o contexto. */
const ModalErro = ({
    aberta,
    tipo,
    erros = {},
    aoFechar,
    aoTentarNovamente,
    titulo,
    mensagem,
    botaoTexto,
    mostrarContato = true,
    tema = 'claro',
}: ErrorModalProps) => {
    if (!aberta) return null;

    if (tipo !== 'validacao') {
        const mensagens = {
            conexao: "Não conseguimos carregar as informações necessárias. Por favor, verifique sua internet e tente novamente.",
            bug: "Ocorreu um erro inesperado ao processar os dados do sistema. Por favor, recarregue a página e tente novamente."
        };
        const tituloPadrao = tipo === 'conexao' ? 'Falha na Conexão' : 'Ops, ocorreu um erro!';
        const botaoPadrao = tipo === 'conexao' ? 'Tentar Novamente' : 'Recarregar Página';
        const escuro = tema === 'escuro';
        const acao = aoTentarNovamente ?? aoFechar;

        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${escuro ? 'bg-black/60' : 'bg-black/50 backdrop-blur-sm'}`}>
                <div className={`p-6 rounded-xl shadow-2xl max-w-sm w-full ${escuro ? 'bg-[#121214] text-white border border-gray-800 space-y-6' : 'bg-white dark:bg-zinc-900'}`}>
                    <h2 className={`text-xl font-bold mb-2 ${escuro ? 'text-red-500' : 'text-red-600'}`}>
                        {titulo ?? tituloPadrao}
                    </h2>
                    <p className={escuro ? 'text-sm text-gray-300 leading-relaxed' : 'text-zinc-600 dark:text-zinc-400 mb-4'}>
                        {mensagem ?? mensagens[tipo]}
                    </p>
                    {mostrarContato && (
                        <>
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
                        </>
                    )}
                    <button
                        onClick={acao}
                        className={`w-full px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${
                            escuro ? 'py-3 font-semibold text-sm' : 'py-2 font-medium'
                        }`}
                    >
                        {botaoTexto ?? botaoPadrao}
                    </button>
                </div>
            </div>
        );
    }

    const entradasErros = Object.entries(erros);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative">
                
                {/* Cabeçalho com o botão X para fechar */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-red-600">{titulo ?? "Dados incorretos."}</h3>
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
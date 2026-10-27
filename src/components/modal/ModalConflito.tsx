"use client";

/**
 * @file ModalConflito.tsx
 * @description Modal específico para tratar conflitos (HTTP 409), lidando com mensagens diretas ou listas dinâmicas de campos duplicados (emails, telefones, etc.).
 */

import React from 'react';
import ButtonEditar from '../ui/buttons/ButtonEditar';
import type { ConflictModalProps } from '../../types/componentes';

/**
 * Exibe a mensagem e os contatos retornados pelo backend em um HTTP 409.
 */
const ModalConflito = ({ 
    aberta, 
    titulo = "Conflito de Dados Detectado", 
    dadosErro, 
    aoFechar 
}: ConflictModalProps) => {
    if (!aberta) return null;

    const isMensagemSimples = typeof dadosErro === 'string';
    const mensagem = isMensagemSimples
        ? dadosErro
        : dadosErro.message
            ?? (typeof dadosErro.error === 'string' ? dadosErro.error : undefined)
            ?? dadosErro.erro;
    const entradasConflito = !isMensagemSimples && dadosErro
        ? Object.entries(dadosErro).filter(
            ([campo, itens]) =>
                ['emails', 'telefone'].includes(campo)
                && Array.isArray(itens)
                && itens.length > 0
        )
        : [];
    const detalhesErro = !isMensagemSimples && dadosErro?.error_details
        ? dadosErro.error_details
        : [];

    // Função para traduzir/formatar o nome do campo para exibição amigável
    const formatarNomeCampo = (chave: string) => {
        const dicionario: Record<string, string> = {
            emails: "E-mail(s) já cadastrado(s)",
            telefone: "Telefone(s) já cadastrado(s)",
        };
        return dicionario[chave] || chave;
    };

    // Função para extrair o valor correto de dentro do array de objetos do campo
    const extrairValorItem = (item: unknown): string => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
            const valor = item as Record<string, unknown>;
            return String(valor.email || valor.numero || valor.mensagem || JSON.stringify(item));
        }
        return String(item);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-amber-100 bg-amber-50/50">
                    <h3 className="text-xl font-bold text-amber-700">{titulo}</h3>
                    <button 
                        onClick={aoFechar}
                        className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold leading-none cursor-pointer"
                        aria-label="Fechar"
                    >
                        &times;
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div className="p-6 max-h-80 overflow-y-auto">
                    {mensagem && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-sm">
                            {mensagem}
                        </div>
                    )}

                    {entradasConflito.length > 0 && (
                        <>
                            <p className="text-gray-700 my-4 font-medium">
                                Os seguintes dados já existem no sistema:
                            </p>
                            <ul className="space-y-3">
                                {entradasConflito.map(([campo, itens], index) => {
                                    if (!Array.isArray(itens)) return null;

                                    return (
                                        <li key={index} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                            <strong className="text-amber-900 block mb-1">
                                                {formatarNomeCampo(campo)}:
                                            </strong>
                                            <ul className="list-disc list-inside space-y-1 pl-2">
                                                {itens.map((subItem, idx) => (
                                                    <li key={idx} className="text-sm text-amber-800 font-mono">
                                                        {extrairValorItem(subItem)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}

                    {detalhesErro.length > 0 && (
                        <ul className="mt-4 list-disc list-inside text-sm text-amber-800">
                            {detalhesErro.map((detalhe, index) => (
                                <li key={index}>{detalhe.loc}: {detalhe.msg}</li>
                            ))}
                        </ul>
                    )}

                    {!mensagem && entradasConflito.length === 0 && detalhesErro.length === 0 && (
                        <p className="text-gray-700">A solicitação conflita com um cadastro existente.</p>
                    )}
                </div>

                {/* Rodapé */}
                <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <ButtonEditar 
                        texto="Entendido" 
                        aoClicar={aoFechar} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ModalConflito;
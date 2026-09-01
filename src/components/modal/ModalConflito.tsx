"use client";

/**
 * @file ModalConflito.tsx
 * @description Modal específico para tratar conflitos (HTTP 409), lidando com mensagens diretas ou listas dinâmicas de campos duplicados (emails, telefones, etc.).
 */

import React from 'react';
import ButtonEditar from '../ui/buttons/ButtonEditar';
import type { ConflictData, ConflictModalProps } from '../../type/componentes';

/**
 * Exibe dados que já existem na API, normalmente após HTTP 409.
 * Aceita tanto uma mensagem simples quanto listas de e-mails/telefones; essa
 * tolerância existe porque o backend pode responder em formatos diferentes.
 */
const ModalConflito = ({ 
    aberta, 
    titulo = "Conflito de Dados Detectado", 
    dadosErro, 
    aoFechar 
}: ConflictModalProps) => {
    if (!aberta) return null;

    // Se receber apenas uma string de erro direta (Exemplo 1)
    const isMensagemSimples = typeof dadosErro === 'string';

    // Se for o objeto da API, extrai as chaves disponíveis
    const entradasConflito = !isMensagemSimples && dadosErro ? Object.entries(dadosErro) : [];

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
                    <p className="text-gray-700 mb-4 font-medium">
                        Não foi possível concluir a operação pois os seguintes dados já existem no sistema:
                    </p>

                    {isMensagemSimples ? (
                        // Exemplo 1: Mensagem de erro em texto puro
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-sm">
                            {dadosErro}
                        </div>
                    ) : (
                        // Exemplo 2: Listagem dinâmica de arrays (emails, telefones ou ambos)
                        <ul className="space-y-3">
                            {entradasConflito.map(([campo, itens], index) => {
                                if (!Array.isArray(itens) || itens.length === 0) return null;

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
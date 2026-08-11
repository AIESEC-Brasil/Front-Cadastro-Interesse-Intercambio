"use client";

/**
 * @file BotaoEditarModal.tsx
 * @description Componente de botão cinza reutilizável para ações secundárias nas modais (ex: Editar dados, Corrigir).
 */

import React from 'react';

interface ButtonEditarProps {
    texto: string;
    onClick: () => void;
    type?: 'button' | 'submit';
}

const ButtonEditar = ({ texto, onClick, type = 'button' }: ButtonEditarProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-slate-500 hover:bg-slate-600 focus:ring-slate-300 transition shadow-sm cursor-pointer"
        >
            {texto}
        </button>
    );
};

export default ButtonEditar;
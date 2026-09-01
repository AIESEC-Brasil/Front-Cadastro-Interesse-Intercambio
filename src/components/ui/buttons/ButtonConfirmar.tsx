"use client";

/**
 * @file BotaoConfirmarModal.tsx
 * @description Componente de botão azul reutilizável para ações principais nas modais (ex: Confirmar, Avançar, Ok).
 */

import React from 'react';

import type { ButtonProps } from '../../../types/componentes';

/** Botão visualmente primário para confirmar, avançar ou concluir uma ação. */
const ButtonConfirmar = ({ texto, aoClicar, type = 'button' }: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={aoClicar}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 transition shadow-sm cursor-pointer"
        >
            {texto}
        </button>
    );
};

export default ButtonConfirmar;
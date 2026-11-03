"use client";

/**
 * @file ProgramasIntercambio.tsx
 * @description Página de fluxo de cadastro para Programas de Intercâmbio.
 */
import React from 'react';
import dynamic from 'next/dynamic';

const pathname = usePathname();

// Normaliza o caminho removendo a barra inicial
const rotaFormatada = useMemo(() => pathname?.replace(/^\//, '') || '', [pathname]);

// Carregamento dinâmico no Client-side sem bloquear o HTML inicial
const FormularioPreCadastroB2c = dynamic(
    () => import("@components/forms/FormularioPreCadastroB2c"),
    {
        ssr: false,
        loading: () => <div className="p-8 text-center text-gray-500 font-medium">Carregando formulário...</div>,
    }
);

/**
 * Componente principal da página.
 */
const leadAtracao: React.FC = () => {
    return (
        <main>
            <div className="w-full max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
                {/* Indicador Visual de Etapas */}
                <FormularioPreCadastroB2c />
            </div>
        </main>

    );
};

export default leadAtracao;
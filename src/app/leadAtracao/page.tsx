"use client";

import React, { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const MODO_CADASTRO_KEY = 'leadAtracao:modoCadastro';
const MODO_CADASTRO_EVENT = 'leadAtracao:modoCadastro-change';

const assinarModoCadastro = (notificar: () => void) => {
    window.addEventListener('storage', notificar);
    window.addEventListener(MODO_CADASTRO_EVENT, notificar);

    return () => {
        window.removeEventListener('storage', notificar);
        window.removeEventListener(MODO_CADASTRO_EVENT, notificar);
    };
};

const obterModoCadastro = () =>
    window.localStorage.getItem(MODO_CADASTRO_KEY) === '2' ? '2' : '1';

const obterModoCadastroNoServidor = () => '1';

const FormularioPreCadastroB2c = dynamic(
    () => import("@components/forms/FormularioPreCadastroB2c"),
    {
        ssr: false,
        loading: () => <div className="p-8 text-center text-gray-500 font-medium">Carregando formulário...</div>,
    }
);

const FormularioPreCadastroB2cXLSX = dynamic(
    () => import("@components/forms/FormularioPreCadastroB2cXLSX"),
    {
        ssr: false,
        loading: () => <div className="p-8 text-center text-gray-500 font-medium">Carregando formulário...</div>,
    }
);

const LeadAtracao: React.FC = () => {
    const modoCadastro = useSyncExternalStore(
        assinarModoCadastro,
        obterModoCadastro,
        obterModoCadastroNoServidor
    );
    const step = Number(modoCadastro);

    const selecionarModoCadastro = (novoModo: '1' | '2') => {
        window.localStorage.setItem(MODO_CADASTRO_KEY, novoModo);
        window.dispatchEvent(new Event(MODO_CADASTRO_EVENT));
    };

    return (
        <main>
            <div className="w-full max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
                    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => selecionarModoCadastro('1')}
                        aria-pressed={step === 1}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                            step === 1
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                                : 'border-zinc-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                    >
                        Cadastro individual
                    </button>
                    <button
                        type="button"
                        onClick={() => selecionarModoCadastro('2')}
                        aria-pressed={step === 2}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                            step === 2
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                                : 'border-zinc-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                    >
                        Cadastro em massa
                    </button>
                    </div>

                    {step === 1 ? (
                        <FormularioPreCadastroB2c />
                    ) : (
                        <FormularioPreCadastroB2cXLSX />
                    )}
            </div>
        </main>
    );
};

export default LeadAtracao;

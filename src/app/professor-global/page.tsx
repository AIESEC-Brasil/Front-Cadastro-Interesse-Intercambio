"use client";

/**
 * @file VoluntarioGlobal.tsx
 * @description Página de fluxo de cadastro para Voluntário Global.
 */
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import FormularioPreCadastro from "@components/forms/FormularioPreCadastro";

/**
 * Componente da página de Voluntário Global.
 * @param {Object} props 
 * @param {Object} props.req - Objeto da requisição.
 */
const ProfessorGlobal = ({ req }: { req: { path: string } }) => {
    const [step, setStep] = useState(1);
    const pathname = usePathname();
    const totalSteps = 2;

    return (
        <main>
            <div className="w-full max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
                {/* Indicador de Etapas */}
                <div className="flex items-center justify-center mb-8 px-4">
                    {Array.from({ length: totalSteps }, (_, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === step;
                        const isCompleted = stepNumber < step;

                        return (
                            <React.Fragment key={stepNumber}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                                                : isCompleted
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {stepNumber}
                                    </div>
                                </div>
                                {stepNumber < totalSteps && (
                                    <div
                                        className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                                            stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Renderização condicional: rota é o req.path puro, state é o setStep */}
                {step === 1 && (
                    <FormularioPreCadastro 
                        rota={pathname?.replace(/^\//, '')} 
                        state={setStep} 
                    />
                )}
                
                {step === 2 && (
                    <>
                        {/* Conteúdo da segunda etapa */}
                    </>
                )}
            </div>
        </main>
    );
};

export default ProfessorGlobal;
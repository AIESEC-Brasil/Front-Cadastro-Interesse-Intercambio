"use client";

/**
 * @file ProgramasIntercambio.tsx
 * @description Página de fluxo de cadastro para Programas de Intercâmbio.
 */
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import FormularioPreCadastro from "@components/forms/FormularioPreCadastro";
import FormularioPreCadastroParams from "@components/forms/FormularioPreCadastroParams";
import FormularioQualificao from "@components/forms/FormularioQualificao";

interface ProgramasIntercambioProps {
    req?: { 
        path: string 
    };
}

/**
 * Controla o fluxo de duas etapas do cadastro.
 * Se houver parâmetros de query na URL durante o Step 1, renderiza o formulário preparado para parâmetros.
 * 
 * @param {ProgramasIntercambioProps} props Props do componente.
 * @returns {JSX.Element} Componente da página de programas de intercâmbio.
 */
const ProgramasIntercambio: React.FC<ProgramasIntercambioProps> = () => {
    const [step, setStep] = useState<number>(1);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const totalSteps = 2;

    // Converte os parâmetros da URL diretamente para o tipo esperado
    const paramsObjeto = Object.fromEntries(searchParams.entries()) as {
        utm_source: string;
        utm_medium: string;
        utm_campaign: string;
        utm_term: string;
        utm_content: string;
    };

    // Normaliza o caminho removendo a barra inicial
    const rotaFormatada = pathname?.replace(/^\//, '') || '';

    // Verifica se existem parâmetros de query na URL (ex: ?utm_source=xyz)
    const temParametrosUrl = searchParams ? searchParams.toString().length > 0 : false;
    
    return (
        <main>
            <div className="w-full max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
                {/* Indicador Visual de Etapas */}
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

                {/* STEP 1: Renderização condicional baseada na presença de parâmetros na URL */}
                {step === 1 && (
                    temParametrosUrl ? (
                        <FormularioPreCadastroParams 
                            rota={rotaFormatada} 
                            state={setStep} 
                            step={step}
                            params={paramsObjeto}
                        />
                    ) : (
                        <FormularioPreCadastro 
                            rota={rotaFormatada} 
                            state={setStep} 
                            step={step}
                        />
                    )
                )}
                
                {/* STEP 2: Continua inalterado */}
                {step === 2 && (
                    <FormularioQualificao
                        rota={rotaFormatada} 
                        state={setStep} 
                        step={step}
                    />
                )}
            </div>
        </main>
    );
};

export default ProgramasIntercambio;
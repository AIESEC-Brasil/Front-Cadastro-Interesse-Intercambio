import React from 'react';

interface ModalQualificacaoProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalSucessoQualificacao({ isOpen, onClose }: ModalQualificacaoProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-blue-900">
                        Dados enviados com sucesso!
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        aria-label="Fechar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Corpo */}
                <div className="px-6 py-10 text-center">
                    <p className="text-lg text-gray-700 font-medium">
                        Valeu pelas informações adicionais! 💙
                    </p>
                </div>

                {/* Rodapé */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
}
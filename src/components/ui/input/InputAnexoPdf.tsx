'use client';

import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import styles from './style.module.css';

interface InputAnexoPdfProps {
    id: string;
    legenda: string;
    arquivo: File | null;
    // Agora a função de atualização pode receber também o base64 (opcional)
    atualizar: (arquivo: File | null, base64: string | null) => void;
    obrigatorio?: boolean;
    desabilitado?: boolean;
    tamanhoMaximoMb?: number;
}

const InputAnexoPdf = ({
    id,
    legenda,
    arquivo,
    atualizar,
    obrigatorio = false,
    desabilitado = false,
    tamanhoMaximoMb
}: InputAnexoPdfProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [carregando, setCarregando] = useState<boolean>(false);
    const [progresso, setProgresso] = useState<number>(0);

    const processarArquivo = (novoArquivo: File) => {
        setCarregando(true);
        setProgresso(0);

        let progressoAtual = 0;
        const intervalo = setInterval(() => {
            progressoAtual += 20;
            setProgresso(progressoAtual);

            if (progressoAtual >= 100) {
                clearInterval(intervalo);
                
                // Converte o arquivo para Base64 usando FileReader
                const reader = new FileReader();
                reader.readAsDataURL(novoArquivo);
                reader.onload = () => {
                    const base64String = reader.result as string;
                    const base64Puro = base64String.split(',')[1] || base64String;
                    setCarregando(false);
                    // Passa o arquivo bruto e o base64 para a função de callback
                    atualizar(novoArquivo, base64Puro);
                };
                reader.onerror = () => {
                    setCarregando(false);
                    atualizar(null, null);
                };
            }
        }, 80);
    };

    const selecionarArquivo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const novoArquivo = event.target.files?.[0] ?? null;

        if (!novoArquivo) {
            return;
        }

        // Validações imediatas
        if (novoArquivo.type !== 'application/pdf' || !novoArquivo.name.toLowerCase().endsWith('.pdf')) {
            atualizar(null, null);
            event.target.value = '';
            return;
        }

        if (tamanhoMaximoMb && novoArquivo.size > tamanhoMaximoMb * 1024 * 1024) {
            atualizar(null, null);
            event.target.value = '';
            return;
        }

        processarArquivo(novoArquivo);
    };

    const removerArquivo = (e: React.MouseEvent) => {
        e.stopPropagation();
        atualizar(null, null);
        setCarregando(false);
        setProgresso(0);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleClickContainer = () => {
        if (!desabilitado && !carregando) {
            inputRef.current?.click();
        }
    };

    return (
        <div className={`${styles.inputGroup}`}>
            <span className="mb-2 block text-sm font-medium text-gray-700">
                {legenda} {obrigatorio && <span className="text-red-500">*</span>}
            </span>

            <input
                ref={inputRef}
                id={id}
                name={id}
                type="file"
                accept="application/pdf,.pdf"
                required={obrigatorio && !arquivo}
                disabled={desabilitado || carregando}
                aria-required={obrigatorio}
                onChange={selecionarArquivo}
                className="sr-only"
            />

            <div
                onClick={handleClickContainer}
                className={`relative overflow-hidden flex min-h-14 items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition-all cursor-pointer ${
                    !desabilitado && !carregando ? 'hover:border-blue-400 hover:bg-blue-50/30' : ''
                } border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${desabilitado ? 'cursor-not-allowed bg-gray-100' : ''}`}
            >
                {carregando && (
                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-100 overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-75 ease-out relative"
                            style={{ width: `${progresso}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-bg_1s_linear_infinite]" />
                        </div>
                    </div>
                )}

                {carregando ? (
                    <div className="flex items-center gap-3 w-full py-1">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent shrink-0" />
                        <span className="text-sm text-gray-600 font-medium truncate">
                            Processando PDF... {progresso}%
                        </span>
                    </div>
                ) : arquivo ? (
                    <>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }}
                                disabled={desabilitado}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shrink-0"
                            >
                                <Upload size={16} aria-hidden="true" />
                                Trocar
                            </button>

                            <div className="flex min-w-0 items-center gap-2">
                                <FileText size={22} className="shrink-0 text-red-600" aria-hidden="true" />
                                <span className="truncate text-sm text-gray-800 font-medium" title={arquivo.name}>
                                    {arquivo.name}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={removerArquivo}
                            disabled={desabilitado}
                            aria-label={`Remover ${arquivo.name}`}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                inputRef.current?.click();
                            }}
                            disabled={desabilitado}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shrink-0"
                        >
                            <Upload size={16} aria-hidden="true" />
                            Anexar PDF
                        </button>
                        <span className="text-sm text-gray-500">Nenhum PDF selecionado</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputAnexoPdf;
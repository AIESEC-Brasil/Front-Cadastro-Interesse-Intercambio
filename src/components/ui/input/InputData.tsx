// src/components/ui/input/InputData.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';

interface InputDataProps {
    id: string;
    legenda: string;
    valor: string; // Formato DD/MM/AAAA
    atualizar: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    obrigatorio?: boolean;
}

type VisaoCalendario = 'dias' | 'anos';

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_DA_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function InputData({
    id,
    legenda,
    valor,
    atualizar,
    error,
    obrigatorio = false
}: InputDataProps) {
    const [aberto, setAberto] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Estado interno para navegação do calendário
    const hoje = new Date();
    const [anoAtualVisual, setAnoAtualVisual] = useState<number>(hoje.getFullYear());
    const [mesAtualVisual, setMesAtualVisual] = useState<number>(hoje.getMonth()); // 0 a 11
    const [visao, setVisao] = useState<VisaoCalendario>('dias');
    const [anoInicioDecada, setAnoInicioDecada] = useState<number>(Math.floor(hoje.getFullYear() / 12) * 12);

    // Sincroniza o calendário com a data digitada ou selecionada se válida
    useEffect(() => {
        const apenasNumeros = valor.replace(/\D/g, "");
        if (apenasNumeros.length === 8) {
            const d = parseInt(apenasNumeros.slice(0, 2), 10);
            const m = parseInt(apenasNumeros.slice(2, 4), 10) - 1;
            const a = parseInt(apenasNumeros.slice(4, 8), 10);
            if (!isNaN(d) && !isNaN(m) && !isNaN(a) && a >= 1900 && a <= 2100 && m >= 0 && m <= 11) {
                setAnoAtualVisual(a);
                setMesAtualVisual(m);
            }
        }
    }, [valor]);

    // Fecha o popover ao clicar fora
    useEffect(() => {
        const handleClickFora = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAberto(false);
                setVisao('dias');
            }
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => document.removeEventListener('mousedown', handleClickFora);
    }, []);

    // Dispara a atualização para o formulário pai simulando um evento de input
    const dispararAtualizacao = (novaDataStr: string) => {
        const eventoSimulado = {
            target: { id, value: novaDataStr }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        atualizar(eventoSimulado);
    };

    // Geração dos dias do mês atual
    const obterDiasDoMes = () => {
        const primeiroDiaSemana = new Date(anoAtualVisual, mesAtualVisual, 1).getDay();
        const ultimoDiaData = new Date(anoAtualVisual, mesAtualVisual + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(anoAtualVisual, mesAtualVisual, 0).getDate();

        const dias = [];

        for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
            dias.push({
                dia: ultimoDiaMesAnterior - i,
                outroMes: true,
                mesRef: mesAtualVisual === 0 ? 11 : mesAtualVisual - 1,
                anoRef: mesAtualVisual === 0 ? anoAtualVisual - 1 : anoAtualVisual
            });
        }

        for (let i = 1; i <= ultimoDiaData; i++) {
            dias.push({
                dia: i,
                outroMes: false,
                mesRef: mesAtualVisual,
                anoRef: anoAtualVisual
            });
        }

        const totalCelulas = dias.length <= 35 ? 35 : 42;
        const diasRestantes = totalCelulas - dias.length;
        for (let i = 1; i <= diasRestantes; i++) {
            dias.push({
                dia: i,
                outroMes: true,
                mesRef: mesAtualVisual === 11 ? 0 : mesAtualVisual + 1,
                anoRef: mesAtualVisual === 11 ? anoAtualVisual + 1 : anoAtualVisual
            });
        }

        return dias;
    };

    const selecionarDia = (d: number, m: number, a: number) => {
        const diaFormatado = String(d).padStart(2, '0');
        const mesFormatado = String(m + 1).padStart(2, '0');
        const anoFormatado = String(a);
        dispararAtualizacao(`${diaFormatado}/${mesFormatado}/${anoFormatado}`);
        setAberto(false);
        setVisao('dias');
    };

    const navegarMes = (direcao: number) => {
        let novoMes = mesAtualVisual + direcao;
        let novoAno = anoAtualVisual;
        if (novoMes > 11) {
            novoMes = 0;
            novoAno++;
        } else if (novoMes < 0) {
            novoMes = 11;
            novoAno--;
        }
        setMesAtualVisual(novoMes);
        setAnoAtualVisual(novoAno);
    };

    return (
        <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
            <label htmlFor={id} className="text-sm font-medium text-black">
                {legenda} {obrigatorio && <span className="text-red-500">*</span>}
            </label>
            
            <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
                {/* Input de texto com máscara */}
                <input
                    id={id}
                    type="text"
                    maxLength={10}
                    placeholder="DD/MM/AAAA"
                    value={valor}
                    onChange={atualizar}
                    className="w-full bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10"
                />

                {/* Botão para abrir o popover de calendário customizado */}
                <button
                    type="button"
                    onClick={() => {
                        setAberto(!aberto);
                        setVisao('dias');
                    }}
                    className="absolute right-3 text-zinc-500 hover:text-black focus:outline-none flex items-center justify-center p-1"
                    tabIndex={-1}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </button>
            </div>

            {/* Popup do Calendário */}
            {aberto && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-200 shadow-xl rounded-2xl p-4 w-80 text-black select-none">
                    
                    {/* Cabeçalho de Navegação */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                        {visao === 'dias' && (
                            <>
                                <button type="button" onClick={() => navegarMes(-1)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    {/* Exibe 'Agosto 2026' agrupado. Ao clicar, vai direto para a visão de seleção de Anos */}
                                    <button 
                                        type="button" 
                                        onClick={() => { 
                                            setAnoInicioDecada(Math.floor(anoAtualVisual / 12) * 12); 
                                            setVisao('anos'); 
                                        }} 
                                        className="hover:bg-zinc-100 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                        {MESES[mesAtualVisual]} {anoAtualVisual}
                                    </button>
                                </div>
                                <button type="button" onClick={() => navegarMes(1)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </>
                        )}

                        {visao === 'anos' && (
                            <div className="w-full flex items-center justify-between font-semibold text-sm">
                                <button type="button" onClick={() => setAnoInicioDecada(anoInicioDecada - 12)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <span>{anoInicioDecada} - {anoInicioDecada + 11}</span>
                                <button type="button" onClick={() => setAnoInicioDecada(anoInicioDecada + 12)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Visão 1: Seleção de Dias */}
                    {visao === 'dias' && (
                        <div>
                            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-zinc-400">
                                {DIAS_DA_SEMANA.map((dia, idx) => (
                                    <span key={idx}>{dia}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                {obterDiasDoMes().map((item, idx) => {
                                    const selecionado = valor === `${String(item.dia).padStart(2, '0')}/${String(item.mesRef + 1).padStart(2, '0')}/${item.anoRef}`;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => selecionarDia(item.dia, item.mesRef, item.anoRef)}
                                            className={`py-2 rounded-xl text-xs transition-colors ${
                                                selecionado
                                                    ? 'bg-blue-600 text-white font-bold'
                                                    : item.outroMes
                                                    ? 'text-zinc-300 hover:bg-zinc-50'
                                                    : 'text-zinc-800 hover:bg-zinc-100'
                                            }`}
                                        >
                                            {item.dia}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Visão 2: Seleção de Anos */}
                    {visao === 'anos' && (
                        <div className="grid grid-cols-3 gap-2 py-2">
                            {Array.from({ length: 12 }, (_, i) => anoInicioDecada + i).map((ano) => (
                                <button
                                    key={ano}
                                    type="button"
                                    onClick={() => {
                                        setAnoAtualVisual(ano);
                                        setVisao('dias');
                                    }}
                                    className={`py-3 text-xs font-medium rounded-xl transition-colors ${
                                        anoAtualVisual === ano ? 'bg-blue-600 text-white' : 'hover:bg-zinc-100 text-zinc-700'
                                    }`}
                                >
                                    {ano}
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            )}

            {error && <span className="errorMsg text-xs text-red-500 mt-0.5">{error}</span>}
        </div>
    );
}
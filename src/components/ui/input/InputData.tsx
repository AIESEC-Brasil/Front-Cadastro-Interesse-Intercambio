// src/components/ui/input/InputData.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { CalendarDay, CalendarView, DateInputProps } from '../../../types/componentes';

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
}: DateInputProps) {
    const [aberto, setAberto] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const hoje = new Date();
    const [anoAtualVisual, setAnoAtualVisual] = useState<number>(hoje.getFullYear());
    const [mesAtualVisual, setMesAtualVisual] = useState<number>(hoje.getMonth());
    const [visao, setVisao] = useState<CalendarView | 'meses'>('dias');
    const [anoInicioDecada, setAnoInicioDecada] = useState<number>(Math.floor(hoje.getFullYear() / 12) * 12);

    // Sincroniza a visualização do calendário ao digitar ou ao abrir o popover
    useEffect(() => {
        const apenasNumeros = valor.replace(/\D/g, "");
        if (apenasNumeros.length === 8) {
            const d = parseInt(apenasNumeros.slice(0, 2), 10);
            const m = parseInt(apenasNumeros.slice(2, 4), 10) - 1;
            const a = parseInt(apenasNumeros.slice(4, 8), 10);
            if (!isNaN(d) && !isNaN(m) && !isNaN(a) && a >= 1900 && a <= 2100 && m >= 0 && m <= 11) {
                setAnoAtualVisual(a);
                setMesAtualVisual(m);
                return;
            }
        }

        if (aberto && apenasNumeros.length === 0) {
            const dataHoje = new Date();
            setAnoAtualVisual(dataHoje.getFullYear());
            setMesAtualVisual(dataHoje.getMonth());
        }
    }, [valor, aberto]);

    // Fecha o popover ao clicar fora e reseta a visão interna
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

    const dispararAtualizacao = (novaDataStr: string) => {
        const eventoSimulado = {
            target: { id, value: novaDataStr }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        atualizar(eventoSimulado);
    };

    const obterDiasDoMes = (): CalendarDay[] => {
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

    const alternarAbertura = () => {
        const novoEstadoAberto = !aberto;
        setAberto(novoEstadoAberto);
        setVisao('dias');

        if (novoEstadoAberto && !valor) {
            const dataHoje = new Date();
            setAnoAtualVisual(dataHoje.getFullYear());
            setMesAtualVisual(dataHoje.getMonth());
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
            <label htmlFor={id} className="text-sm font-medium text-black">
                {legenda} {obrigatorio && <span className="text-red-500">*</span>}
            </label>
            
            <div className={`relative flex items-center w-full rounded-xl border bg-white transition-all ${
                error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 'border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
                <input
                    id={id}
                    type="text"
                    maxLength={10}
                    onClick={alternarAbertura}
                    autoComplete="off"
                    placeholder="DD/MM/AAAA"
                    value={valor}
                    onChange={atualizar}
                    className="w-full bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 placeholder:uppercase focus:outline-none rounded-xl pr-10"
                />

                <button
                    type="button"
                    name="calendario"
                    onClick={alternarAbertura}
                    className="absolute right-3 text-zinc-500 hover:text-black focus:outline-none flex items-center justify-center p-1"
                    aria-label="Abrir calendário"
                    tabIndex={-1}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </button>
            </div>

            {aberto && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-200 shadow-xl rounded-2xl p-4 w-full text-black select-none">
                    
                    {/* Cabeçalho de Navegação */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                        {visao === 'dias' && (
                            <>
                                <button type="button" onClick={() => navegarMes(-1)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    {/* Clicar aqui vai para a seleção de MESES */}
                                    <button 
                                        type="button" 
                                        onClick={() => setVisao('meses')} 
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

                        {visao === 'meses' && (
                            <div className="w-full flex items-center justify-between font-semibold text-sm">
                                <button type="button" onClick={() => setAnoAtualVisual(anoAtualVisual - 1)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                {/* Clicar no ano estando na tela de MESES vai para a tela de ANOS */}
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setAnoInicioDecada(Math.floor(anoAtualVisual / 12) * 12);
                                        setVisao('anos');
                                    }}
                                    className="hover:bg-zinc-100 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    {anoAtualVisual}
                                </button>
                                <button type="button" onClick={() => setAnoAtualVisual(anoAtualVisual + 1)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </div>
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

                    {/* Visão 1: Dias */}
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

                    {/* Visão 2: Meses */}
                    {visao === 'meses' && (
                        <div className="grid grid-cols-3 gap-2 py-2">
                            {MESES.map((nomeMes, idx) => (
                                <button
                                    key={nomeMes}
                                    type="button"
                                    onClick={() => {
                                        setMesAtualVisual(idx);
                                        setVisao('dias');
                                    }}
                                    className={`py-3 text-xs font-medium rounded-xl transition-colors ${
                                        mesAtualVisual === idx ? 'bg-blue-600 text-white' : 'hover:bg-zinc-100 text-zinc-700'
                                    }`}
                                >
                                    {nomeMes.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Visão 3: Anos */}
                    {visao === 'anos' && (
                        <div className="grid grid-cols-3 gap-2 py-2">
                            {Array.from({ length: 12 }, (_, i) => anoInicioDecada + i).map((ano) => (
                                <button
                                    key={ano}
                                    type="button"
                                    onClick={() => {
                                        setAnoAtualVisual(ano);
                                        setVisao('meses'); // Ao selecionar o ano, volta para a escolha de meses
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
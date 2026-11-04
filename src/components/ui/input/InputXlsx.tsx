'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import styles from './style.module.css';

interface InputXlsxProps {
  id: string;
  legenda: string;
  atualizar: (arquivo: File | null) => void;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

const InputXlsx = ({
  id,
  legenda,
  atualizar,
  obrigatorio = false,
  desabilitado = false
}: InputXlsxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      readerRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const processarArquivo = useCallback((novoArquivo: File) => {
    readerRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);

    setArquivo(null);
    setErroLeitura(null);
    setCarregando(true);
    setProgresso(0);

    const reader = new FileReader();
    const inicioLeitura = Date.now();
    readerRef.current = reader;

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgresso(Math.round((event.loaded / event.total) * 100));
      }
    };

    reader.onload = () => {
      setProgresso(100);
      const tempoRestante = Math.max(0, 300 - (Date.now() - inicioLeitura));
      timerRef.current = setTimeout(() => {
        if (readerRef.current !== reader) return;
        setArquivo(novoArquivo);
        setCarregando(false);
        atualizar(novoArquivo);
        readerRef.current = null;
        timerRef.current = null;
      }, tempoRestante);
    };

    reader.onerror = () => {
      setErroLeitura('Não foi possível ler o arquivo selecionado.');
      setCarregando(false);
      setProgresso(0);
      atualizar(null);
      readerRef.current = null;
      timerRef.current = null;
    };

    reader.readAsArrayBuffer(novoArquivo);
  }, [atualizar]);

  const selecionarArquivo = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selecionado = event.target.files?.[0] ?? null;

    if (!selecionado) return;

    event.target.value = '';
    readerRef.current?.abort();
    readerRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCarregando(false);
    setProgresso(0);

    if (!/\.(xls|xlsx)$/i.test(selecionado.name)) {
      setArquivo(null);
      setErroLeitura('Selecione um arquivo XLS ou XLSX.');
      atualizar(null);
      return;
    }

    processarArquivo(selecionado);
  }, [atualizar, processarArquivo]);

  const removerArquivo = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();

    readerRef.current?.abort();
    readerRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setArquivo(null);
    setCarregando(false);
    setProgresso(0);
    setErroLeitura(null);
    atualizar(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [atualizar]);

  const abrirSeletor = useCallback(() => {
    if (!desabilitado && !carregando) {
      inputRef.current?.click();
    }
  }, [desabilitado, carregando]);

  return (
    <div className={styles.inputGroup}>
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {legenda} {obrigatorio && <span className="text-red-500">*</span>}
      </span>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        disabled={desabilitado || carregando}
        aria-required={obrigatorio}
        onChange={selecionarArquivo}
        className="sr-only"
      />

      <div
        onClick={abrirSeletor}
        className={`relative flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-xl border bg-white px-4 py-3 transition-all ${
          !desabilitado && !carregando ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''
        } border-zinc-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${
          desabilitado ? 'cursor-not-allowed bg-gray-100' : ''
        }`}
      >
        {carregando && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 overflow-hidden bg-gray-100">
            <div
              className="relative h-full bg-blue-600 transition-all duration-75 ease-out"
              style={{ width: `${progresso}%` }}
            >
              <div className="absolute inset-0 animate-[move-bg_1s_linear_infinite] bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem]" />
            </div>
          </div>
        )}

        {carregando ? (
          <div className="flex w-full items-center gap-3 py-1">
            <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="truncate text-sm font-medium text-gray-600">
              Processando planilha... {progresso}%
            </span>
          </div>
        ) : arquivo ? (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
                disabled={desabilitado}
                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Upload size={16} aria-hidden="true" />
                Trocar
              </button>
              <div className="flex min-w-0 items-center gap-2">
                <FileSpreadsheet size={22} className="shrink-0 text-green-700" aria-hidden="true" />
                <span className="truncate text-sm font-medium text-gray-800" title={arquivo.name}>
                  {arquivo.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removerArquivo}
              disabled={desabilitado}
              aria-label={`Remover ${arquivo.name}`}
              className="shrink-0 cursor-pointer rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </>
        ) : (
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={desabilitado}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Upload size={16} aria-hidden="true" />
              Anexar planilha
            </button>
            <span className="text-sm text-gray-500">Nenhuma planilha selecionada</span>
          </div>
        )}
      </div>

      {erroLeitura && (
        <span className="mt-1 block text-xs text-red-500" role="alert">
          {erroLeitura}
        </span>
      )}
    </div>
  );
};

export default InputXlsx;

'use client';

import React, { useState, useEffect } from 'react';
import InputTexto from '@/components/ui/input/InputTexto';
import InputAutoComplete from '@/components/ui/input/InputAutoComplete';

export default function GeradorUrlPage() {
  const [canal, setCanal] = useState('');
  const [tipoAnuncio, setTipoAnuncio] = useState('');
  const [programa, setPrograma] = useState('');
  const [cl, setCl] = useState('');
  const [campanha, setCampanha] = useState('');

  const [urlGerada, setUrlGerada] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Gera a URL automaticamente apenas quando TODOS os campos forem preenchidos
  useEffect(() => {
    const todosPreenchidos = 
      canal.trim() !== '' && 
      tipoAnuncio.trim() !== '' && 
      programa.trim() !== '' && 
      cl.trim() !== '' && 
      campanha.trim() !== '';

    if (todosPreenchidos) {
      const url = `https://aiesec.org.br/voluntario-global/?utm_source=${encodeURIComponent(canal)}&utm_medium=${encodeURIComponent(tipoAnuncio)}&utm_campaign=${encodeURIComponent(campanha)}&utm_term=${encodeURIComponent(cl)}&utm_content=${encodeURIComponent(programa)}`;
      setUrlGerada(url);
    } else {
      setUrlGerada('');
    }
    setCopiado(false);
  }, [canal, tipoAnuncio, programa, cl, campanha]);

  const handleCopiar = async () => {
    if (!urlGerada) return;
    await navigator.clipboard.writeText(urlGerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center py-10 px-4">
      {/* Container Card Branco Centralizado */}
      <main className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-8 space-y-6 text-[#00204a] font-sans border border-gray-100">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-[#007bff]">
            Gerador de URL - AIESEC
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Todos os links criados e compartilhados em QUALQUER meio devem ser gerados por aqui!
          </p>
        </div>

        {/* Linha 1: Canal e Tipo de anúncio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputAutoComplete
              id="canal"
              legenda="Canal"
              valor={canal}
              atualizar={(valor: string) => setCanal(valor)}
              opcoes={[]}
            />
          </div>

          <div>
            <InputAutoComplete
              id="tipoAnuncio"
              legenda="Tipo de Anuncio"
              valor={tipoAnuncio}
              atualizar={(valor: string) => setTipoAnuncio(valor)}
              opcoes={[]}
            />
          </div>
        </div>

        {/* Linha 2: Programas e CL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputAutoComplete
              id="programas"
              legenda="Programas"
              valor={programa}
              atualizar={(valor: string) => setPrograma(valor)}
              opcoes={[]}
            />
          </div>

          <div>
            <InputAutoComplete
              id="cl"
              legenda="Escritorio"
              valor={cl}
              atualizar={(valor: string) => setCl(valor)}
              opcoes={[]}
            />
          </div>
        </div>

        {/* Linha 3: Campanha */}
        <div>
          <InputTexto
            id="campanha"
            legenda="Campanha"
            valor={campanha}
            atualizar={(e: React.ChangeEvent<HTMLInputElement> | string) => {
              const val = typeof e === 'string' ? e : e.target.value;
              setCampanha(val);
            }}
          />
        </div>

        {/* Exibição da URL Gerada (Aparece automaticamente apenas se todos estiverem preenchidos) */}
        {urlGerada && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="font-bold text-[#00204a] text-sm whitespace-nowrap">
                Url Gerada:
              </label>
              
              <input
                type="text"
                readOnly
                value={urlGerada}
                className="w-full bg-[#e8f0fe] border border-[#d0e1fd] text-[#00204a] px-3 py-2 rounded-md font-mono text-sm focus:outline-none"
              />
              
              <button
                onClick={handleCopiar}
                className="bg-[#6c757d] hover:bg-[#5a6268] text-white font-medium px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
              >
                Copiar
              </button>
            </div>

            {/* Mensagem de sucesso */}
            {copiado && (
              <div className="flex items-center justify-center gap-2 text-[#00c9a7] font-semibold text-sm pt-1">
                <span className="w-4 h-4 bg-[#00c9a7] text-white rounded flex items-center justify-center text-[10px]">
                  ✓
                </span>
                URL copiada com sucesso!
              </div>
            )}
          </div>
        )}

        {/* Rodapé Interno */}
        <footer className="text-center text-gray-400 text-xs pt-6 border-t border-gray-100">
          © AIESEC no Brasil
        </footer>
      </main>
    </div>
  );
}
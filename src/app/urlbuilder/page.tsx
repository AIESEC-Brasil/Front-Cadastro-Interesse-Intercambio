'use client';

import React, { useState, useEffect } from 'react';
import InputTexto from '@/components/ui/input/InputTexto';
import InputAutoComplete from '@/components/ui/input/InputAutoComplete';

import LoadSkeletonDinamico from '@/components/loading/LoadSkeletonDinamico';
import ModalErroGenerico from '@/components/modal/ModalErroGenerico';

import { useDadosFormulario } from '@/hook/useDadosFormulario';
import { useModaisFormulario } from '@/hook/useModaisFormulario';

export default function GeradorUrlPage() {
    const [canal, setCanal] = useState('');
    const [tipoAnuncio, setTipoAnuncio] = useState('');
    const [programa, setPrograma] = useState('');
    const [cl, setCl] = useState('');
    const [campanha, setCampanha] = useState('');

    const [urlGerada, setUrlGerada] = useState('');
    const [copiado, setCopiado] = useState(false);

    const modals = useModaisFormulario();
    const { 
        listaMeio, listaOrigens, listaEscritorios, listaProdutos, carregandoMetadados
    } = useDadosFormulario({ modals });

    // Estruturas de produto com sigla e nome por extenso para facilitar matching.
    //Formato dos itens: { sigla: 'gv', nome: 'Voluntário Globa' }
    const siglaProduto: Array<{ sigla: string, nome: string }> = [
        { sigla: 'gv', nome: 'Voluntário Global' },
        { sigla: 'gtast', nome: 'Talento Global Short Term' },
        { sigla: 'gtalt', nome: 'Talento Global Mid e Long Term' },
        { sigla: 'gte', nome: 'Professor Global' }
    ];
    // Estruturas de escritórios (CLs) com sigla e nome por extenso para facilitar matching.
    //Formato dos itens: { sigla: 'AB', nome: 'ABC' } 
    const escritorios: Array<{ sigla: string, nome: string }> = [
        { sigla: "AB", nome: "ABC" },
        { sigla: "AJ", nome: "ARACAJU" },
        { sigla: "BA", nome: "BAURU" },
        { sigla: "BH", nome: "BELO HORIZONTE" },
        { sigla: "BS", nome: "BRASÍLIA" },
        { sigla: "CT", nome: "CURITIBA" },
        { sigla: "FL", nome: "FLORIANÓPOLIS" },
        { sigla: "FR", nome: "FRANCA" },
        { sigla: "FO", nome: "FORTALEZA" },
        { sigla: "JP", nome: "JOÃO PESSOA" },
        { sigla: "LM", nome: "LIMEIRA" },
        { sigla: "MZ", nome: "MACEIÓ" },
        { sigla: "MN", nome: "MANAUS" },
        { sigla: "MA", nome: "MARINGÁ" },
        { sigla: "PA", nome: "PORTO ALEGRE" },
        { sigla: "RC", nome: "RECIFE" },
        { sigla: "RJ", nome: "RIO DE JANEIRO" },
        { sigla: "SS", nome: "SALVADOR" },
        { sigla: "SM", nome: "SANTA MARIA" },
        { sigla: "GV", nome: "GETÚLIO VARGAS" },
        { sigla: "MK", nome: "MACKENZIE" },
        { sigla: "US", nome: "USP" },
        { sigla: "SO", nome: "SOROCABA" },
        { sigla: "UB", nome: "UBERLÂNDIA" },
        { sigla: "VT", nome: "VITÓRIA" },
        { sigla: "MC", nome: "BRASIL" }
    ];

    // Gera a URL automaticamente apenas quando TODOS os campos forem preenchidos
    useEffect(() => {
        const todosPreenchidos =
            canal.trim() !== '' &&
            tipoAnuncio.trim() !== '' &&
            programa.trim() !== '' &&
            cl.trim() !== '' &&
            campanha.trim() !== '';

        if (todosPreenchidos) {
            // A rota é aplicada de acordo com o programa que vai ser contratado
            let rota = ''
            if (programa.toLowerCase() === 'voluntário global') {
                rota = "voluntario-global"
            } else if (programa.toLowerCase() === 'professor global') {
                rota = 'professor-global'
            } else if (programa.toLowerCase().includes('talento global')) {
                rota = 'talento-global'
            }

            const url = `https://aiesec.org.br/${rota}/?utm_source=${encodeURIComponent(
                canal
            )}&utm_medium=${encodeURIComponent(
                tipoAnuncio
            )}&utm_campaign=${encodeURIComponent(campanha)}&utm_term=${encodeURIComponent(
                escritorios.filter((e: any) => e.nome === cl.replace("AIESEC em", "").replace("AIESEC no", "").toUpperCase().trim())[0]?.sigla
            )}&utm_content=${encodeURIComponent(siglaProduto.filter((e: any) => e.nome === programa)[0]?.sigla)}`;

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
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center py-2 px-4">
            {/* Esqueleto de carregamento exibido enquanto metadados são buscados */}
            <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[2, 2, 1]} />
            {/* Card Principal */}
            {!carregandoMetadados && ( 
            <main className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-8 space-y-6 text-[#00204a] font-sans border border-gray-100">

                {/* Cabeçalho */}
                <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold text-[#007bff]">
                        Gerador de URL - AIESEC
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">
                        Todos os links criados e compartilhados em QUALQUER meio devem ser gerados por aqui!
                    </p>
                </div>

                {/* Linha 1: Canal e Tipo de anúncio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <InputAutoComplete
                            id="canal"
                            legenda="Canal"
                            valor={canal}
                            atualizar={(valor: string) => setCanal(valor)}
                            opcoes={listaOrigens}
                            obrigatorio={true}
                        />
                    </div>

                    <div>
                        <InputAutoComplete
                            id="tipoAnuncio"
                            legenda="Tipo de Anuncio"
                            valor={tipoAnuncio}
                            atualizar={(valor: string) => setTipoAnuncio(valor)}
                            opcoes={listaMeio}
                            obrigatorio={true}
                        />
                    </div>
                </div>

                {/* Linha 2: Programas e CL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <InputAutoComplete
                            id="programas"
                            legenda="Programa"
                            valor={programa}
                            atualizar={(valor: string) => setPrograma(valor)}
                            opcoes={listaProdutos}
                            obrigatorio={true}
                        />
                    </div>

                    <div>
                        <InputAutoComplete
                            id="cl"
                            legenda="Escritorio"
                            valor={cl}
                            atualizar={(valor: string) => setCl(valor)}
                            opcoes={listaEscritorios}
                            obrigatorio={true}
                        />
                    </div>
                </div>

                {/* Linha 3: Campanha */}
                <div>
                    <InputTexto
                        id="Tag"
                        legenda="Tag"
                        valor={campanha}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                            const val = typeof e === 'string' ? e : e.target.value;
                            setCampanha(val);
                        }}
                        obrigatorio={true}
                    />
                </div>

                {/* Informativo de geração automática */}
                {!urlGerada && (
                    <p className="text-xs text-gray-500 text-center italic pt-2">
                        A URL será gerada automaticamente assim que todos os campos forem preenchidos.
                    </p>
                )}

                {/* Exibição da URL Gerada */}
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
                                className="bg-[#6c757d] hover:bg-[#5a6268] text-white font-medium px-5 py-2 rounded-md transition-colors cursor-pointer text-sm"
                            >
                                Copiar
                            </button>
                        </div>

                        {/* Mensagem de sucesso */}
                        {copiado && (
                            <div className="flex items-center justify-center gap-2 text-[#00d2d3] font-semibold text-base pt-2">
                                <span className="w-5 h-5 bg-[#00d2d3] text-white rounded flex items-center justify-center text-xs font-bold">
                                    ✓
                                </span>
                                URL copiada com sucesso!
                            </div>
                        )}
                    </div>
                )}

                {/* Rodapé Interno */}
                <footer className="text-center text-gray-500 text-sm pt-8">
                    © AIESEC no Brasil(2025-2026)
                </footer>
            </main>
            )}
            <ModalErroGenerico
                aberta={modals.modalErroConexaoAberta}
                tipo={modals.tipoErroConexao}
                aoTentarNovamente={() => window.parent.location.reload()}
            />
        </div>
    );
}
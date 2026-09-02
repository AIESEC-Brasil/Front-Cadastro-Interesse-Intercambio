'use client';

/**
 * @fileoverview Página do Gerador de URLs de Campanha da AIESEC no Brasil.
 * Permite a criação padronizada de URLs com parâmetros UTM para rastreamento de marketing.
 */

import React, { useState, useEffect } from 'react';

// Auxiliares de formatação e mapeamentos estáticos
import { slugify } from '@/helpers/formatter';
import { siglaProduto, escritorios, ItemSigla, ItemEscritorio } from '@/helpers/dicionario';

// Componentes de Interface de Usuário (UI)
import InputTexto from '@/components/ui/input/InputTexto';
import InputAutoComplete from '@/components/ui/input/InputAutoComplete';

// Feedback visual e tratamento de erros
import LoadSkeletonDinamico from '@/components/loading/LoadSkeletonDinamico';
import ModalErroGenerico from '@/components/modal/ModalErroGenerico';

// Hooks customizados para gerenciamento de estado da aplicação
import { useDadosFormulario } from '@/hook/useDadosFormulario';
import { useModaisFormulario } from '@/hook/useModaisFormulario';

/**
 * Componente principal da tela do Gerador de URL.
 * 
 * @returns {JSX.Element} Elemento React representando o formulário e resultado da URL.
 */
export default function GeradorUrlPage(): JSX.Element {
    // --- ESTADOS DO FORMULÁRIO ---
    /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Estado do campo Canal (utm_source) */
    const [canal, setCanal] = useState<string>('');

    /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Estado do campo Tipo de Anúncio (utm_medium) */
    const [tipoAnuncio, setTipoAnuncio] = useState<string>('');

    /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Estado do campo Programa selecionado (usado na Rota e utm_content) */
    const [programa, setPrograma] = useState<string>('');

    /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Estado do campo Escritório/CL selecionado (utm_term) */
    const [cl, setCl] = useState<string>('');

    /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Estado do campo Tag/Campanha (utm_campaign) */
    const [campanha, setCampanha] = useState<string>('');

    // --- ESTADOS DE SAÍDA E INTERAÇÃO ---
    /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Armazena a URL final construída */
    const [urlGerada, setUrlGerada] = useState<string>('');

    /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} Controla o feedback de "Copiado" na interface */
    const [copiado, setCopiado] = useState<boolean>(false);

    // --- HOOKS DE DADOS E MODAIS ---
    const modals = useModaisFormulario();
    const { 
        listaMeio, 
        listaOrigens, 
        listaEscritorios, 
        listaProdutos, 
        carregandoMetadados 
    } = useDadosFormulario({ modals });

    /**
     * Efeito responsável por reavaliar e gerar a URL parametrizada
     * sempre que um dos campos do formulário for modificado.
     */
    useEffect(() => {
        // Validação: Garante que nenhum campo esteja em branco ou apenas com espaços
        const todosPreenchidos: boolean =
            canal.trim() !== '' &&
            tipoAnuncio.trim() !== '' &&
            programa.trim() !== '' &&
            cl.trim() !== '' &&
            campanha.trim() !== '';

        if (todosPreenchidos) {
            // Mapeamento dinâmico da rota amigável com base no programa selecionado
            let rota: string = '';
            const programaLower: string = programa.toLowerCase();

            if (programaLower === 'voluntário global') {
                rota = 'voluntario-global';
            } else if (programaLower === 'professor global') {
                rota = 'professor-global';
            } else if (programaLower.includes('talento global')) {
                rota = 'talento-global';
            }

            // Normalização do nome do escritório para localizar a sigla correspondente no dicionário
            const nomeEscritorioLimpo: string = cl
                .replace('AIESEC em', '')
                .replace('AIESEC no', '')
                .toUpperCase()
                .trim();

            // Busca a sigla do escritório no dicionário
            const siglaEscritorio: string = escritorios.filter(
                (e: ItemEscritorio) => e.nome === nomeEscritorioLimpo
            )[0]?.sigla || '';

            // Busca a sigla do produto/programa no dicionário
            const siglaProdutoEncontrada: string = siglaProduto.filter(
                (e: ItemSigla) => e.nome === programa
            )[0]?.sigla || '';

            // Tratamento da variável de ambiente para evitar barras duplas na montagem da URL base
            const baseUrl: string = (process.env.NEXT_PUBLIC_URL_DIRECIONADA || '').replace(/\/$/, '');

            // Montagem da URL completa com a rota e os parâmetros UTM devidamente codificados
            const url: string = `${baseUrl}/${rota}/?utm_source=${encodeURIComponent(
                slugify(canal)
            )}&utm_medium=${encodeURIComponent(
                slugify(tipoAnuncio)
            )}&utm_campaign=${encodeURIComponent(
                slugify(campanha)
            )}&utm_term=${encodeURIComponent(
                siglaEscritorio
            )}&utm_content=${encodeURIComponent(
                siglaProdutoEncontrada
            )}`;

            setUrlGerada(url);
        } else {
            // Limpa a URL gerada caso algum campo seja limpo pelo usuário
            setUrlGerada('');
        }

        // Reseta o estado do botão de copiar ao alterar qualquer input
        setCopiado(false);
    }, [canal, tipoAnuncio, programa, cl, campanha]);

    /**
     * Copia o conteúdo da URL gerada para a área de transferência do navegador
     * e ativa a mensagem de confirmação por 3 segundos.
     * 
     * @async
     * @function handleCopiar
     * @returns {Promise<void>}
     */
    const handleCopiar = async (): Promise<void> => {
        if (!urlGerada) return;
        await navigator.clipboard.writeText(urlGerada);
        setCopiado(true);

        // Desativa a mensagem de cópia após 3 segundos
        setTimeout(() => setCopiado(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center py-2 px-4">
            
            {/* Card Principal do Formulário */}
            <main className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-8 space-y-6 text-[#00204a] font-sans border border-gray-100">
                
                {/* Esqueleto de carregamento exibido enquanto metadados são buscados da API */}
                <LoadSkeletonDinamico aberta={carregandoMetadados} layoutLinhas={[2, 2, 1]} />

                {!carregandoMetadados && ( 
                    <>
                        {/* Cabeçalho da Tela */}
                        <div className="text-center space-y-2 mb-6">
                            <h1 className="text-3xl font-bold text-[#007bff]">
                                Gerador de URL - AIESEC
                            </h1>
                            <p className="text-sm text-gray-600 font-medium">
                                Todos os links criados e compartilhados em QUALQUER meio devem ser gerados por aqui!
                            </p>
                        </div>

                        {/* Linha 1: Seleção de Canal e Tipo de Anúncio */}
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

                        {/* Linha 2: Seleção de Programa e Escritório (CL) */}
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

                        {/* Linha 3: Inserção do Nome da Campanha (Tag) */}
                        <div>
                            <InputTexto
                                id="Tag"
                                legenda="Tag"
                                valor={campanha}
                                atualizar={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                                    const val: string = typeof e === 'string' ? e : e.target.value;
                                    setCampanha(val);
                                }}
                                obrigatorio={true}
                            />
                        </div>

                        {/* Informativo exibido enquanto o formulário estiver incompleto */}
                        {!urlGerada && (
                            <p className="text-xs text-gray-500 text-center italic pt-2">
                                A URL será gerada automaticamente assim que todos os campos forem preenchidos.
                            </p>
                        )}

                        {/* Exibição da URL Gerada e Botão de Cópia */}
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

                                {/* Feedback visual ao copiar a URL */}
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

                        {/* Rodapé Interno do Card */}
                        <footer className="text-center text-gray-500 text-sm pt-8">
                            © AIESEC no Brasil(2025-2026)
                        </footer>
                    </>
                )}
            </main>

            {/* Modal para tratamento global de erros de conexão */}
            <ModalErroGenerico
                aberta={modals.modalErroConexaoAberta}
                tipo={modals.tipoErroConexao}
                aoTentarNovamente={() => window.parent.location.reload()}
            />
        </div>
    );
}
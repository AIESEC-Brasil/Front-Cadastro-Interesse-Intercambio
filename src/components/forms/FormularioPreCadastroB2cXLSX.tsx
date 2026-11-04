'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Circle, CircleX, LoaderCircle, X } from 'lucide-react';
import * as XLSX from '@e965/xlsx';
import InputXlsx from '../ui/input/InputXlsx';
import LoadSkeletonDinamico from '../loading/LoadSkeletonDinamico';
import ModalErro from '../modal/ModalErro';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';
import { useFormularioPreCadastroB2c } from '../../hook/useFormularioPreCadastroB2c';
import type { DadosPlanilhaB2C } from '../../types/formulario';

type StatusLinha = 'aguardando' | 'enviando' | 'sucesso' | 'falha';

interface ResultadoLinha {
    linha: number;
    lead: DadosPlanilhaB2C;
    valores: ValorCelula[];
    status: StatusLinha;
    erro?: string;
}

interface LeadDaPlanilha {
    linha: number;
    dados: DadosPlanilhaB2C;
    valores: ValorCelula[];
}

type ValorCelula = string | number | boolean | Date;

interface PlanilhaLida {
    cabecalhos: ValorCelula[];
    leads: LeadDaPlanilha[];
}

interface DadosPlanilhaComErros {
    cabecalhos: ValorCelula[];
    linhas: Array<{ valores: ValorCelula[]; erro: string }>;
}

const cabecalhosObrigatorios = [
    'nome',
    'sobrenome',
    'email',
    'telefone',
    'nascimento',
    'produto',
    'comite',
    'como_conheceu',
] as const;

const LIMITE_ENVIO_CONCORRENTE = 3;

const normalizarCabecalho = (valor: ValorCelula) =>
    String(valor)
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[\s-]+/g, '_');

const formatarData = (valor: ValorCelula): string => {
    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        return [
            String(valor.getDate()).padStart(2, '0'),
            String(valor.getMonth() + 1).padStart(2, '0'),
            valor.getFullYear(),
        ].join('/');
    }

    if (typeof valor === 'number') {
        const data = XLSX.SSF.parse_date_code(valor);
        if (data) {
            return [
                String(data.d).padStart(2, '0'),
                String(data.m).padStart(2, '0'),
                String(data.y).padStart(4, '0'),
            ].join('/');
        }
    }

    return String(valor ?? '').trim();
};

const lerPlanilha = async (arquivo: File): Promise<PlanilhaLida> => {
    const workbook = XLSX.read(await arquivo.arrayBuffer(), {
        type: 'array',
        cellDates: true,
    });
    const nomeAba = workbook.SheetNames[0];
    const planilha = nomeAba ? workbook.Sheets[nomeAba] : undefined;
    if (!planilha) {
        throw new Error('A planilha não contém nenhuma aba com dados.');
    }

    const linhas = XLSX.utils.sheet_to_json<ValorCelula[]>(planilha, {
        header: 1,
        raw: true,
        defval: '',
        blankrows: true,
    });
    const cabecalhos = linhas[0] ?? [];
    const cabecalho = cabecalhos.map(normalizarCabecalho);
    const colunas = new Map(cabecalho.map((nome, indice) => [nome, indice]));
    const faltantes = cabecalhosObrigatorios.filter((nome) => !colunas.has(nome));

    if (faltantes.length > 0) {
        throw new Error(`Cabeçalhos obrigatórios ausentes: ${faltantes.join(', ')}.`);
    }

    const valor = (linha: ValorCelula[], coluna: string) => {
        const indice = colunas.get(coluna);
        return indice === undefined ? '' : String(linha[indice] ?? '').trim();
    };

    const leads = linhas.slice(1).flatMap((linha, indice) => {
        if (linha.every((celula) => String(celula).trim() === '')) return [];

        const valores = Array.from(
            { length: cabecalhos.length },
            (_, coluna) => linha[coluna] ?? ''
        );
        return [{
            linha: indice + 2,
            valores,
            dados: {
                nome: valor(linha, 'nome'),
                sobrenome: valor(linha, 'sobrenome'),
                email: valor(linha, 'email'),
                telefone: valor(linha, 'telefone'),
                nascimento: formatarData(linha[colunas.get('nascimento')!]),
                produto: valor(linha, 'produto'),
                comite: valor(linha, 'comite'),
                como_conheceu: valor(linha, 'como_conheceu'),
                tag: valor(linha, 'tag'),
            },
        }];
    });
    return { cabecalhos, leads };
};

const baixarPlanilhaComErros = (
    dados: DadosPlanilhaComErros,
    nomeArquivo: string
) => {
    const planilha = XLSX.utils.aoa_to_sheet([
        [...dados.cabecalhos, 'erro'],
        ...dados.linhas.map(({ valores, erro }) => [...valores, erro]),
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, planilha, 'Leads com erro');
    XLSX.writeFile(
        workbook,
        nomeArquivo.replace(/\.(xls|xlsx)$/i, '-com-erros.xlsx')
    );
};

const FormularioPreCadastroB2cXLSX = () => {
    const {
        carregandoMetadados,
        modalErroConexaoAberta,
        setModalErroConexaoAberta,
        tipoErroConexao,
        enviarLeadPlanilha,
    } = useFormularioPreCadastroB2c();
    const [arquivoPlanilha, setArquivoPlanilha] = useState<File | null>(null);
    const [processando, setProcessando] = useState(false);
    const [erroArquivo, setErroArquivo] = useState<string | null>(null);
    const [resultados, setResultados] = useState<ResultadoLinha[]>([]);
    const [modalAberta, setModalAberta] = useState(false);
    const [planilhaComErros, setPlanilhaComErros] = useState<DadosPlanilhaComErros | null>(null);
    const [erroDownload, setErroDownload] = useState<string | null>(null);

    const fazerDownloadErros = (
        dados: DadosPlanilhaComErros,
        nomeArquivo: string
    ) => {
        try {
            baixarPlanilhaComErros(dados, nomeArquivo);
            setErroDownload(null);
        } catch {
            setErroDownload('Não foi possível baixar a planilha com erros. Tente novamente.');
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!arquivoPlanilha || processando || carregandoMetadados) return;

        setProcessando(true);
        setErroArquivo(null);
        setErroDownload(null);
        setResultados([]);
        setPlanilhaComErros(null);

        try {
            const planilhaLida = await lerPlanilha(arquivoPlanilha);
            const { leads } = planilhaLida;
            if (leads.length === 0) {
                throw new Error('A planilha não contém leads para cadastrar.');
            }

            const linhasIniciais: ResultadoLinha[] = leads.map(({ linha, dados, valores }) => ({
                linha,
                lead: dados,
                valores,
                status: 'aguardando',
            }));
            let estados = linhasIniciais;
            setResultados(estados);
            setModalAberta(true);

            let proximoIndice = 0;
            const enviarProximoLead = async () => {
                while (proximoIndice < leads.length) {
                    const indice = proximoIndice;
                    proximoIndice += 1;

                    estados = estados.map((item, index) =>
                        index === indice ? { ...item, status: 'enviando' } : item
                    );
                    setResultados(estados);

                    try {
                        const resultado = await enviarLeadPlanilha(leads[indice].dados);
                        estados = estados.map((item, index) =>
                            index === indice
                                ? {
                                    ...item,
                                    status: resultado.sucesso ? 'sucesso' : 'falha',
                                    erro: resultado.erro,
                                }
                                : item
                        );
                    } catch (erro: unknown) {
                        estados = estados.map((item, index) =>
                            index === indice
                                ? {
                                    ...item,
                                    status: 'falha',
                                    erro: erro instanceof Error
                                        ? erro.message
                                        : 'Não foi possível enviar este lead.',
                                }
                                : item
                        );
                    }
                    setResultados(estados);
                }
            };

            const quantidadeDeEnvios = Math.min(LIMITE_ENVIO_CONCORRENTE, leads.length);
            await Promise.all(
                Array.from({ length: quantidadeDeEnvios }, () => enviarProximoLead())
            );

            const falhasDaPlanilha = estados
                .filter((resultado) => resultado.status === 'falha')
                .map(({ valores, erro }) => ({
                    valores,
                    erro: erro ?? 'Não foi possível cadastrar este lead.',
                }));
            if (falhasDaPlanilha.length > 0) {
                const dadosErros = {
                    cabecalhos: planilhaLida.cabecalhos,
                    linhas: falhasDaPlanilha,
                };
                setPlanilhaComErros(dadosErros);
                fazerDownloadErros(dadosErros, arquivoPlanilha.name);
            }
        } catch (erro: unknown) {
            setErroArquivo(
                erro instanceof Error
                    ? erro.message
                    : 'Não foi possível processar a planilha selecionada.'
            );
        } finally {
            setProcessando(false);
        }
    };

    const sucessos = resultados.filter((resultado) => resultado.status === 'sucesso').length;
    const falhas = resultados.filter((resultado) => resultado.status === 'falha').length;
    const concluidos = sucessos + falhas;

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Upload de Arquivo (.xls, .xlsx)
                </h1>
            </div>

            <div className="space-y-2 rounded-lg border-l-4 border-sky-600 bg-sky-50 p-4 text-sm text-gray-700">
                <p>
                    A primeira linha deve conter os cabeçalhos:{' '}
                    <strong className="text-gray-900">
                        nome, sobrenome, email, telefone, nascimento, produto, comite, como_conheceu
                    </strong>
                    . A coluna <strong>tag</strong> é opcional.
                </p>
                <p>
                    Use a data no formato DD/MM/AAAA. Produto, comitê e como_conheceu devem
                    corresponder às opções B2C disponíveis.
                </p>
                <p>
                    Os cadastros são enviados em pequenos grupos. Leads já cadastrados ou com dados
                    inválidos aparecem como falha, sem interromper as demais linhas.
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm text-gray-700">
                    Precisa do modelo da planilha? Acesse a planilha online:
                </p>
                <a
                    href="https://docs.google.com/spreadsheets/d/1bHWk9ZFYFuB6gCRSSxH0X5sYT4Jc-PSGO1WIsrLAopE/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
                >
                    Acessar modelo no Google Sheets
                </a>
            </div>

            {carregandoMetadados && <LoadSkeletonDinamico aberta layoutLinhas={[2, 1]} />}

            <InputXlsx
                id="planilha-leads"
                legenda="Planilha de leads"
                atualizar={setArquivoPlanilha}
                obrigatorio
                desabilitado={processando || carregandoMetadados}
            />

            {erroArquivo && (
                <p className="text-sm text-red-600" role="alert">
                    {erroArquivo}
                </p>
            )}

            <ButtonConfirmar
                type="submit"
                texto={processando ? 'Enviando leads...' : 'Enviar planilha'}
                aoClicar={() => {}}
                desabilitado={!arquivoPlanilha || processando || carregandoMetadados}
            />

            {modalAberta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="resultado-cadastro-titulo"
                        className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="resultado-cadastro-titulo" className="text-xl font-semibold text-gray-900">
                                    {processando ? 'Enviando pré-cadastros' : 'Envio da planilha concluído'}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600" aria-live="polite">
                                    {concluidos} de {resultados.length} processados — {sucessos} enviados,
                                    {' '}{falhas} com falha.
                                </p>
                            </div>
                            {!processando && (
                                <button
                                    type="button"
                                    onClick={() => setModalAberta(false)}
                                    aria-label="Fechar resultados"
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            )}
                        </div>

                        <ul className="max-h-[60vh] space-y-2 overflow-y-auto" aria-live="polite">
                            {resultados.map((resultado) => (
                                <li key={resultado.linha} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                                    <span className="mt-0.5 shrink-0" aria-hidden="true">
                                        {resultado.status === 'enviando' ? (
                                            <LoaderCircle className="animate-spin text-blue-600" size={20} />
                                        ) : resultado.status === 'sucesso' ? (
                                            <CheckCircle2 className="text-green-600" size={20} />
                                        ) : resultado.status === 'falha' ? (
                                            <CircleX className="text-red-600" size={20} />
                                        ) : (
                                            <Circle className="text-gray-300" size={20} />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900">
                                            {resultado.lead.nome} {resultado.lead.sobrenome}
                                        </p>
                                        <p className="text-xs text-gray-500">Linha {resultado.linha}</p>
                                        {resultado.erro && (
                                            <p className="mt-1 wrap-break-words text-sm text-red-700" role="alert">
                                                {resultado.erro}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {!processando && (
                            <>
                                {erroDownload && (
                                    <p className="mt-4 text-sm text-red-700" role="alert">
                                        {erroDownload}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap justify-end gap-3">
                                    {planilhaComErros && arquivoPlanilha && (
                                        <ButtonConfirmar
                                            texto="Baixar planilha com erros"
                                            aoClicar={() => fazerDownloadErros(planilhaComErros, arquivoPlanilha.name)}
                                        />
                                    )}
                                    <ButtonConfirmar
                                        texto="Fechar"
                                        aoClicar={() => setModalAberta(false)}
                                    />
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

            <ModalErro
                aberta={modalErroConexaoAberta}
                tipo={tipoErroConexao}
                aoFechar={() => setModalErroConexaoAberta(false)}
            />
        </form>
    );
};

export default FormularioPreCadastroB2cXLSX;

import { useState } from 'react';
import { aplicarMascaraData } from '../helpers/formatter';
import { contemApenasLetrasEspacos } from '../utils/validates';

export interface ItemDinamico {
    tipo: string;
    valor: string;
}

// ==========================================
// CACHE / ESTADO GLOBAL EM MEMÓRIA (SINGLETON)
// ==========================================
let estadoGlobalFormulario = {
    nome: '',
    sobrenome: '',
    senha: '',
    dataNascimento: '',
    itemId: 0,
    emails: [{ tipo: 'other', valor: '' }] as ItemDinamico[],
    telefones: [{ tipo: 'other', valor: '' }] as ItemDinamico[],
    curso: '',
    produtoSelecionado: '',
    idProduto: '' as number | string,
    origemSelecionada: '',
    idOrigem: '' as number | string,
    marcarSemUniversidade: false,
    universidadeSelecionada: '',
    idUniversidade: '' as number | string,
    escritorioSelecionado: '',
    idEscritorio: '' as string | number,
    termoLGPD: false,
    idiomasSelecionados: [] as string[],
    idIdiomas: [] as (string | number)[],
    semestreSelecionado: '',
    idSemestre: '' as string | number,
    anexoPdf: null as File | null,
    anexoBase64: null as string | null,
    areaAtuacao: '',
    idAreaAtuacao: '' as string | number,
    nivelAtuacao: '',
    idNivelAtuacao: '' as string | number,
};

let listenersGlobal: Array<() => void> = [];

const notificarListeners = () => {
    listenersGlobal.forEach((listener) => listener());
};

export function useFormFields() {
    const [, setForcarRender] = useState({});

    useState(() => {
        const atualizar = () => setForcarRender({});
        listenersGlobal.push(atualizar);

        return () => {
            listenersGlobal = listenersGlobal.filter((l) => l !== atualizar);
        };
    });

    const formatarNome = (val: string) => {
        const conectivos = ['da', 'de', 'di', 'do', 'du', 'a', 'e', 'i', 'o', 'u'];
        return val
            .split(' ')
            .map((p, index) => {
                const palavraLower = p.toLowerCase();
                if (index > 0 && conectivos.includes(palavraLower)) {
                    return palavraLower;
                }
                return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
            })
            .join(' ');
    };

    const limpar = () => {
            estadoGlobalFormulario = {
                nome: '',
                sobrenome: '',
                senha: '',
                dataNascimento: '',
                itemId: 0,
                emails: [{ tipo: 'other', valor: '' }] as ItemDinamico[],
                telefones: [{ tipo: 'other', valor: '' }] as ItemDinamico[],
                curso: '',
                produtoSelecionado: '',
                idProduto: '' as number | string,
                origemSelecionada: '',
                idOrigem: '' as number | string,
                marcarSemUniversidade: false,
                universidadeSelecionada: '',
                idUniversidade: '' as number | string,
                escritorioSelecionado: '',
                idEscritorio: '' as string | number,
                termoLGPD: false,
                idiomasSelecionados: [] as string[],
                idIdiomas: [] as (string | number)[],
                semestreSelecionado: '',
                idSemestre: '' as string | number,
                anexoPdf: null as File | null,
                anexoBase64: null as string | null,
                areaAtuacao: '',
                idAreaAtuacao: '' as string | number,
                nivelAtuacao: '',
                idNivelAtuacao: '' as string | number,
            }
    }

    return {
        nome: estadoGlobalFormulario.nome, 
        setNome: (v: string) => {
            if (contemApenasLetrasEspacos(v)) {
                estadoGlobalFormulario.nome = formatarNome(v);
                notificarListeners();
            }
        },
        sobrenome: estadoGlobalFormulario.sobrenome, 
        setSobrenome: (v: string) => {
            if (contemApenasLetrasEspacos(v)) {
                estadoGlobalFormulario.sobrenome = formatarNome(v);
                notificarListeners();
            }
        },
        senha: estadoGlobalFormulario.senha, 
        setSenha: (v: string) => {
            estadoGlobalFormulario.senha = v;
            notificarListeners();
        },
        curso: estadoGlobalFormulario.curso,
        setCurso: (v: string) => {
            if (contemApenasLetrasEspacos(v)) {
                estadoGlobalFormulario.curso = formatarNome(v);
                notificarListeners();
            }
        },
        dataNascimento: estadoGlobalFormulario.dataNascimento, 
        setDataNascimento: (v: string) => {
            estadoGlobalFormulario.dataNascimento = aplicarMascaraData(v);
            notificarListeners();
        },
        emails: estadoGlobalFormulario.emails, 
        setEmails: (v: ItemDinamico[] | ((prev: ItemDinamico[]) => ItemDinamico[])) => {
            estadoGlobalFormulario.emails = typeof v === 'function' ? v(estadoGlobalFormulario.emails) : v;
            notificarListeners();
        },
        itemId: estadoGlobalFormulario.itemId, 
        setItemId: (v: number | ((prev: number) => number)) => {
            estadoGlobalFormulario.itemId = typeof v === 'function' ? v(estadoGlobalFormulario.itemId) : v;
            notificarListeners();
        },
        telefones: estadoGlobalFormulario.telefones, 
        setTelefones: (v: ItemDinamico[] | ((prev: ItemDinamico[]) => ItemDinamico[])) => {
            estadoGlobalFormulario.telefones = typeof v === 'function' ? v(estadoGlobalFormulario.telefones) : v;
            notificarListeners();
        },
        produtoSelecionado: estadoGlobalFormulario.produtoSelecionado, 
        setProdutoSelecionado: (v: string) => {
            estadoGlobalFormulario.produtoSelecionado = v;
            notificarListeners();
        },
        idProduto: estadoGlobalFormulario.idProduto, 
        setIdProduto: (v: number | string) => {
            estadoGlobalFormulario.idProduto = v;
            notificarListeners();
        },
        origemSelecionada: estadoGlobalFormulario.origemSelecionada, 
        setOrigemSelecionada: (v: string) => {
            estadoGlobalFormulario.origemSelecionada = v;
            notificarListeners();
        },
        idOrigem: estadoGlobalFormulario.idOrigem, 
        setIdOrigem: (v: number | string) => {
            estadoGlobalFormulario.idOrigem = v;
            notificarListeners();
        },
        marcarSemUniversidade: estadoGlobalFormulario.marcarSemUniversidade, 
        setMarcarSemUniversidade: (v: boolean | ((prev: boolean) => boolean)) => {
            estadoGlobalFormulario.marcarSemUniversidade = typeof v === 'function' ? v(estadoGlobalFormulario.marcarSemUniversidade) : v;
            notificarListeners();
        },
        universidadeSelecionada: estadoGlobalFormulario.universidadeSelecionada, 
        setUniversidadeSelecionada: (v: string) => {
            estadoGlobalFormulario.universidadeSelecionada = v;
            notificarListeners();
        },
        idUniversidade: estadoGlobalFormulario.idUniversidade, 
        setIdUniversidade: (v: number | string) => {
            estadoGlobalFormulario.idUniversidade = v;
            notificarListeners();
        },
        escritorioSelecionado: estadoGlobalFormulario.escritorioSelecionado, 
        setEscritorioSelecionado: (v: string) => {
            estadoGlobalFormulario.escritorioSelecionado = v;
            notificarListeners();
        },
        idEscritorio: estadoGlobalFormulario.idEscritorio, 
        setIdEscritorio: (v: string | number) => {
            estadoGlobalFormulario.idEscritorio = v;
            notificarListeners();
        },
        termoLGPD: estadoGlobalFormulario.termoLGPD, 
        setTermoLGPD: (v: boolean | ((prev: boolean) => boolean)) => {
            estadoGlobalFormulario.termoLGPD = typeof v === 'function' ? v(estadoGlobalFormulario.termoLGPD) : v;
            notificarListeners();
        },
        idiomasSelecionados: estadoGlobalFormulario.idiomasSelecionados, 
        setIdiomasSelecionados: (v: string[] | ((prev: string[]) => string[])) => {
            estadoGlobalFormulario.idiomasSelecionados = typeof v === 'function' ? v(estadoGlobalFormulario.idiomasSelecionados) : v;
            notificarListeners();
        },
        idIdiomas: estadoGlobalFormulario.idIdiomas, 
        setIdIdiomas: (v: (string | number)[] | ((prev: (string | number)[]) => (string | number)[])) => {
            estadoGlobalFormulario.idIdiomas = typeof v === 'function' ? v(estadoGlobalFormulario.idIdiomas) : v;
            notificarListeners();
        },
        semestreSelecionado: estadoGlobalFormulario.semestreSelecionado, 
        setSemestreSelecionado: (v: string) => {
            estadoGlobalFormulario.semestreSelecionado = v;
            notificarListeners();
        },
        idSemestre: estadoGlobalFormulario.idSemestre, 
        setIdSemestre: (v: string | number) => {
            estadoGlobalFormulario.idSemestre = v;
            notificarListeners();
        },
        anexoPdf: estadoGlobalFormulario.anexoPdf, 
        setAnexoPdf: (v: File | null) => {
            estadoGlobalFormulario.anexoPdf = v;
            notificarListeners();
        },
        anexoBase64: estadoGlobalFormulario.anexoBase64, 
        setAnexoBase64: (v: string | null) => {
            estadoGlobalFormulario.anexoBase64 = v;
            notificarListeners();
        },
        areaAtuacaoSelecionada: estadoGlobalFormulario.areaAtuacao,
        setAreaAtuacao: (v: string) => {
            estadoGlobalFormulario.areaAtuacao = v;
            notificarListeners();
        },
        idAreaAtuacao: estadoGlobalFormulario.idAreaAtuacao,
        setIdAreaAtuacao: (v: string | number) => {
            estadoGlobalFormulario.idAreaAtuacao = v;
            notificarListeners();
        },
        nivelAtuacaoSelecionado: estadoGlobalFormulario.nivelAtuacao,
        setNivelAtuacao: (v: string) => {
            estadoGlobalFormulario.nivelAtuacao = v;
            notificarListeners();
        },
        idNivelAtuacao: estadoGlobalFormulario.idNivelAtuacao,
        setIdNivelAtuacao: (v: string | number) => {
            estadoGlobalFormulario.idNivelAtuacao = v;
            notificarListeners();
        },
        limpar
    };
}
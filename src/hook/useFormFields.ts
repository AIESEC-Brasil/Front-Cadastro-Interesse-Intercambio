import { useState } from 'react';
import { aplicarMascaraData } from '../helpers/formatter';
import { contemApenasLetrasEspacos } from '../utils/validates';

export interface ItemDinamico {
    tipo: string;
    valor: string;
}

export function useFormFields() {
    const [nome, setNome] = useState<string>('');
    const [sobrenome, setSobrenome] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [dataNascimento, setDataNascimento] = useState<string>('');
    const [itemId, setItemId] = useState<number>(0);
    const [emails, setEmails] = useState<ItemDinamico[]>([{ tipo: 'other', valor: '' }]);
    const [telefones, setTelefones] = useState<ItemDinamico[]>([{ tipo: 'other', valor: '' }]);
    const [curso,setCurso] = useState<string>('');
    const [produtoSelecionado, setProdutoSelecionado] = useState<string>('');
    const [idProduto, setIdProduto] = useState<number | string>('');

    const [origemSelecionada, setOrigemSelecionada] = useState<string>('');
    const [idOrigem, setIdOrigem] = useState<number | string>('');

    const [marcarSemUniversidade, setMarcarSemUniversidade] = useState<boolean>(false);
    const [universidadeSelecionada, setUniversidadeSelecionada] = useState<string>('');
    const [idUniversidade, setIdUniversidade] = useState<number | string>('');
    const [escritorioSelecionado, setEscritorioSelecionado] = useState<string>('');
    const [idEscritorio, setIdEscritorio] = useState<string | number>('');

    const [termoLGPD, setTermoLGPD] = useState<boolean>(false);

    const [idiomasSelecionados, setIdiomasSelecionados] = useState<string[]>([]);
    const [idIdiomas, setIdIdiomas] = useState<(string | number)[]>([]);

    const [semestreSelecionados, setSemestreSelecionado] = useState<string>('');
    const [idSemestre, setIdSemestre] = useState<string | number>('');

    const formatarNome = (val: string) => val.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');

    return {
        nome, setNome: (v: string) => {if (contemApenasLetrasEspacos(v)){setNome(formatarNome(v))}},
        sobrenome, setSobrenome: (v: string) => {if (contemApenasLetrasEspacos(v)){setSobrenome(formatarNome(v))}},
        senha, setSenha,
        curso,setCurso: (v: string) => {if (contemApenasLetrasEspacos(v)){setCurso(formatarNome(v))}},
        dataNascimento, setDataNascimento: (v: string) => setDataNascimento(aplicarMascaraData(v)),
        emails, setEmails,
        itemId, setItemId,
        telefones, setTelefones,
        produtoSelecionado, setProdutoSelecionado,
        idProduto, setIdProduto,
        origemSelecionada, setOrigemSelecionada,
        idOrigem, setIdOrigem,
        marcarSemUniversidade, setMarcarSemUniversidade,
        universidadeSelecionada, setUniversidadeSelecionada,
        idUniversidade, setIdUniversidade,
        escritorioSelecionado, setEscritorioSelecionado,
        idEscritorio, setIdEscritorio,
        termoLGPD, setTermoLGPD,
        idiomasSelecionados, setIdiomasSelecionados,
        idIdiomas, setIdIdiomas,
        semestreSelecionados, setSemestreSelecionado,
        idSemestre, setIdSemestre
    };
}
/** Par de sigla e rótulo usado para associar parâmetros de campanha a produtos. */
export interface ItemSigla {
    sigla: string;
    nome: string;
}

/** Par de sigla e nome de um escritório local da AIESEC. */
export interface ItemEscritorio {
    sigla: string;
    nome: string;
}

/** Rótulos oficiais usados para interpretar `utm_content` no gerador de URLs. */
const siglaProduto: ItemSigla[] = [
    { sigla: 'gv', nome: 'Voluntário Global' },
    { sigla: 'gtast', nome: 'Talento Global Short Term' },
    { sigla: 'gtalt', nome: 'Talento Global Mid e Long Term' },
    { sigla: 'gte', nome: 'Professor Global' }
];
/** Escritórios locais e siglas aceitas pelo gerador de URLs de campanha. */
const escritorios: ItemEscritorio[] = [
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

export {
    siglaProduto,
    escritorios
}

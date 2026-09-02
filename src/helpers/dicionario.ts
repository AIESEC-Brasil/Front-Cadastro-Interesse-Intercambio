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

export {
    siglaProduto,
    escritorios
}
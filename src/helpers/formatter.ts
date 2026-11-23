/**
 * @file formatter.ts / helper
 * @description Funções auxiliares para tradução de metadados e formatação de máscaras (telefone e data).
 */

/**
 * Converte rótulos técnicos de metadados em textos de interface em português.
 * Valores não reconhecidos são preservados para não esconder informação.
 *
 * @param palavras Rótulos recebidos da API, como tipos de telefone e e-mail.
 * @returns Cada rótulo original acompanhado do texto mostrado ao usuário.
 */
export async function traduzirPalavras(
    palavras: string[]
): Promise<Array<{ original: string; traduzido: string }>> {
    const dicionarioBase: Record<string, string> = {
        home: "Casa",
        main: "Principal",
        mobile: "Celular",
        other: "Outro",
        private_fax: "Fax Privado",
        work: "Trabalho",
        work_fax: "Fax do Trabalho"
    };

    const traducao = palavras.map(palavra => {
        const limpa = palavra.toLowerCase().trim();
        if (dicionarioBase[limpa]) {
            return { original: palavra, traduzido: dicionarioBase[limpa] };
        }
        if (limpa.includes('fax')) return { original: palavra, traduzido: 'Fax' };
        if (limpa.includes('phone')) return { original: palavra, traduzido: 'Telefone' };
        return { original: palavra, traduzido: palavra };
    });

    return traducao;
}

/**
 * Aplica a máscara de telefone brasileiro no formato (DD) 9XXXXXXXX.
 */
/** Aplica a máscara visual brasileira `(DD) 99999-9999`, limitada a 11 dígitos. */
const aplicarMascaraTelefone = (valor: string): string => {
    // A máscara é visual: antes do envio, removerMascaraTelefone extrai apenas
    // os dígitos para atender ao formato esperado pelo backend.
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);
    
    if (apenasNumeros.length <= 2) {
        return apenasNumeros.length ? `(${apenasNumeros}` : "";
    }
    if (apenasNumeros.length <= 7) {
        return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
};

/**
 * Remove a máscara de telefone, retornando apenas os dígitos numéricos.
 */
/** Remove a máscara de telefone e devolve somente os dígitos para a API. */
const removerMascaraTelefone = (valor: string): string => {
    return valor.replace(/\D/g, "");
};

/**
 * Aplica a máscara de data no formato DD/MM/YYYY.
 */
/** Insere separadores de data progressivamente no formato `DD/MM/AAAA`. */
const aplicarMascaraData = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 8);
    
    if (apenasNumeros.length <= 2) {
        return apenasNumeros;
    }
    if (apenasNumeros.length <= 4) {
        return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    }
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
};

/**
 * Remove a máscara de data, retornando no formato ano-m-d (YYYY-MM-DD).
 */
/** Converte uma data completa `DD/MM/AAAA` para `AAAA-MM-DD`. */
const removerMascaraData = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 8);
    
    if (apenasNumeros.length < 8) {
        return apenasNumeros; // Retorna o que tiver caso esteja incompleto
    }

    const dia = apenasNumeros.slice(0, 2);
    const mes = apenasNumeros.slice(2, 4);
    const ano = apenasNumeros.slice(4, 8);

    return `${ano}-${mes}-${dia}`;
};

/** Normaliza um texto para uso em caminhos e identificadores de campanha. */
const slugify = (texto: string): string => {
        return texto
            .toLowerCase()                       // tudo minúsculo
            .normalize("NFD")                    // separa letras dos acentos
            .replace(/[\u0300-\u036f]/g, "")     // remove acentos
            .replace(/\s+/g, "-")                // substitui espaços por hífen
            .replace(/[^a-z0-9-/]/g, "")         // mantém letras, números, hífen e barra
            .replace(/-+/g, "-")                 // evita múltiplos hífens
            .replace(/\/+/g, "/")                // evita múltiplas barras
            .replace(/^[-/]+|[-/]+$/g, "");      // remove hífens ou barras no início/fim
    }

/** Capitaliza nomes e mantém conectivos comuns em minúsculas. */
const formatarNome = (valor: string): string => {
    const conectivos = ['da', 'de', 'di', 'do', 'du', 'a', 'e', 'i', 'o', 'u'];
    return valor
        .split(' ')
        .map((palavra, indice) => {
            const minuscula = palavra.toLowerCase();
            if (indice > 0 && conectivos.includes(minuscula)) {
                return minuscula;
            }
            return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
        })
        .join(' ');
};

export {
    aplicarMascaraTelefone,
    removerMascaraTelefone,
    aplicarMascaraData,
    removerMascaraData,
    slugify,
    formatarNome
};

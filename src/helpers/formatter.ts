/**
 * @file formatter.ts / helper
 * @description Funções auxiliares para tradução de metadados e formatação de máscaras (telefone e data).
 */

export async function traduzirPalavras(palavras: string[]) {
    /** O backend envia valores técnicos; esta tabela traduz apenas rótulos
     * conhecidos e preserva o texto original quando não há tradução segura. */
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
const removerMascaraTelefone = (valor: string): string => {
    return valor.replace(/\D/g, "");
};

/**
 * Aplica a máscara de data no formato DD/MM/YYYY.
 */
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

export {
    aplicarMascaraTelefone,
    removerMascaraTelefone,
    aplicarMascaraData,
    removerMascaraData
};
export async function traduzirPalavras(palavras: string[]) {
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
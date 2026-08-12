const validarTexto = (Texto: string, campo: string): string[] => {
    if (!Texto.trim()) {
        return [`O campo ${campo} é obrigatório.`];
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(Texto.trim())) {
        return [`O campo ${campo} deve conter apenas letras e espaços.`];
    } else if (Texto.length < 3) {
        return [`O campo ${campo} deve ter pelo menos 3 caracteres.`];
    } else if (Texto.length > 100) {
        return [`O campo ${campo} deve ter no máximo 100 caracteres.`];
    }
    return [''];
};

const contemApenasLetrasEspacos = (valor: string): boolean => {
    if (valor === ""){
        return true
    }

    return /[A-Za-zÀ-ÿ\s]+$/.test(valor);
    };

const validarSenha = (senha: string): string[] => {
    const erros: string[] = [];
    
    if (!senha.trim()) {
        erros.push("O campo senha é obrigatório.");
    } else {
        // Lista de caracteres ou padrões proibidos
        const caracteresProibidos = /[;'"`\\\t\n\r]/;

        if (caracteresProibidos.test(senha)) {
            erros.push("A senha contém caracteres proibidos (como aspas, ponto e vírgula ou barras).");
        }
        if (senha.length < 8) {
            erros.push("A senha deve ter pelo menos 8 caracteres.");
        }
        if (!/[A-Z]/.test(senha)) {
            erros.push("A senha deve conter pelo menos uma letra maiúscula.");
        }
        if (!/[a-z]/.test(senha)) {
            erros.push("A senha deve conter pelo menos uma letra minúscula.");
        }
        if (!/\d/.test(senha)) {
            erros.push("A senha deve conter pelo menos um número.");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
            erros.push("A senha deve conter pelo menos um caractere especial.");
        }
    }

    if (erros.length === 0) {
        return [''];
    }

    return erros;
};

export { validarTexto, validarSenha, contemApenasLetrasEspacos };
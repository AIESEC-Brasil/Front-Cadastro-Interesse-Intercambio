/**
 * @file validates.ts
 * @description Funções utilitárias para validação de campos de formulário e formatação de máscaras.
 */

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
    if (valor === "") {
        return true;
    }
    return /^[A-Za-zÀ-ÿ\s]+$/.test(valor);
};

const validarSenha = (senha: string): string[] => {
    const erros: string[] = [];
    
    if (!senha.trim()) {
        erros.push("O campo senha é obrigatório.");
    } else {
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

const validarEmail = (emails: string[]): string[] => {
    const erros: string[] = [];
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emails || emails.length === 0) {
        return ["O campo e-mail é obrigatório."];
    }

    emails.forEach((email, index) => {
        const emailLimpo = email.trim();

        if (!emailLimpo) {
            erros.push(`O e-mail na posição ${index + 1} não pode estar vazio.`);
        } else if (!regexEmail.test(emailLimpo)) {
            erros.push(`O e-mail "${email}" é inválido.`);
        }
    });

    if (erros.length === 0) {
        return [''];
    }

    return erros;
};

const validarTelefone = (telefones: string[]): string[] => {
    const erros: string[] = [];
    const regexTelefone = /^(?:\(?\d{2}\)?\s?)?9\d{4}[-\s]?\d{4}$/;

    if (!telefones || telefones.length === 0) {
        return ["O campo telefone é obrigatório."];
    }

    telefones.forEach((telefone, index) => {
        const telefoneLimpo = telefone.trim();

        if (!telefoneLimpo) {
            erros.push(`O telefone na posição ${index + 1} não pode estar vazio.`);
        } else if (!regexTelefone.test(telefoneLimpo)) {
            erros.push(`O telefone "${telefone}" é inválido. O formato deve ser (DD) 9XXXXXXXX.`);
        }
    });

    if (erros.length === 0) {
        return [''];
    }

    return erros;
};

/**
 * Aplica a máscara de telefone brasileiro no formato (DD) 9XXXXXXXX.
 */
const aplicarMascaraTelefone = (valor: string): string => {
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

export { 
    validarTexto, 
    validarSenha, 
    contemApenasLetrasEspacos, 
    validarEmail, 
    validarTelefone, 
    aplicarMascaraTelefone, 
    removerMascaraTelefone 
};
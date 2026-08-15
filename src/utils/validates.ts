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
        } else {
            erros.push('')
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
        } else {
            erros.push('')
        }
    });

    if (erros.length === 0) {
        return [''];
    }

    return erros;
};

/**
 * Valida o formato e integridade de uma data no formato DD/MM/AAAA,
 * garantindo também que não seja informada uma data maior que a atual.
 */
const validarData = (data: string): string[] => {
    const erros: string[] = [];
    const dataLimpa = data.trim();
    const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (!dataLimpa) {
        return ["O campo data de nascimento é obrigatório."];
    }

    if (!regexData.test(dataLimpa)) {
        return ["A data deve estar no formato DD/MM/AAAA."];
    }

    const [, diaStr, mesStr, anoStr] = dataLimpa.match(regexData)!;
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    if (mes < 1 || mes > 12) {
        erros.push("O mês informado é inválido.");
    }

    const diasNoMes = new Date(ano, mes, 0).getDate();
    if (dia < 1 || dia > diasNoMes) {
        erros.push("O dia informado é inválido para o mês correspondente.");
    }

    const anoAtual = new Date().getFullYear();
    if (ano < 1900 || ano > anoAtual) {
        erros.push("O ano informado é inválido.");
    }

    // Validação para não permitir data maior que a atual
    const dataInformada = new Date(ano, mes - 1, dia);
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    if (dataInformada > dataAtual) {
        erros.push("Não é permitido informar uma data maior que a atual.");
    }

    if (erros.length === 0) {
        return [''];
    }

    return erros;
};

export { 
    validarTexto, 
    validarSenha, 
    contemApenasLetrasEspacos, 
    validarEmail, 
    validarTelefone,
    validarData
};
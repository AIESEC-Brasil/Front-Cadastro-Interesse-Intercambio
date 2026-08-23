import { useState, useEffect, useRef } from 'react';
import { validarTexto, validarSenha, validarEmail, validarTelefone, validarData } from '../utils/validates';

export function useFormValidation(fields: any, step: number) {
    const [erroNome, setErroNome] = useState<string>('');
    const [erroSobrenome, setErroSobrenome] = useState<string>('');
    const [erroSenha, setErroSenha] = useState<string[]>([]);
    const [erroDataNascimento, setErroDataNascimento] = useState<string>('');
    const [erroEmail, setErroEmail] = useState<string[]>([]);
    const [erroTelefone, setErroTelefone] = useState<string[]>([]);
    const [erroProduto, setErroProduto] = useState<string>('');
    const [erroOrigem, setErroOrigem] = useState<string>('');
    const [erroUniversidade, setErroUniversidade] = useState<string>('');
    const [erroEscritorio, setErroEscritorio] = useState<string>('');
    const [erroTermoLGPD, setErroTermoLGPD] = useState<string>('');
    const [erroCurso, setErroCurso] = useState<string>('');
    const [erroSemestre, setErroSemestre] = useState<string>('');
    const [erroIdiomas, setErroIdiomas] = useState<string>('');

    const prevEmailsLen = useRef(fields.emails.length);
    const prevTelefonesLen = useRef(fields.telefones.length);

    // Extração segura de valores primitivos para o array de dependências
    const nome = fields.nome;
    const sobrenome = fields.sobrenome;
    const curso = fields.curso;
    const senha = fields.senha;
    const dataNascimento = fields.dataNascimento;
    const emails = fields.emails;
    const telefones = fields.telefones;
    const produtoSelecionado = fields.produtoSelecionado;
    const idProduto = fields.idProduto;
    const origemSelecionada = fields.origemSelecionada;
    const idOrigem = fields.idOrigem;
    const marcarSemUniversidade = fields.marcarSemUniversidade;
    const universidadeSelecionada = fields.universidadeSelecionada;
    const idUniversidade = fields.idUniversidade;
    const escritorioSelecionado = fields.escritorioSelecionado;
    const idEscritorio = fields.idEscritorio;
    const semestreSelecionado = fields.semestreSelecionado;
    const idSemestre = fields.idSemestre;
    const idiomaSelecionados = fields.idiomasSelecionados;
    const idIdiomas = fields.idIdiomas;
    const termoLGPD = fields.termoLGPD;

    useEffect(() => {
        if (step === 1) {
            if (nome) {
                const eNome = validarTexto(nome, "nome");
                if (!eNome || (eNome.length > 0 && eNome[0] === '')) {
                    setErroNome('');
                } else if (eNome && eNome[0]) {
                    setErroNome(eNome[0]);
                }
            }

            if (sobrenome) {
                const eSobrenome = validarTexto(sobrenome, "sobrenome");
                if (!eSobrenome || (eSobrenome.length > 0 && eSobrenome[0] === '')) {
                    setErroSobrenome('');
                } else if (eSobrenome && eSobrenome[0]) {
                    setErroSobrenome(eSobrenome[0]);
                }
            }

            if (senha) {
                const eSenha = validarSenha(senha);
                if (!eSenha || eSenha.length === 0) {
                    setErroSenha([]);
                } else {
                    setErroSenha(eSenha);
                }
            }

            if (dataNascimento) {
                const eData = validarData(dataNascimento);
                if (!eData || eData.length === 0 || eData[0] === '') {
                    setErroDataNascimento('');
                } else if (eData && eData[0]) {
                    setErroDataNascimento(eData[0]);
                }
            }

            if (emails.some((e: any) => e.valor !== '')) {
                setErroEmail(validarEmail(emails.map((i: any) => i.valor)));
            }

            if (telefones.some((t: any) => t.valor !== '')) {
                setErroTelefone(validarTelefone(telefones.map((i: any) => i.valor)));
            }

            if (idProduto) {
                setErroProduto('');
            }

            if (idOrigem) {
                setErroOrigem('');
            }

            if (!marcarSemUniversidade) {
                if (idUniversidade) {
                    setErroUniversidade('');
                }
                setErroEscritorio('');
            } else {
                if (idEscritorio) {
                    setErroEscritorio('');
                }
                setErroUniversidade('');
            }

            if (termoLGPD) {
                setErroTermoLGPD('');
            }
        } else if (step === 2) {
            if (curso) {
                const eCurso = validarTexto(curso, "curso");
                if (!eCurso || (eCurso.length > 0 && eCurso[0] === '')) {
                    setErroCurso('');
                } else if (eCurso && eCurso[0]) {
                    setErroCurso(eCurso[0]);
                }
            } else {
                setErroCurso('');
            }

            if (idiomaSelecionados) {
                if (idiomaSelecionados === '' || (Array.isArray(idiomaSelecionados) && idiomaSelecionados.length === 0) || (idIdiomas && idIdiomas.length > 0)) {
                    setErroIdiomas('');
                }
            } else {
                setErroIdiomas('');
            }

            if (semestreSelecionado) {
                if (semestreSelecionado === '' || idSemestre) {
                    setErroSemestre('');
                }
            } else {
                setErroSemestre('');
            }
        }

        prevEmailsLen.current = emails.length;
        prevTelefonesLen.current = telefones.length;

    }, [
        step,
        nome,
        sobrenome,
        curso,
        senha,
        dataNascimento,
        emails.length,
        JSON.stringify(emails),
        telefones.length,
        JSON.stringify(telefones),
        produtoSelecionado,
        idProduto,
        origemSelecionada,
        idOrigem,
        marcarSemUniversidade,
        universidadeSelecionada,
        idUniversidade,
        escritorioSelecionado,
        idEscritorio,
        semestreSelecionado,
        idSemestre,
        JSON.stringify(idiomaSelecionados),
        JSON.stringify(idIdiomas),
        termoLGPD
    ]);
    
    const validarTudo = () => {
        const eNome = step === 1 ? validarTexto(fields.nome, "nome") : [''];
        const eSobrenome = step === 1 ? validarTexto(fields.sobrenome, "sobrenome") : [''];
        const eCurso = step === 2 ? (fields.curso ? validarTexto(fields.curso, "curso") : ['']) : [''];
        const eSenha = step === 1 ? validarSenha(fields.senha) : [];
        const eData = step === 1 ? validarData(fields.dataNascimento) : [''];
        const errsE = step === 1 ? validarEmail(fields.emails.map((i: any) => i.valor)) : [];
        const errsT = step === 1 ? validarTelefone(fields.telefones.map((i: any) => i.valor)) : [];
        const errProd = step === 1 && !fields.idProduto ? 'Campo obrigatório.' : '';
        const errOrigem = step === 1 && !fields.idOrigem ? 'Campo obrigatório.' : '';
        const errUni = step === 1 && !fields.marcarSemUniversidade && !fields.idUniversidade ? 'Campo obrigatório.' : '';
        const errEsc = step === 1 && fields.marcarSemUniversidade && !fields.idEscritorio ? 'Campo obrigatório.' : '';
        const errLGPD = step === 1 && !fields.termoLGPD ? 'Campo obrigatório.' : '';
       
        // Step 2 Opcional: Só valida se tem algo preenchido/selecionado mas falta o ID correspondente
        const temAlgoSemestre = fields.semestreSelecionado !== undefined && fields.semestreSelecionado !== null && fields.semestreSelecionado !== '' && fields.semestreSelecionado.length > 0;
        const errSemestre = step === 2 && temAlgoSemestre && !fields.idSemestre ? 'Selecione uma opção válida da lista.' : '';
        
        const temAlgoIdiomas = fields.idiomasSelecionados !== undefined && fields.idiomasSelecionados !== null && fields.idiomasSelecionados !== '' && fields.idiomasSelecionados.length > 0;
        const errIdiomas = step === 2 && temAlgoIdiomas && (!fields.idIdiomas || fields.idIdiomas.length === 0) ? 'Selecione uma opção válida da lista.' : '';

        const errosJson: any = {};
        if (step === 1) {
            if (eNome?.[0]) { setErroNome(eNome[0]); errosJson["Nome"] = eNome; }
            if (eSobrenome?.[0]) { setErroSobrenome(eSobrenome[0]); errosJson["Sobrenome"] = eSobrenome; }
            if (eSenha?.[0]) { setErroSenha(eSenha); errosJson["Senha"] = eSenha; }
            if (eData?.[0]) { setErroDataNascimento(eData[0]); errosJson["Data de Nascimento"] = eData; }
            if (errsE.some((e: string) => e !== '')) { setErroEmail(errsE); errosJson["E-mail"] = errsE.filter((e: string) => e !== ''); }
            if (errsT.some((e: string) => e !== '')) { setErroTelefone(errsT); errosJson["Telefone"] = errsT.filter((e: string) => e !== ''); }
            if (errProd) { setErroProduto(errProd); errosJson["Programa"] = [errProd]; }
            if (errOrigem) { setErroOrigem(errOrigem); errosJson["Como conheceu a AIESEC"] = [errOrigem]; }
            if (errUni) { setErroUniversidade(errUni); errosJson["Universidade"] = [errUni]; }
            if (errEsc) { setErroEscritorio(errEsc); errosJson["AIESEC mais Próxima"] = [errEsc]; }
            if (errLGPD) { setErroTermoLGPD(errLGPD); errosJson["Politica de Privacidade"] = [errLGPD]; }
        } else if (step === 2) {
            if (eCurso?.[0] !== '') { setErroCurso(eCurso[0]); errosJson["Curso"] = eCurso; }
            if (errSemestre) { setErroSemestre(errSemestre); errosJson["Semestre"] = [errSemestre]; }
            if (errIdiomas) { setErroIdiomas(errIdiomas); errosJson["Idiomas"] = [errIdiomas]; }
        }

        return {
            temErros: Object.keys(errosJson).length > 0,
            errosJson
        };
    };

    return {
        erros: {
            erroNome, erroSobrenome, erroSenha, erroDataNascimento, erroCurso,
            erroEmail, erroTelefone, erroProduto, erroOrigem,
            erroUniversidade, erroEscritorio, erroTermoLGPD, erroSemestre, erroIdiomas
        },
        validarTudo
    };
}
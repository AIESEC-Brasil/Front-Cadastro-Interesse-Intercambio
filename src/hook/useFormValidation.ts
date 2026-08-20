import { useState, useEffect, useRef } from 'react';
import { validarTexto, validarSenha, validarEmail, validarTelefone, validarData } from '../utils/validates';

export function useFormValidation(fields: any) {
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
    const origemSelecionada = fields.origemSelecionada;
    const marcarSemUniversidade = fields.marcarSemUniversidade;
    const universidadeSelecionada = fields.universidadeSelecionada;
    const escritorioSelecionado = fields.escritorioSelecionado;
    const termoLGPD = fields.termoLGPD;

    useEffect(() => {
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

        if (produtoSelecionado) {
            setErroProduto('');
        }

        if (origemSelecionada) {
            setErroOrigem('');
        }

        if (!marcarSemUniversidade) {
            if (universidadeSelecionada) {
                setErroUniversidade('');
            }
            setErroEscritorio('');
        } else {
            if (escritorioSelecionado) {
                setErroEscritorio('');
            }
            setErroUniversidade('');
        }

        if (termoLGPD) {
            setErroTermoLGPD('');
        }

        prevEmailsLen.current = emails.length;
        prevTelefonesLen.current = telefones.length;

    }, [
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
        origemSelecionada,
        marcarSemUniversidade,
        universidadeSelecionada,
        escritorioSelecionado,
        termoLGPD
    ]);

    const validarTudo = () => {
        const eNome = validarTexto(fields.nome, "nome");
        const eSobrenome = validarTexto(fields.sobrenome, "sobrenome");
        const eCurso = validarTexto(fields.curso, "curso");
        const eSenha = validarSenha(fields.senha);
        const eData = validarData(fields.dataNascimento);
        const errsE = validarEmail(fields.emails.map((i: any) => i.valor));
        const errsT = validarTelefone(fields.telefones.map((i: any) => i.valor));
        const errProd = !fields.produtoSelecionado ? 'Campo obrigatório.' : '';
        const errOrigem = !fields.origemSelecionada ? 'Campo obrigatório.' : '';
        const errUni = !fields.marcarSemUniversidade && !fields.universidadeSelecionada ? 'Campo obrigatório.' : '';
        const errEsc = fields.marcarSemUniversidade && !fields.escritorioSelecionado ? 'Campo obrigatório.' : '';
        const errLGPD = !fields.termoLGPD ? 'Campo obrigatório.' : '';

        const errosJson: any = {};
        if (eNome?.[0]) { setErroNome(eNome[0]); errosJson.nome = eNome; }
        if (eSobrenome?.[0]) { setErroSobrenome(eSobrenome[0]); errosJson.sobrenome = eSobrenome; }
        if (eSenha?.[0]) { setErroSenha(eSenha); errosJson.senha = eSenha; }
        if (eData?.[0]) { setErroDataNascimento(eData[0]); errosJson["Data de Nascimento"] = eData; }
        if (errsE.some((e: string) => e !== '')) { setErroEmail(errsE); errosJson.email = errsE.filter((e: string) => e !== ''); }
        if (errsT.some((e: string) => e !== '')) { setErroTelefone(errsT); errosJson.telefone = errsT.filter((e: string) => e !== ''); }
        if (errProd) { setErroProduto(errProd); errosJson.produto = [errProd]; }
        if (errOrigem) { setErroOrigem(errOrigem); errosJson.origem = [errOrigem]; }
        if (errUni) { setErroUniversidade(errUni); errosJson.universidade = [errUni]; }
        if (errEsc) { setErroEscritorio(errEsc); errosJson.escritorio = [errEsc]; }
        if (errLGPD) { setErroTermoLGPD(errLGPD); errosJson.lgpd = [errLGPD]; }

        return {
            temErros: Object.keys(errosJson).length > 0,
            errosJson
        };
    };

    return {
        erros: {
            erroNome, erroSobrenome, erroSenha, erroDataNascimento,erroCurso,
            erroEmail, erroTelefone, erroProduto, erroOrigem,
            erroUniversidade, erroEscritorio, erroTermoLGPD
        },
        validarTudo
    };
}
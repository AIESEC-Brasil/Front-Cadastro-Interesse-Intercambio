"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Componente de formulário de pré-cadastro com validação por input, modais dinâmicas e botão do tipo button.
 */

import React, { useState } from 'react';

/**
 * Importação dos estilos modulares específicos para o comportamento e layout do formulário.
 */
import styles from "./style.module.css";

/**
 * Importação do componente reutilizável de campo de texto e botão.
 */
import InputTexto from '../ui/input/InputTexto';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';

/**
 * Importação dos componentes de modais dinâmicas (Erro e Sucesso).
 */
import ModalErro from '../modal/ModalErro';
import ModalSucesso from '../modal/ModalSucesso';

const FormularioPreCadastro = () => {
    /** Estados para os valores dos inputs. */
    const [nome, setNome] = useState<string>('');
    const [sobrenome, setSobrenome] = useState<string>('');
    
    /** Estados para armazenar a mensagem de erro específica de cada input ("Nome inválido" / "Sobrenome inválido"). */
    const [erroNome, setErroNome] = useState<string>('');
    const [erroSobrenome, setErroSobrenome] = useState<string>('');

    /** Estados de controle para a Modal de Erro geral e de Sucesso. */
    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});

    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [dadosResumo, setDadosResumo] = useState<Record<string, string | number | string[]>>({});

    /**
     * Função de validação e disparo acionada pelo clique no botão.
     */
    const validarEProcessar = () => {
        let temErro = false;
        const listaErrosCampos: Record<string, string[]> = {};

        // Validação do Nome
        if (!nome.trim()) {
            setErroNome('Nome inválido');
            listaErrosCampos.nome = ['O campo "Nome" é obrigatório.'];
            temErro = true;
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome.trim())) {
            setErroNome('Nome inválido');
            listaErrosCampos.nome = ['O campo "Nome" deve conter apenas letras e espaços.'];
            temErro = true;
        } else {
            setErroNome('');
        }

        // Validação do Sobrenome
        if (!sobrenome.trim()) {
            setErroSobrenome('Sobrenome inválido');
            listaErrosCampos.sobrenome = ['O campo "Sobrenome" é obrigatório.'];
            temErro = true;
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(sobrenome.trim())) {
            setErroSobrenome('Sobrenome inválido');
            listaErrosCampos.sobrenome = ['O campo "Sobrenome" deve conter apenas letras e espaços.'];
            temErro = true;
        } else {
            setErroSobrenome('');
        }

        // Se houver erros, abre a modal de erro estruturada em JSON
        if (temErro) {
            setErrosJson(listaErrosCampos);
            setModalErroAberta(true);
            return;
        }

        // Se passou, exibe a modal de sucesso/resumo contendo os dados do lead
        setDadosResumo({
            Nome: nome.trim(),
            Sobrenome: sobrenome.trim()
        });
        setModalSucessoAberta(true);
    };

    const handleConfirmarEnvio = () => {
        console.log("Dados confirmados e enviados com sucesso!");
        setModalSucessoAberta(false);
    };

    return (
        <>
            {/* O formulário agora gerencia os inputs sem disparar o submit nativo por enter/botão */}
            <div id="meuForm" className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Input de Nome */}
                    <InputTexto
                        id="nome"
                        legenda="Nome"
                        valor={nome}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setNome(e.target.value);
                            if (erroNome) setErroNome('');
                        }}
                        error={erroNome}
                        obrigatorio={true}
                    />

                    {/* Input de Sobrenome */}
                    <InputTexto
                        id="sobrenome"
                        legenda="Sobrenome"
                        valor={sobrenome}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSobrenome(e.target.value);
                            if (erroSobrenome) setErroSobrenome('');
                        }}
                        error={erroSobrenome}
                        obrigatorio={true}
                    />
                </div>
                <ButtonConfirmar 
                        texto="Avançar" 
                        aoClicar={validarEProcessar} 
                        type="button" 
                    />
                
                {/* Botão explicitamente do tipo 'button', acionando a função de validação via click */}
                <div className="flex justify-end mt-2">
                    
                </div>
            </div>

            {/* Modal de Erro */}
            <ModalErro
                aberta={modalErroAberta}
                titulo="Dados incorretos."
                erros={errosJson}
                aoFechar={() => setModalErroAberta(false)}
            />

            {/* Modal de Sucesso */}
            <ModalSucesso
                aberta={modalSucessoAberta}
                titulo="Confirme seus dados"
                mensagem="Por favor, verifique se as informações abaixo estão corretas antes de prosseguir:"
                resumoDados={dadosResumo}
                aoEditar={() => setModalSucessoAberta(false)}
                aoConfirmar={handleConfirmarEnvio}
            />

            <div className="mt-8 text-center">
                <span className={styles.copyright}>&copy; AIESEC no Brasil (2026). Todos os direitos reservados.</span>
            </div>
        </>
    );
};

export default FormularioPreCadastro;
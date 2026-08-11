"use client";

/**
 * @file FormularioPreCadastro.tsx
 * @description Componente de formulário de pré-cadastro contendo a estrutura principal, inputs controlados e rodapé institucional.
 */

import React, { useState } from 'react';

/**
 * Importação dos estilos modulares específicos para o comportamento e layout do formulário.
 */
import styles from "./style.module.css";

/**
 * Importação do componente reutilizável de campo de texto.
 */
import InputTexto from '../ui/input/InputTexto';
import ButtonEditar from '../ui/buttons/ButtonEditar';

/**
 * Componente do formulário de pré-cadastro contendo a estrutura principal, inputs e o rodapé institucional.
 * Utiliza React States tipados para gerenciar de forma controlada os campos de entrada de dados.
 * 
 * @returns {JSX.Element} O formulário renderizado com layout responsivo do Tailwind CSS.
 */
const FormularioPreCadastro = () => {
    /** Estado tipado para armazenar o valor do campo Nome. */
    const [nome, setNome] = useState<string>('');

    /** Estado tipado para armazenar o valor do campo Sobrenome. */
    const [sobrenome, setSobrenome] = useState<string>('');
    
    return (
        <>
            {/* Elemento de formulário principal com alinhamento flexível e espaçamento entre os elementos */}
            <form id="meuForm" className="flex flex-col gap-4">
                {/* Grid responsivo do Tailwind: 1 coluna por padrão e 2 colunas a partir de telas médias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Componente de input controlado para o Nome */}
                    <InputTexto
                        id="nome"
                        legenda="Nome"
                        valor={nome}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                        obrigatorio={true}
                    />

                    {/* Componente de input controlado para o Sobrenome */}
                    <InputTexto
                        id="sobrenome"
                        legenda="Sobrenome"
                        valor={sobrenome}
                        atualizar={(e: React.ChangeEvent<HTMLInputElement>) => setSobrenome(e.target.value)}
                        obrigatorio={true}
                    />
                </div>
            </form>

            {/* Rodapé institucional contendo as informações de direitos reservados */}
            <div className="mt-8 text-center">
                <span className={styles.copyright}>&copy; AIESEC no Brasil (2026). Todos os direitos reservados.</span>
            </div>
        </>
    );
};

export default FormularioPreCadastro;
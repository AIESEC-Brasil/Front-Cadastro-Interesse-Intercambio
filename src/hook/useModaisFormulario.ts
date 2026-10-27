import { useState } from 'react';
import type { ConflictData } from '../types/componentes';
import type { ValorResumo } from '../types/formulario';

/**
 * Reúne o estado de todas as mensagens de feedback do cadastro.
 *
 * `modalErroAberta` representa dados inválidos, enquanto `modalConflitoAberta`
 * representa uma resposta de conflito da API. `modalSucessoAberta` é uma etapa
 * intermediária: mostra o resumo antes do envio. Os dois estados de sucesso
 * restantes pertencem, respectivamente, ao cadastro inicial e à qualificação.
 * Manter esses estados juntos evita que cada formulário precise conhecer os
 * detalhes de todos os modais.
 */
export function useModaisFormulario() {
    const [carregandoEnvio, setCarregandoEnvio] = useState<boolean>(false);
    
    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [modalErroConexaoAberta, setModalErroConexaoAberta] = useState<boolean>(false);
    const [modalConflitoAberta,setModalConflitoAberta] = useState<boolean>(false);
    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [modalSucessoCadastroAberta, setModalSucessoCadastroAberta] = useState<boolean>(false);
    const [modalSucessoQualificaco,setModalSucessoQualificaco] = useState<boolean>(false);
    
    const [dataConflito,setDataConflito] = useState<ConflictData | string>('');
    const [tipoErroConexao, setTipoErroConexao] = useState<'conexao' | 'bug'>('conexao');
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});
    const [dadosResumo, setDadosResumo] = useState<Record<string, ValorResumo>>({});

    return {
        carregandoEnvio, setCarregandoEnvio,
        modalErroAberta, setModalErroAberta,
        modalErroConexaoAberta, setModalErroConexaoAberta,
        modalConflitoAberta,setModalConflitoAberta,
        modalSucessoAberta, setModalSucessoAberta,
        modalSucessoCadastroAberta, setModalSucessoCadastroAberta,
        modalSucessoQualificaco,setModalSucessoQualificaco,
        tipoErroConexao, setTipoErroConexao,
        errosJson, setErrosJson,
        dadosResumo, setDadosResumo,
        dataConflito,setDataConflito
    };
}
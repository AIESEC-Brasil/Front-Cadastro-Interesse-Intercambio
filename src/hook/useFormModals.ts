import { useState } from 'react';

export function useFormModals() {
    const [carregandoMetadados, setCarregandoMetadados] = useState<boolean>(true);
    const [carregandoEnvio, setCarregandoEnvio] = useState<boolean>(false);
    
    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [modalErroConexaoAberta, setModalErroConexaoAberta] = useState<boolean>(false);
    const [modalConflitoAberta,setModalConflitoAberta] = useState<boolean>(false);
    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [modalSucessoCadastroAberta, setModalSucessoCadastroAberta] = useState<boolean>(false);
    
    const [dataConflito,setDataConflito] = useState<Record<string, string[]> | string>('');
    const [tipoErroConexao, setTipoErroConexao] = useState<'conexao' | 'bug'>('conexao');
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});
    const [dadosResumo, setDadosResumo] = useState<Record<string, any>>({});

    return {
        carregandoMetadados, setCarregandoMetadados,
        carregandoEnvio, setCarregandoEnvio,
        modalErroAberta, setModalErroAberta,
        modalErroConexaoAberta, setModalErroConexaoAberta,
        modalConflitoAberta,setModalConflitoAberta,
        modalSucessoAberta, setModalSucessoAberta,
        modalSucessoCadastroAberta, setModalSucessoCadastroAberta,
        tipoErroConexao, setTipoErroConexao,
        errosJson, setErrosJson,
        dadosResumo, setDadosResumo,
        dataConflito,setDataConflito
    };
}
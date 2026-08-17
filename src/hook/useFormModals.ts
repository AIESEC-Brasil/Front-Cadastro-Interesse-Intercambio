import { useState } from 'react';

export function useFormModals() {
    const [carregandoMetadados, setCarregandoMetadados] = useState<boolean>(true);
    const [carregandoEnvio, setCarregandoEnvio] = useState<boolean>(false);
    
    const [modalErroAberta, setModalErroAberta] = useState<boolean>(false);
    const [modalErroConexaoAberta, setModalErroConexaoAberta] = useState<boolean>(false);
    const [modalSucessoAberta, setModalSucessoAberta] = useState<boolean>(false);
    const [modalSucessoCadastroAberta, setModalSucessoCadastroAberta] = useState<boolean>(false);
    
    const [tipoErroConexao, setTipoErroConexao] = useState<'conexao' | 'bug'>('conexao');
    const [errosJson, setErrosJson] = useState<Record<string, string[]>>({});
    const [dadosResumo, setDadosResumo] = useState<Record<string, any>>({});

    return {
        carregandoMetadados, setCarregandoMetadados,
        carregandoEnvio, setCarregandoEnvio,
        modalErroAberta, setModalErroAberta,
        modalErroConexaoAberta, setModalErroConexaoAberta,
        modalSucessoAberta, setModalSucessoAberta,
        modalSucessoCadastroAberta, setModalSucessoCadastroAberta,
        tipoErroConexao, setTipoErroConexao,
        errosJson, setErrosJson,
        dadosResumo, setDadosResumo
    };
}
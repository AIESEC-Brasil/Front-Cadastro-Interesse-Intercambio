import type { ChangeEvent } from 'react';

/** Identificador aceito pelo backend para uma opção cadastrada. */
export type IdEntidade = string | number;

/** ID ainda vazio ou não escolhido pelo usuário. */
export type IdEntidadeSemDefinir = IdEntidade | '';

/** Estrutura única usada por produtos, origens, universidades e demais listas. */
export interface OpcaoMetadados {
  id: IdEntidade;
  nome: string;
}

/** Opção recebida do backend antes de ser convertida para OpcaoMetadados. */
export interface OpcaoMetadadosApi {
  id: IdEntidade;
  text: string;
}

/** Opção de contato traduzida para exibição, mantendo o valor original para envio. */
export interface OpcaoTraduzida {
  original: string;
  traduzido: string;
}

/** Linha reutilizável de e-mail ou telefone. */
export interface ItemContato {
  tipo: string;
  valor: string;
}

/** Callback padrão usado pelos campos de texto controlados. */
export type ManipuladorMudancaEntradaTexto = (event: ChangeEvent<HTMLInputElement>) => void;

/** Callback dos campos que devolvem o texto escolhido e seu ID. */
export type ManipuladorSelecaoMetadados = (nomeSelecionado: string, idSelecionado: IdEntidade) => void;

/** Callback de avanço entre as etapas do formulário. */
export type ManipuladorMudancaEtapa = (step: number) => void;

/** Callback de seleção de arquivo e seu conteúdo convertido. */
export type ManipuladorMudancaArquivo = (arquivo: File | null, base64: string | null) => void;

import type { ChangeEvent } from 'react';

/** Identificador aceito pelo backend para uma opção cadastrada. */
export type EntityId = string | number;

/** ID ainda vazio ou não escolhido pelo usuário. */
export type NullableEntityId = EntityId | '';

/** Estrutura única usada por produtos, origens, universidades e demais listas. */
export interface MetadataOption {
  id: EntityId;
  nome: string;
}

/** Opção recebida do backend antes de ser convertida para MetadataOption. */
export interface ApiMetadataOption {
  id: EntityId;
  text: string;
}

/** Opção de contato traduzida para exibição, mantendo o valor original para envio. */
export interface TranslatedOption {
  original: string;
  traduzido: string;
}

/** Linha reutilizável de e-mail ou telefone. */
export interface ContactItem {
  tipo: string;
  valor: string;
}

/** Callback padrão usado pelos campos de texto controlados. */
export type TextInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;

/** Callback dos campos que devolvem o texto escolhido e seu ID. */
export type MetadataSelectionHandler = (nomeSelecionado: string, idSelecionado: EntityId) => void;

/** Callback de avanço entre as etapas do formulário. */
export type StepChangeHandler = (step: number) => void;

/** Callback de seleção de arquivo e seu conteúdo convertido. */
export type FileChangeHandler = (arquivo: File | null, base64: string | null) => void;

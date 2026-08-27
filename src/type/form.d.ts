import type { ContactItem, EntityId, MetadataOption, NullableEntityId } from './common';

/** Estado completo compartilhado entre pré-cadastro e qualificação. */
export interface FormFieldsState {
  nome: string;
  sobrenome: string;
  senha: string;
  dataNascimento: string;
  itemId: number;
  emails: ContactItem[];
  telefones: ContactItem[];
  curso: string;
  produtoSelecionado: string;
  idProduto: NullableEntityId;
  origemSelecionada: string;
  idOrigem: NullableEntityId;
  marcarSemUniversidade: boolean;
  universidadeSelecionada: string;
  idUniversidade: NullableEntityId;
  escritorioSelecionado: string;
  idEscritorio: NullableEntityId;
  termoLGPD: boolean;
  idiomasSelecionados: string[];
  idIdiomas: EntityId[];
  semestreSelecionado: string;
  idSemestre: NullableEntityId;
  anexoPdf: File | null;
  anexoBase64: string | null;
  areaAtuacao: string;
  idAreaAtuacao: NullableEntityId;
  nivelAtuacao: string;
  idNivelAtuacao: NullableEntityId;
}

/** Mensagens agrupadas pelo nome do campo. */
export type FieldErrors = Record<string, string[]>;

/** Valor que pode aparecer no resumo antes da confirmação do envio. */
export type SummaryValue = string | number | string[];

/** Resumo apresentado ao usuário antes do envio definitivo. */
export type FormSummary = Record<string, SummaryValue>;

/** Resultado padrão da validação completa de uma etapa. */
export interface ValidationResult {
  temErros: boolean;
  errosJson: FieldErrors;
}

/** Contato no formato aceito pelo endpoint de cadastro. */
export interface EmailPayload {
  tipo: string;
  email: string;
}

/** Telefone no formato aceito pelo endpoint de cadastro. */
export interface PhonePayload {
  tipo: string;
  numero: string;
}

/** Referência de uma opção selecionada enviada para a API. */
export interface SelectedOptionPayload extends MetadataOption {}

/** Produto com os identificadores usados pelo sistema externo. */
export interface ProductPayload {
  id_podio: EntityId;
  titulo: string;
  id_expa?: number;
}

/** Arquivo de currículo convertido para transporte no payload. */
export interface CurriculumPayload {
  nome: string;
  base64: string | null;
}

/** Corpo enviado na primeira etapa do cadastro. */
export interface PreCadastroPayload {
  nome: string;
  sobrenome: string;
  senha: string;
  dataNascimento: string;
  email: EmailPayload[];
  telefone: PhonePayload[];
  produto: ProductPayload;
  origem: SelectedOptionPayload;
  autorizacao: 1;
  universidade?: SelectedOptionPayload;
  comite?: SelectedOptionPayload;
}

/** Corpo enviado na atualização opcional da qualificação. */
export interface QualificacaoPayload {
  item_id: number;
  curso?: string;
  curriculo?: CurriculumPayload;
  idiomas?: SelectedOptionPayload[];
  semestreCurso?: SelectedOptionPayload;
  areaAtuacao?: SelectedOptionPayload;
  nivelAtuacao?: SelectedOptionPayload;
}

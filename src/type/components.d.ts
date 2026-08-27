import type { FileChangeHandler, MetadataOption, MetadataSelectionHandler, StepChangeHandler, TextInputChangeHandler, TranslatedOption } from './common';
import type { FieldErrors, FormSummary } from './form';

export interface FormularioProps {
  rota: string;
  state: StepChangeHandler;
  step: number;
}

export interface LoadSkeletonProps {
  aberta: boolean;
  layoutLinhas?: number[];
}

export interface LoadSpinnerProps {
  aberta: boolean;
  message?: string;
}

export interface ButtonProps {
  texto: string;
  aoClicar: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface ErrorModalProps {
  aberta: boolean;
  titulo?: string;
  erros: FieldErrors;
  aoFechar: () => void;
}

export type ConnectionErrorType = 'conexao' | 'bug';

export interface ConnectionErrorModalProps {
  aberta: boolean;
  aoTentarNovamente: () => void;
  tipo: ConnectionErrorType;
}

export interface ConflictData {
  erro?: string;
  emails?: Array<{ email: string }>;
  telefone?: Array<{ numero: string }>;
  [key: string]: unknown;
}

export interface ConflictModalProps {
  aberta: boolean;
  titulo?: string;
  dadosErro: ConflictData | string;
  aoFechar: () => void;
}

export interface SummaryModalProps {
  aberta: boolean;
  titulo?: string;
  mensagem?: string;
  resumoDados?: FormSummary;
  aoEditar: () => void;
  aoConfirmar: () => void;
}

export interface CadastroSuccessModalProps {
  aberta: boolean;
  senha: string;
  emailReferencia: string;
  aoConcluir: () => void;
}

export interface QualificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TextInputProps {
  id: string;
  legenda: string;
  valor: string;
  atualizar: TextInputChangeHandler;
  error?: string | string[];
  obrigatorio?: boolean;
}

export interface PasswordInputProps extends TextInputProps {}

export interface DateInputProps extends TextInputProps {}

export interface AutoCompleteProps {
  id: string;
  legenda: string;
  valor: string;
  atualizar: MetadataSelectionHandler;
  opcoes: MetadataOption[];
  error?: string;
  obrigatorio?: boolean;
  placeholder?: string;
  desabilitado?: boolean;
}

export interface DynamicInputProps {
  tituloLabel: string;
  placeholderInput: string;
  tipoInput?: string;
  itens: import('./common').ContactItem[];
  opcoesTipo: TranslatedOption[];
  erros?: string[];
  aoAdicionar: () => void;
  aoRemover: (index: number) => void;
  aoAtualizarTipo: (index: number, novoTipo: string) => void;
  aoAtualizarValor: (index: number, novoValor: string) => void;
  obrigatorio?: boolean;
}

export interface LanguageMultiSelectProps {
  id: string;
  legenda: string;
  selecionados: MetadataOption[];
  atualizar: (novosSelecionados: MetadataOption[]) => void;
  opcoes: MetadataOption[];
  error?: string;
  obrigatorio?: boolean;
  placeholder?: string;
  desabilitado?: boolean;
}

export interface PdfInputProps {
  id: string;
  legenda: string;
  arquivo: File | null;
  atualizar: FileChangeHandler;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  tamanhoMaximoMb?: number;
}

export interface CalendarDay {
  dia: number;
  outroMes: boolean;
  mesRef: number;
  anoRef: number;
}

export type CalendarView = 'dias' | 'anos';

import type { ManipuladorMudancaArquivo, OpcaoMetadados, ManipuladorSelecaoMetadados, ManipuladorMudancaEtapa, ManipuladorMudancaEntradaTexto, OpcaoTraduzida } from './comum';
import type { ErrosCampos, ResumoFormulario } from './formulario';

export interface params {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

export interface FormularioProps {
  rota: string;
  state: ManipuladorMudancaEtapa;
  step: number;
  params?: params
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
  desabilitado?: boolean;
}

export type ConnectionErrorType = 'conexao' | 'bug';
export type ErrorModalType = 'validacao' | ConnectionErrorType;

export interface ErrorModalProps {
  aberta: boolean;
  tipo: ErrorModalType;
  erros?: ErrosCampos;
  aoFechar: () => void;
  aoTentarNovamente?: () => void;
  titulo?: string;
  mensagem?: string;
  botaoTexto?: string;
  mostrarContato?: boolean;
  tema?: 'claro' | 'escuro';
}

export interface ConflictData {
  erro?: string;
  error?: boolean | string;
  message?: string;
  emails?: Array<{ email: string }>;
  telefone?: Array<{ numero: string }>;
  error_details?: Array<{ loc: string; msg: string }>;
}

export interface ConflictModalProps {
  aberta: boolean;
  tipo?: 'cadastro' | 'b2c';
  dadosErro?: ConflictData | string;
  aoFechar: () => void;
}

export interface SummaryModalProps {
  aberta: boolean;
  titulo?: string;
  mensagem?: string;
  resumoDados?: ResumoFormulario;
  aoEditar: () => void;
  aoConfirmar: () => void;
}

export interface FinalSuccessModalProps {
  aberta: boolean;
  tipo: 'cadastro' | 'preCadastroB2c' | 'qualificacao';
  emailReferencia?: string;
  senha?: string;
  aoFechar: () => void;
}

export interface TextInputProps {
  id: string;
  legenda: string;
  valor: string;
  atualizar: ManipuladorMudancaEntradaTexto;
  error?: string | string[];
  obrigatorio?: boolean;
}

export interface PasswordInputProps extends TextInputProps {}

export interface DateInputProps extends TextInputProps {}

export interface AutoCompleteProps {
  id: string;
  legenda: string;
  valor: string;
  atualizar: ManipuladorSelecaoMetadados;
  opcoes: OpcaoMetadados[];
  error?: string;
  obrigatorio?: boolean;
  placeholder?: string;
  desabilitado?: boolean;
}

export interface DynamicInputProps {
  tituloLabel: string;
  placeholderInput: string;
  tipoInput?: string;
  itens: import('./common').ItemContato[];
  opcoesTipo: OpcaoTraduzida[];
  erros?: string[];
  maxItens?: number;
  aoAdicionar: () => void;
  aoRemover: (index: number) => void;
  aoAtualizarTipo: (index: number, novoTipo: string) => void;
  aoAtualizarValor: (index: number, novoValor: string) => void;
  obrigatorio?: boolean;
}

export interface LanguageMultiSelectProps {
  id: string;
  legenda: string;
  selecionados: OpcaoMetadados[];
  atualizar: (novosSelecionados: OpcaoMetadados[]) => void;
  opcoes: OpcaoMetadados[];
  error?: string;
  obrigatorio?: boolean;
  placeholder?: string;
  desabilitado?: boolean;
}

export interface PdfInputProps {
  id: string;
  legenda: string;
  arquivo: File | null;
  atualizar: ManipuladorMudancaArquivo;
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

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
}

export interface ErrorModalProps {
  aberta: boolean;
  titulo?: string;
  erros: ErrosCampos;
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
  resumoDados?: ResumoFormulario;
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

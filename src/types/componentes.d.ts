/** Contratos de props compartilhados pelos componentes visuais da aplicação. */
import type { ManipuladorMudancaArquivo, OpcaoMetadados, ManipuladorSelecaoMetadados, ManipuladorMudancaEtapa, ManipuladorMudancaEntradaTexto, OpcaoTraduzida } from './comum';
import type { ErrosCampos, ResumoFormulario } from './formulario';

/** Parâmetros de campanha lidos da URL e usados para pré-preencher formulários. */
export interface params {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

/** Propriedades comuns aos formulários de pré-cadastro e qualificação. */
export interface FormularioProps {
  rota: string;
  state: ManipuladorMudancaEtapa;
  step: number;
  params?: params
}

/** Controla a visibilidade e o número de colunas do esqueleto de carregamento. */
export interface LoadSkeletonProps {
  aberta: boolean;
  layoutLinhas?: number[];
}

/** Estado e mensagem do indicador que bloqueia a interface durante uma operação. */
export interface LoadSpinnerProps {
  aberta: boolean;
  message?: string;
}

/** Contrato de um botão de ação reutilizável. */
export interface ButtonProps {
  texto: string;
  aoClicar: () => void;
  type?: 'button' | 'submit' | 'reset';
  desabilitado?: boolean;
}

/** Origem da falha exibida no modal de erro. */
export type ConnectionErrorType = 'conexao' | 'bug';
/** Tipos de conteúdo que o modal de erro consegue apresentar. */
export type ErrorModalType = 'validacao' | ConnectionErrorType;

/** Dados de estado, mensagens e callbacks do modal de erro. */
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

/** Campos de conflito devolvidos pela API, como e-mails ou telefones duplicados. */
export interface ConflictData {
  erro?: string;
  error?: boolean | string;
  message?: string;
  emails?: Array<{ email: string }>;
  telefone?: Array<{ numero: string }>;
  error_details?: Array<{ loc: string; msg: string }>;
}

/** Propriedades do modal que detalha um conflito HTTP 409. */
export interface ConflictModalProps {
  aberta: boolean;
  tipo?: 'cadastro' | 'b2c';
  dadosErro?: ConflictData | string;
  aoFechar: () => void;
}

/** Dados e ações do resumo que pede confirmação antes do envio. */
export interface SummaryModalProps {
  aberta: boolean;
  titulo?: string;
  mensagem?: string;
  resumoDados?: ResumoFormulario;
  aoEditar: () => void;
  aoConfirmar: () => void;
}

/** Propriedades dos modais que confirmam a conclusão de uma etapa. */
export interface FinalSuccessModalProps {
  aberta: boolean;
  tipo: 'cadastro' | 'preCadastroB2c' | 'qualificacao';
  emailReferencia?: string;
  senha?: string;
  aoFechar: () => void;
}

/** Contrato compartilhado pelos campos de texto controlados. */
export interface TextInputProps {
  id: string;
  legenda: string;
  valor: string;
  atualizar: ManipuladorMudancaEntradaTexto;
  error?: string | string[];
  obrigatorio?: boolean;
}

/** Propriedades adicionais necessárias para validar a confirmação da senha. */
export interface PasswordInputProps extends TextInputProps {
  confirmarValor: string;
  atualizarConfirmacao: ManipuladorMudancaEntradaTexto;
  erroConfirmacao?: string | string[];
}

/** O campo de data reutiliza o contrato dos campos de texto. */
export interface DateInputProps extends TextInputProps {}

/** Dados, opções e callbacks de um campo com busca/autocomplete. */
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

/** Configuração do controle para listas editáveis, como e-mails e telefones. */
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

/** Estado e opções do seletor múltiplo de idiomas. */
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

/** Arquivo local e callback de atualização do campo de currículo PDF. */
export interface PdfInputProps {
  id: string;
  legenda: string;
  arquivo: File | null;
  atualizar: ManipuladorMudancaArquivo;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  tamanhoMaximoMb?: number;
}

/** Dia renderizado pelo calendário, incluindo a origem no mês visível. */
export interface CalendarDay {
  dia: number;
  outroMes: boolean;
  mesRef: number;
  anoRef: number;
}

/** Modos disponíveis no seletor de calendário. */
export type CalendarView = 'dias' | 'anos';

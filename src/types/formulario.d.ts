import type { ItemContato, IdEntidade, OpcaoMetadados, IdEntidadeSemDefinir } from './comum';

/** Estado completo compartilhado entre pré-cadastro e qualificação. */
export interface EstadoCamposFormulario {
  nome: string;
  sobrenome: string;
  senha: string;
  dataNascimento: string;
  itemId: number;
  emails: ItemContato[];
  telefones: ItemContato[];
  curso: string;
  produtoSelecionado: string;
  idProduto: IdEntidadeSemDefinir;
  origemSelecionada: string;
  idOrigem: IdEntidadeSemDefinir;
  meioSelecionado: string;
  idMeio:IdEntidadeSemDefinir;
  marcarSemUniversidade: boolean;
  universidadeSelecionada: string;
  idUniversidade: IdEntidadeSemDefinir;
  escritorioSelecionado: string;
  idEscritorio: IdEntidadeSemDefinir;
  termoLGPD: boolean;
  idiomasSelecionados: string[];
  idIdiomas: IdEntidade[];
  semestreSelecionado: string;
  idSemestre: IdEntidadeSemDefinir;
  anexoPdf: File | null;
  anexoBase64: string | null;
  areaAtuacao: string;
  idAreaAtuacao: IdEntidadeSemDefinir;
  nivelAtuacao: string;
  idNivelAtuacao: IdEntidadeSemDefinir;
  tag: string[];
}

/** Mensagens agrupadas pelo nome do campo. */
export type ErrosCampos = Record<string, string[]>;

/** Valor que pode aparecer no resumo antes da confirmação do envio. */
export type ValorResumo = string | number | string[];

/** Resumo apresentado ao usuário antes do envio definitivo. */
export type ResumoFormulario = Record<string, ValorResumo>;

/** Resultado padrão da validação completa de uma etapa. */
export interface ResultadoValidacao {
  temErros: boolean;
  errosJson: ErrosCampos;
}

/** Contato no formato aceito pelo endpoint de cadastro. */
export interface DadosEnvioEmail {
  tipo: string;
  email: string;
}

/** Telefone no formato aceito pelo endpoint de cadastro. */
export interface DadosEnvioTelefone {
  tipo: string;
  numero: string;
}

/** Referência de uma opção selecionada enviada para a API. */
export interface DadosOpcaoSelecionada extends OpcaoMetadados {}

/** Produto com os identificadores usados pelo sistema externo. */
export interface DadosProduto {
  id: IdEntidade;
  titulo: string;
  id_expa: number;
}

/** Arquivo de currículo convertido para transporte no payload. */
export interface DadosCurriculo {
  fileName: string;
  base64: string | null;
}

/** Corpo enviado na primeira etapa do cadastro. */
export interface DadosPreCadastro {
  nome: string;
  sobrenome: string;
  senha: string;
  dataNascimento: string;
  email: DadosEnvioEmail[];
  telefone: DadosEnvioTelefone[];
  produto: DadosProduto;
  origem: DadosOpcaoSelecionada;
  autorizacao: 1;
  universidade?: string;
  comite?: DadosOpcaoSelecionada;
  meio?: DadosOpcaoSelecionada;
  tag?: string[];
}

/** Corpo enviado na atualização opcional da qualificação. */
export interface DadosQualificacao {
  id: number;
  curso?: string;
  curriculo?: DadosCurriculo;
  idiomas?: DadosOpcaoSelecionada[];
  semestreCurso?: DadosOpcaoSelecionada;
  areaAtuacao?: DadosOpcaoSelecionada;
  nivelAtuacao?: DadosOpcaoSelecionada;
}

/** Identificador retornado pelo backend após criar o pré-cadastro. */
export interface LeadPreCadastroResponse {
  id: number;
  status: 'pré-cadastro';
}

/** Formato padronizado de erro de validação retornado pelo backend. */
export interface ApiErrorResponse {
  error?: boolean | string;
  type?: string;
  message?: string;
  error_details?: Array<{ loc: string; msg: string }>;
  status_code?: number;
  emails?: Array<{ email: string }>;
  telefone?: Array<{ numero: string }>;
}

/** Registro retornado pela rota de divisão de mercado. */
export interface RegistroDivisaoMercado {
  id?: IdEntidade;
  nome: string;
  [campo: string]: unknown;
}

/** Resposta efetiva do endpoint de universidades do backend. */
export interface UniversidadesResponse {
  dados: RegistroDivisaoMercado[];
  timestamp: string;
}

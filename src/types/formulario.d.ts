import type { ItemContato, IdEntidade, OpcaoMetadados, IdEntidadeSemDefinir } from './common';

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
  id_podio: IdEntidade;
  titulo: string;
  id_expa?: number;
}

/** Arquivo de currículo convertido para transporte no payload. */
export interface DadosCurriculo {
  nome: string;
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
  universidade?: DadosOpcaoSelecionada;
  comite?: DadosOpcaoSelecionada;
}

/** Corpo enviado na atualização opcional da qualificação. */
export interface DadosQualificacao {
  item_id: number;
  curso?: string;
  curriculo?: DadosCurriculo;
  idiomas?: DadosOpcaoSelecionada[];
  semestreCurso?: DadosOpcaoSelecionada;
  areaAtuacao?: DadosOpcaoSelecionada;
  nivelAtuacao?: DadosOpcaoSelecionada;
}

"use client";

import axios from "axios";
import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import InputAnexoPdf from "@/components/ui/input/InputAnexoPdf";
import InputAutoComplete from "@/components/ui/input/InputAutoComplete";
import InputData from "@/components/ui/input/InputData";
import InputMultiSelectIdiomas from "@/components/ui/input/InputMultiSelectIdiomas";
import InputSenha from "@/components/ui/input/InputSenha";
import InputTexto from "@/components/ui/input/InputTexto";
import LoadSpinner from "@/components/loading/LoadSpinner";
import ModalConfirmacao from "@/components/modal/ModalConfirmacao";
import apiOgxClient from "@/service/clients/apiOgxClient";
import { aplicarMascaraData } from "@/helpers/formatter";
import {
  validarCurso,
  validarData,
  validarEmail,
  validarSenha,
  validarTelefone,
  validarTexto,
} from "@/utils/validates";
import type { OpcaoMetadados } from "@/types/comum";
import type { ApiErrorResponse } from "@/types/formulario";

interface LeadLink {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  idProgramaExpa: number;
  idComite: string;
  nomeCl: string;
}

interface OpcaoApi {
  id: number | string;
  text: string;
  status?: string;
}

interface CampoApi {
  external_id: string;
  config?: {
    settings?: {
      options?: OpcaoApi[];
    };
  };
}

interface RespostaMetadados {
  data: {
    fields: CampoApi[];
  };
}

interface ArquivoCurriculo {
  arquivo: File;
  base64: string;
}

const programasExpa: Record<number, string> = {
  7: "Voluntário Global",
  8: "Talento Global Short Term",
  9: "Professor Global",
};

const opcoesAtivas = (campo?: CampoApi): OpcaoMetadados[] =>
  (campo?.config?.settings?.options ?? [])
    .filter((opcao) => {
      const status = opcao.status?.toLowerCase();
      return !status || status === "active" || status === "activate";
    })
    .map((opcao) => ({ id: opcao.id, nome: opcao.text }));

const formatarDataInicial = (valor: string | null) => {
  if (!valor || valor === "null") return "";
  const [ano, mes, dia] = valor.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "";
  return `${dia}/${mes}/${ano}`;
};

const converterDataParaApi = (valor: string) => {
  const [dia, mes, ano] = valor.split("/");
  return `${ano}-${mes}-${dia}T00:00:00`;
};

function CompletarCadastroContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [lead] = useState<LeadLink>(() => ({
    id: searchParams.get("id") ?? "",
    nome: searchParams.get("nome") ?? "",
    sobrenome: searchParams.get("sobrenome") ?? "",
    email: searchParams.get("email") ?? "",
    telefone: searchParams.get("telefone") ?? "",
    dataNascimento: searchParams.get("data_nasc") ?? "",
    idProgramaExpa: Number(searchParams.get("produto")),
    idComite: searchParams.get("comite") ?? "",
    nomeCl: searchParams.get("nomeCl") ?? "",
  }));
  const erroLink =
    [
      lead.id,
      lead.nome,
      lead.sobrenome,
      lead.email,
      lead.telefone,
      lead.idComite,
    ].some((valor) => !valor || valor === "null") ||
    !programasExpa[lead.idProgramaExpa] ||
    !/^\d+$/.test(lead.id) ||
    !/^\d+$/.test(lead.idComite)
      ? "Este link está incompleto ou inválido. Solicite um novo link de conclusão."
      : "";
  const [opcoes, setOpcoes] = useState<Record<string, OpcaoMetadados[]>>({});
  const [erroValidacaoLink, setErroValidacaoLink] = useState("");
  const [validandoLink, setValidandoLink] = useState(!erroLink);
  const [linkValidado, setLinkValidado] = useState(false);
  const [erroMetadados, setErroMetadados] = useState("");
  const [carregandoMetadados, setCarregandoMetadados] = useState(!erroLink);
  const [dataNascimento, setDataNascimento] = useState(() =>
    formatarDataInicial(lead.dataNascimento)
  );
  const [senha, setSenha] = useState("");
  const [senhaFoiAlterada, setSenhaFoiAlterada] = useState(false);
  const [curso, setCurso] = useState("");
  const [idiomas, setIdiomas] = useState<OpcaoMetadados[]>([]);
  const [areaAtuacao, setAreaAtuacao] = useState("");
  const [nomeAreaAtuacao, setNomeAreaAtuacao] = useState("");
  const [nivelAtuacao, setNivelAtuacao] = useState("");
  const [nomeNivelAtuacao, setNomeNivelAtuacao] = useState("");
  const [semestre, setSemestre] = useState("");
  const [nomeSemestre, setNomeSemestre] = useState("");
  const [curriculo, setCurriculo] = useState<ArquivoCurriculo | null>(null);
  const [erroEnvio, setErroEnvio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [modalConfirmacaoAberta, setModalConfirmacaoAberta] = useState(false);

  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${window.location.hash}`
    );
  }, [pathname]);

  useEffect(() => {
    let ativo = true;
    if (erroLink) {
      return () => {
        ativo = false;
      };
    }

    const carregarDados = async () => {
      try {
        await apiOgxClient.post("/new-lead-ogx/cadastro-b2c/validar", {
          id: Number(lead.id),
        });
      } catch (erro: unknown) {
        if (!ativo) return;
        const status = axios.isAxiosError(erro)
          ? erro.response?.status
          : undefined;
        setErroValidacaoLink(
          status === 409
            ? "Você já concluiu seu cadastro. Este link não é mais válido."
            : status === 404
              ? "Não encontramos um cadastro pendente. Este link é inválido ou já foi utilizado."
              : "Não foi possível validar este link agora. Tente novamente mais tarde."
        );
        setValidandoLink(false);
        setCarregandoMetadados(false);
        return;
      }

      if (!ativo) return;
      setValidandoLink(false);
      setLinkValidado(true);

      try {
        const { data } = await apiOgxClient.get<RespostaMetadados>(
          "/new-lead-ogx/metadados"
        );
        if (!ativo) return;
        const campos = data.data.fields;
        const externalIds = [
          "produto",
          "aiesec_proxima",
          "idiomas",
          "area_atuacao",
          "nivel_mercado",
          "semestre_curso",
        ];
        setOpcoes(
          Object.fromEntries(
            externalIds.map((externalId) => [
              externalId,
              opcoesAtivas(
                campos.find((campo) => campo.external_id === externalId)
              ),
            ])
          )
        );
      } catch {
        if (ativo) {
          setErroMetadados(
            "Não foi possível carregar as opções do cadastro. Tente novamente."
          );
        }
      } finally {
        if (ativo) setCarregandoMetadados(false);
      }
    };

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [erroLink, lead.id]);

  const nomePrograma = programasExpa[lead.idProgramaExpa];
  const produto = opcoes.produto?.find(
    (opcao) => opcao.nome.toLowerCase() === nomePrograma?.toLowerCase()
  );
  const comite = opcoes.aiesec_proxima?.find(
    (opcao) => String(opcao.id) === lead.idComite
  );

  const idiomaFormatado = idiomas;
  const atualizarIdiomas = useCallback((novosIdiomas: OpcaoMetadados[]) => {
    setIdiomas(novosIdiomas);
  }, []);

  const atualizarDataNascimento = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setDataNascimento(aplicarMascaraData(evento.target.value));
  };

  const atualizarCurriculo = (arquivo: File | null, base64: string | null) => {
    setCurriculo(arquivo && base64 ? { arquivo, base64 } : null);
  };

  const validarFormulario = () => {
    if (!lead) return "Link de conclusão inválido.";
    const erros = [
      ...validarTexto(lead.nome, "nome").filter(Boolean),
      ...validarTexto(lead.sobrenome, "sobrenome").filter(Boolean),
      ...validarEmail([lead.email]).filter(Boolean),
      ...validarTelefone([lead.telefone]).filter(Boolean),
      ...validarData(dataNascimento).filter(Boolean),
      ...validarSenha(senha).filter(Boolean),
    ];

    if (!produto) erros.push("O produto informado no link não está disponível.");
    if (!comite && !lead.nomeCl) erros.push("O comitê informado no link não está disponível.");
    if (curso && validarCurso(curso).some(Boolean)) {
      erros.push(...validarCurso(curso).filter(Boolean));
    }
    if (!lead.id || !/^\d+$/.test(lead.id)) erros.push("O identificador do lead é inválido.");
    if (!lead.idComite || !/^\d+$/.test(lead.idComite)) erros.push("O comitê do lead é inválido.");

    return erros.join(" ");
  };

  const abrirConfirmacao = () => {
    setErroEnvio("");
    const erro = validarFormulario();
    if (erro) {
      setErroEnvio(erro);
      return;
    }
    if (!lead || !produto) {
      setErroEnvio("Não foi possível validar os dados deste link.");
      return;
    }

    setModalConfirmacaoAberta(true);
  };

  const enviarCadastro = async () => {
    setModalConfirmacaoAberta(false);
    setErroEnvio("");
    const erro = validarFormulario();
    if (erro) {
      setErroEnvio(erro);
      return;
    }
    if (!lead || !produto) {
      setErroEnvio("Não foi possível validar os dados deste link.");
      return;
    }

    setEnviando(true);
    try {
      const payload: Record<string, unknown> = {
        id: Number(lead.id),
        nome: lead.nome,
        sobrenome: lead.sobrenome,
        emails: [{ email: lead.email, tipo: "other" }],
        telefones: [{ numero: lead.telefone.replace(/\D/g, ""), tipo: "other" }],
        dataNascimento: converterDataParaApi(dataNascimento),
        idProduto: Number(produto.id),
        idProgramaExpa: lead.idProgramaExpa,
        idComite: Number(lead.idComite),
        nomeCL: (comite?.nome ?? lead.nomeCl)
          .replace(/AIESEC\s+(em|no|na)\s+/i, "")
          .replace(/unidade\s+/i, "")
          .replace(/são paulo\s+/i, "")
          .trim()
          .toLowerCase(),
        idAutorizacao: "1",
        senha,
      };

      if (idiomas.length > 0) payload.idiomas = idiomas.map((idioma) => Number(idioma.id));
      if (curso.trim()) payload.curso = curso.trim();
      if (areaAtuacao) payload.area_atuacao = Number(areaAtuacao);
      if (nivelAtuacao) payload.nivel_mercado = Number(nivelAtuacao);
      if (semestre) payload.semestre = Number(semestre);
      if (curriculo) {
        payload.file = curriculo.base64;
        payload.fileName = curriculo.arquivo.name;
      }

      await apiOgxClient.put("/new-lead-ogx/cadastro-b2c", payload);
      setConcluido(true);
    } catch (erro: unknown) {
      const resposta = axios.isAxiosError<ApiErrorResponse>(erro)
        ? erro.response?.data
        : undefined;
      setErroEnvio(
        resposta?.error_details?.map((item) => item.msg).join(" ") ||
          resposta?.message ||
          "Não foi possível concluir o cadastro. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const campoProfissional = [8, 9].includes(lead?.idProgramaExpa ?? 0);
  const resumoDados = {
    "Data de nascimento": dataNascimento,
    Senha: "Informada",
    Idiomas:
      idiomas.length > 0
        ? idiomas.map((idioma) => idioma.nome)
        : "Não informado",
    ...(campoProfissional
      ? {
          "Área de atuação": nomeAreaAtuacao || "Não informada",
          "Nível de atuação": nomeNivelAtuacao || "Não informado",
        }
      : { Curso: curso.trim() || "Não informado" }),
    Semestre: nomeSemestre || "Não informado",
    Currículo: curriculo?.arquivo.name ?? "Não anexado",
  };

  if (concluido) {
    return (
      <main className="mx-auto mt-10 w-full max-w-2xl rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 text-2xl font-bold text-blue-900">Cadastro concluído!</h1>
        <p className="text-gray-700">Seus dados foram enviados com sucesso.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-10 w-full max-w-4xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-2xl font-bold text-blue-900">Complete seu cadastro</h1>

      {erroLink || erroValidacaoLink ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {erroLink || erroValidacaoLink}
        </p>
      ) : validandoLink ? (
        <p role="status" className="rounded-lg bg-blue-50 p-4 text-blue-800">
          Validando seu link de cadastro...
        </p>
      ) : (
        <>
          {erroMetadados && <p role="alert" className="mb-4 text-red-600">{erroMetadados}</p>}
          <div className="flex flex-col gap-5">
            {linkValidado && (
              <p className="mb-6 text-gray-600">Olá, {lead.nome} {lead.sobrenome}!</p>
            )}
            <InputData
              id="dataNascimento"
              legenda="Data de Nascimento"
              valor={dataNascimento}
              atualizar={atualizarDataNascimento}
              obrigatorio
            />
            <InputSenha
              id="senha"
              legenda="Definir senha"
              valor={senha}
              atualizar={(evento) => {
                setSenha(evento.target.value);
                setSenhaFoiAlterada(true);
              }}
              error={senhaFoiAlterada ? validarSenha(senha) : [""]}
              obrigatorio
            />

            {!carregandoMetadados && (
              <>
                <InputMultiSelectIdiomas
                  id="idiomas"
                  legenda="Idiomas e Proficiência (Opcional)"
                  selecionados={idiomaFormatado}
                  atualizar={atualizarIdiomas}
                  opcoes={opcoes.idiomas ?? []}
                />

                {campoProfissional ? (
                  <>
                    <InputAutoComplete
                      id="areaAtuacao"
                      legenda="Área de Atuação (Opcional)"
                      valor={nomeAreaAtuacao}
                      atualizar={(nome, id) => {
                        setNomeAreaAtuacao(nome);
                        setAreaAtuacao(id === "" ? "" : String(id));
                      }}
                      opcoes={opcoes.area_atuacao ?? []}
                    />
                    <InputAutoComplete
                      id="nivelAtuacao"
                      legenda="Nível de Atuação no Mercado (Opcional)"
                      valor={nomeNivelAtuacao}
                      atualizar={(nome, id) => {
                        setNomeNivelAtuacao(nome);
                        setNivelAtuacao(id === "" ? "" : String(id));
                      }}
                      opcoes={opcoes.nivel_mercado ?? []}
                    />
                  </>
                ) : (
                  <InputTexto
                    id="curso"
                    legenda="Curso (Opcional)"
                    valor={curso}
                    atualizar={(evento) => setCurso(evento.target.value)}
                    obrigatorio={false}
                  />
                )}

                <InputAutoComplete
                  id="semestre"
                  legenda="Semestre atual (Opcional)"
                  valor={nomeSemestre}
                  atualizar={(nome, id) => {
                    setNomeSemestre(nome);
                    setSemestre(id === "" ? "" : String(id));
                  }}
                  opcoes={opcoes.semestre_curso ?? []}
                />

                <InputAnexoPdf
                  id="curriculo"
                  legenda="Anexe seu currículo em PDF (Opcional)"
                  arquivo={curriculo?.arquivo ?? null}
                  atualizar={atualizarCurriculo}
                  tamanhoMaximoMb={5}
                />
              </>
            )}

            {erroEnvio && <p role="alert" className="text-sm text-red-600">{erroEnvio}</p>}
            <button
              type="button"
              onClick={abrirConfirmacao}
              disabled={enviando || carregandoMetadados || Boolean(erroMetadados)}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Concluir cadastro"}
            </button>
          </div>
        </>
      )}
      <LoadSpinner aberta={enviando} message="Enviando cadastro..." />
      <ModalConfirmacao
        aberta={modalConfirmacaoAberta}
        mensagem="Confira os dados adicionais informados antes de concluir o cadastro."
        resumoDados={resumoDados}
        aoEditar={() => setModalConfirmacaoAberta(false)}
        aoConfirmar={enviarCadastro}
      />
    </main>
  );
}

export default function CompletarCadastroPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-gray-500">Carregando cadastro...</p>}>
      <CompletarCadastroContent />
    </Suspense>
  );
}

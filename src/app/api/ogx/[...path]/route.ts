/**
 * @file route.ts
 * @description Proxy genérico para o Next.js App Router (`src/app/api/[...path]/route.ts`).
 * Repassa requisições e respostas em JSON diretamente para a API externa.
 */

// Importa as classes NextRequest (para manipular dados da requisição de entrada) 
// e NextResponse (para construir a resposta HTTP no servidor)
import { NextRequest, NextResponse } from "next/server";

// Importa a instância customizada do Axios para realizar as chamadas HTTP à API externa
import apiExterna from "@/service/api/apiExterna";

/**
 * Manipulador principal do Proxy HTTP.
 *
 * @param req - Objeto da requisição recebida (`NextRequest`).
 * @param context - Contexto contendo a Promise com os parâmetros dinâmicos de rota.
 */
async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  // 1. Resolve o parâmetro dinâmico da rota
  const { path } = await context.params;

  // 2. Validação básica de rota
  if (!path || path.length === 0) {
    return NextResponse.json(
      { message: "O parâmetro de rota é obrigatório" },
      { status: 400 }
    );
  }

  // 3. Monta o caminho relativo da API
  const url = path.join("/");

  // 4. Captura a query string
  const restQuery = Object.fromEntries(req.nextUrl.searchParams.entries());

  // 5. Captura o body para métodos com payload
  let body: unknown = undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    try {
      body = await req.json();
    } catch {
      body = undefined;
    }
  }

  // 6. Clona os headers da requisição original
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  try {
    // 7. Dispara a requisição para a API externa
    const response = await apiExterna({
      method: req.method,
      url: `/${url}`,
      data: body,
      headers: headers,
      params: restQuery,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    // 8. Trata exceções do proxy
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: "Erro no proxy" };

    return NextResponse.json(errorData, { status });
  }
}

// Exportação das rotas para todos os verbos HTTP
export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as DELETE,
  handleProxy as PATCH,
};
/**
 * @file route.ts
 * @description Proxy genérico otimizado para o Next.js App Router (`src/app/api/[...path]/route.ts`).
 */

import { NextRequest, NextResponse } from "next/server";
import apiExterna from "@/service/api/apiExterna";
import axios from "axios";

/**
 * Encaminha uma chamada `/api/<path>` ao backend configurado no servidor.
 * Preserva método, query string, corpo, status e payload de erro da origem.
 *
 * @param req Requisição recebida pelo App Router.
 * @param context Parâmetros dinâmicos da rota catch-all.
 * @returns Resposta HTTP que o navegador receberá.
 */
async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
): Promise<NextResponse> {
  // Remove o prefixo público `/api` e encaminha para a rota real do backend.
  const { path } = await context.params;

  if (!path || path.length === 0) {
    return NextResponse.json(
      { message: "O parâmetro de rota é obrigatório" },
      { status: 400 }
    );
  }

  const url = path.join("/");
  const restQuery = Object.fromEntries(req.nextUrl.searchParams.entries());

  // Tratamento seguro do body apenas se realmente houver payload
  let body: unknown = undefined;
  const method = req.method.toUpperCase();
  
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await req.json();
      } else {
        body = await req.text();
      }
    } catch {
      body = undefined;
    }
  }

  // Filtro rigoroso de headers para evitar travamentos de stream
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!["host", "x-forwarded-host", "connection", "content-length", "transfer-encoding"].includes(lowerKey)) {
      headers[key] = value;
    }
  });
  headers["X-Forwarded-Host"] = req.nextUrl.host;
  headers["Accept"] = "application/json";

  try {
    const response = await apiExterna({
      method: method,
      url: `/${url}`,
      data: body,
      headers: headers,
      params: restQuery,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { message: error.message };
      return NextResponse.json(errorData, { status });
    }

    return NextResponse.json(
      {
        message: "Erro interno no proxy",
        error: (error as { message?: string }).message,
      },
      { status: 500 }
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as DELETE,
  handleProxy as PATCH,
};

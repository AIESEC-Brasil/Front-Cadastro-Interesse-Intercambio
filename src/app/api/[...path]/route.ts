/**
 * @file route.ts
 * @description Proxy genérico otimizado para o Next.js App Router (`src/app/api/[...path]/route.ts`).
 */

import { NextRequest, NextResponse } from "next/server";
import apiExterna from "@/service/api/apiExterna";
import axios from "axios";

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
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
  let body: any = undefined;
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
    if (!["host", "connection", "content-length", "transfer-encoding"].includes(lowerKey)) {
      headers[key] = value;
    }
  });

  try {
    const response = await apiExterna({
      method: method,
      url: `/api/${url}`,
      data: body,
      headers: headers,
      params: restQuery,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { message: error.message };
      return NextResponse.json(errorData, { status });
    }

    return NextResponse.json(
      { message: "Erro interno no proxy", error: error.message },
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
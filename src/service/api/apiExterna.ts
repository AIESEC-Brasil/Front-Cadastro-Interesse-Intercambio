/**
 * @file apiExterna.ts
 * @description Instância do Axios para chamadas à API externa no Cloudflare Workers.
 */

import axios from "axios";

const apiExterna = axios.create({
  baseURL: process.env.EXTERNAL_API_URL || "http://localhost:5000",
  // Usa fetch, disponível no runtime Workers; agentes http/https do Node não
  // controlam as conexões de saída nesse ambiente.
  adapter: "fetch",
  timeout: 60000, // Timeout de segurança de 60 segundos
  headers: {
    "Content-Type": "application/json", //indica o formato esperado
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  },
});

export default apiExterna;

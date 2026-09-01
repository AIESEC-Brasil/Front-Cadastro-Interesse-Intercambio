/**
 * @file apiExterna.ts
 * @description Instância do Axios para a API externa com Keep-Alive ativado para reutilização de conexões.
 */

import axios from "axios";
import http from "http";
import https from "https";

// A API externa é acessada pelo servidor Next.js, não diretamente pelo browser.
// Os agentes fixam IPv4 e permitem reaproveitar conexões entre requisições.
const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

const apiExterna = axios.create({
  baseURL: process.env.EXTERNAL_API_URL || "http://localhost:5000",
  // Reutiliza conexões TCP abertas, eliminando o tempo de nova conexão
  httpAgent,
  httpsAgent,
  timeout: 60000, // Timeout de segurança de 60 segundos
  headers: {
    "Content-Type": "application/json", //indica o formato esperado
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  },
});

export default apiExterna;
/**
 * @file apiExterna.ts
 * @description Instância do Axios para a API externa com Keep-Alive ativado para reutilização de conexões.
 */

import axios from "axios";
import http from "http";
import https from "https";

const apiExterna = axios.create({
  baseURL: process.env.EXTERNAL_API_URL || "https://api.suaempresa.com",
  // Reutiliza conexões TCP abertas, eliminando o tempo de nova conexão
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  timeout: 10000, // Timeout de segurança de 10 segundos
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  },
});

export default apiExterna;
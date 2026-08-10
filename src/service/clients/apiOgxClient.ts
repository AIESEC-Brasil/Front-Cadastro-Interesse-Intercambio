/**
 * @file apiOgxClient.ts
 * @description Instância do Axios para consumo de chamadas no Front-end (React/Client Components).
 * Centraliza o prefixo `/api/ogx` para evitar repetição de código.
 */

// Importa a biblioteca Axios para criação de instâncias e execução de requisições HTTP
import axios from "axios";

/**
 * Instância do Axios para ser usada pelos componentes do React no Front-end.
 * Como o baseURL é "/api/ogx", todas as chamadas adicionarão esse prefixo automaticamente.
 */
const apiOgxClient = axios.create({
  baseURL: "/api/ogx",
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiOgxClient;
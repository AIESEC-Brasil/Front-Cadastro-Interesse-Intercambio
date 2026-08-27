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
  headers: {
    "Content-Type": "application/json"
  }
});

// O interceptor entrega somente o corpo da resposta aos hooks. Por isso os
// consumidores não recebem o objeto Axios completo por padrão.
apiOgxClient.interceptors.response.use(
  (response) => {
    // Aqui você pega o que vem da API e já "filtra" para retornar direto o .data
    // Se a sua API retorna { status: 200, data: [...] }, você pode retornar response.data
    return response.data; 
  },
  (error) => {
    // Tratamento de erro padrão do interceptor
    return Promise.reject(error);
  }
);

export default apiOgxClient;
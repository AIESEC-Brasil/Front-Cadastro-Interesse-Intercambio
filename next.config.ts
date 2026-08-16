/**
 * @file Arquivo de configuração do Next.js (next.config.ts).
 * @description Configura origens permitidas no ambiente de desenvolvimento (CORS/HMR),
 * cabeçalhos HTTP (CSP e CORS liberado globalmente),
 * e o proxy reverso nativo (rewrites) para chamadas de API externas.
 */

// Importação da tipagem oficial do Next.js para garantir intellisense e verificação estática no TypeScript
import type { NextConfig } from "next";

/**
 * Regra comum de Content-Security-Policy (CSP) para as rotas da AIESEC.
 * Permite que a página seja exibida em iframe na mesma origem ('self')
 * e em qualquer domínio ou subdomínio pertencente a aiesec.org.br.
 */
const AIESEC_FRAME_ANCESTORS =
  "frame-ancestors 'self' https://aiesec.org.br https://*.aiesec.org.br http://localhost:8000 https://amused-martin-sacred.ngrok-free.app/;";

const nextConfig: NextConfig = {
  /**
   * Origens permitidas no modo de desenvolvimento.
   * Evita avisos de 'Blocked cross-origin request' ao acessar o servidor dev
   * via WSL2, Docker ou IPs da rede local.
   */
  allowedDevOrigins: ["172.19.135.162", "localhost:3000","amused-martin-sacred.ngrok-free.app"],

  /**
   * Configura o proxy reverso nativo do Next.js.
   * Repassa automaticamente todas as chamadas feitas para /api/* no front-end
   * direto para a API externa configurada (ex: http://localhost:5000/api/*).
   */

  /**
   * Configura cabeçalhos de resposta HTTP personalizados por rota.
   * Libera CORS wildcard (*) para todas as rotas e define diretivas de CSP.
   */
  async headers() {
    return [
      // -------------------------------------------------------------------
      // 1. Liberação global de CORS (*) para TODAS as rotas
      // -------------------------------------------------------------------
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },

      // -------------------------------------------------------------------
      // 2. Rotas específicas liberadas para exibição nos domínios da AIESEC
      // -------------------------------------------------------------------
      {
        // Rota alvo: /voluntario-global
        source: "/voluntario-global",
        headers: [
          {
            key: "Content-Security-Policy",
            value: AIESEC_FRAME_ANCESTORS,
          },
        ],
      },
      {
        // Rota alvo: /talento-global
        source: "/talento-global",
        headers: [
          {
            key: "Content-Security-Policy",
            value: AIESEC_FRAME_ANCESTORS,
          },
        ],
      },
      {
        // Rota alvo: /professor-global
        source: "/professor-global",
        headers: [
          {
            key: "Content-Security-Policy",
            value: AIESEC_FRAME_ANCESTORS,
          },
        ],
      },

      // -------------------------------------------------------------------
      // 3. Regra de proteção geral: Bloqueia iframe em TODAS as outras rotas
      // -------------------------------------------------------------------
      {
        // Expressão regular que captura qualquer rota, EXCETO as 3 liberadas acima
        source: "/((?!voluntario-global|talento-global|professor-global).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // 'none' impede que qualquer site (inclusive o próprio) exiba estas rotas em iframe
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
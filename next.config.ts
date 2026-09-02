/**
 * @file Arquivo de configuração do Next.js (next.config.ts).
 * @description Configura origens permitidas no ambiente de desenvolvimento (CORS/HMR),
 * cabeçalhos HTTP (CSP, CORS e segurança global),
 * modo standalone para Docker, e o proxy reverso nativo (rewrites).
 */

import type { NextConfig } from "next";

/**
 * Regra comum de Content-Security-Policy (CSP) para as rotas da AIESEC.
 * Permite que a página seja exibida em iframe na mesma origem ('self')
 * e em qualquer domínio ou subdomínio pertencente a aiesec.org.br.
 */
const AIESEC_FRAME_ANCESTORS =
  "frame-ancestors 'self' https://aiesec.org.br https://*.aiesec.org.br http://localhost:8000 https://encapsula-frame.pages.dev;";

const nextConfig: NextConfig = {
  // Esta configuração é lida pelo servidor Next.js durante build e execução;
  // os componentes React não precisam conhecer regras de proxy ou headers.
  /**
   * Gera uma build otimizada e autocontida, essencial para otimizar 
   * o tamanho da imagem final em ambientes Docker.
   */
  output: "standalone",

  /**
   * Remove o cabeçalho X-Powered-By por segurança.
   */
  poweredByHeader: false,

  /**
   * Origens permitidas no modo de desenvolvimento.
   * Evita avisos de 'Blocked cross-origin request' ao acessar o servidor dev
   * via WSL2, Docker ou IPs da rede local.
   */
  allowedDevOrigins: ["172.19.135.162", "localhost:3000", "amused-martin-sacred.ngrok-free.app"],

  /**
   * Configuração de domínios permitidos para otimização de imagens externas.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.aiesec.org",
      },
    ],
  },

  /**
   * Configuração de proxy para evitar repetição de rotas que fazem a mesma coisa.
   * Redireciona internamente as URLs legadas/específicas para a pasta genérica (/programas-intercambio).
   */
  async rewrites() {
    return [
      {
        source: "/voluntario-global",
        destination: "/programas-intercambio",
      },
      {
        source: "/talento-global",
        destination: "/programas-intercambio",
      },
      {
        source: "/professor-global",
        destination: "/programas-intercambio",
      },
    ];
  },

  /**
   * Configura cabeçalhos de resposta HTTP personalizados por rota.
   * Libera CORS wildcard (*), adiciona headers de segurança OWASP e define diretivas de CSP.
   */
  async headers() {
    return [
      // -------------------------------------------------------------------
      // 1. Liberação global de CORS e Headers de Segurança para TODAS as rotas
      // -------------------------------------------------------------------
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS,QUERY",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
          // Boas práticas de segurança recomendadas pelo OWASP
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },

      // -------------------------------------------------------------------
      // 2. Liberação de Iframe (CSP) unificada para as 4 rotas da AIESEC
      // -------------------------------------------------------------------
      {
        source: "/(voluntario-global|talento-global|professor-global|programas-intercambio | urlbuilder)",
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
        source: "/((?!voluntario-global|talento-global|professor-global|programas-intercambio | urlbuilder).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
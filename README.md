# Frontend

Aplicação web para cadastro e qualificação de pessoas interessadas nos programas de intercâmbio da AIESEC Brasil. O frontend apresenta os formulários e encaminha as chamadas à API pelo servidor Next.js.

## Visão geral

O projeto usa Next.js App Router. As páginas e componentes ficam em `src/app/` e `src/components/`; hooks concentram o estado e as validações dos formulários, e os clientes HTTP ficam em `src/service/`.

## Tecnologias

- Next.js 16 e React 19
- TypeScript
- Axios
- Tailwind CSS
- OpenNext e Wrangler para o runtime Cloudflare Workers

## Funcionalidades

- Formulário de pré-cadastro B2C.
- Fluxo para completar e qualificar cadastro.
- Formulário de atração e geração de links para programas de intercâmbio.
- Importação de cadastros por planilha XLSX.
- Campos e opções preenchidos com metadados retornados pela API.

## Estrutura do projeto

```text
.
├── src/
│   ├── app/                 # páginas, layouts e proxy /api/[...path]
│   ├── components/          # formulários, campos e elementos de interface
│   ├── hook/                # estado, envio e validação dos formulários
│   ├── helpers/             # formatação e dicionários
│   ├── service/             # clientes HTTP do navegador e do servidor
│   ├── types/               # tipos compartilhados
│   └── utils/               # utilitários de validação
├── public/                  # arquivos estáticos
├── .github/workflows/       # deploy para Cloudflare Workers
├── Dockerfile               # imagem para teste local
├── package.json
└── README.md
```

## Requisitos

- Node.js e npm nas versões definidas no workflow de deploy.
- Acesso à API Flask para carregar metadados e enviar cadastros.

## Instalação e execução local

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Configuração do ambiente

Defina `EXTERNAL_API_URL` no ambiente do processo Next.js com a URL base da API Flask. A rota `src/app/api/[...path]/route.ts` usa essa variável no servidor para encaminhar as requisições recebidas em `/api/<rota>`; portanto, o navegador não acessa diretamente a URL do backend.

`NEXT_PUBLIC_URL_DIRECIONADA` é usada pelo gerador de links e não configura o destino da API. Para a imagem Docker local, essa variável é recebida como argumento de build. Não coloque credenciais nos valores `NEXT_PUBLIC_*`, pois eles podem ser incorporados ao bundle do navegador.

## Scripts disponíveis

```bash
npm run dev                 # servidor Next.js para desenvolvimento
npm run lint                # análise estática com ESLint
npm run build               # build padrão do Next.js
npm run build:cloudflare    # build OpenNext para Cloudflare Workers
npm run preview             # executa a build no runtime local de Workers
npm run deploy              # compila e publica o Worker
```

## API

Os formulários consultam endpoints de metadados e enviam operações de cadastro pela API Flask. O contrato dos endpoints, os formatos de resposta e a configuração do serviço estão documentados no [README do backend](../backend/README.md). O portal OpenAPI da API é servido em `/api/docs` quando habilitado e autorizado.

## Deploy

O workflow `.github/workflows/deploy.yaml` deste diretório prepara a aplicação com OpenNext e publica um Cloudflare Worker. Ele requer `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `EXTERNAL_API_URL` como secrets, além de `NEXT_PUBLIC_URL_DIRECIONADA` para os links gerados. O Dockerfile serve para o ambiente local de teste; não define o runtime de produção.

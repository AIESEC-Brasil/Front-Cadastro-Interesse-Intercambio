import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Metadados da ferramenta que monta links de campanha. */
export const metadata: Metadata = {
  title: "Gerador de URLs de campanha",
  description:
    "Gere URLs com parâmetros UTM para acompanhar campanhas de cadastro da AIESEC no Brasil.",
};

/** Usa a estrutura visual global na rota de geração de URLs. */
export default function UrlBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

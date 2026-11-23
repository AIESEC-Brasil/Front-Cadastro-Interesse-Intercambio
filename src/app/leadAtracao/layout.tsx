import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Metadados da página de atração e pré-cadastro B2C. */
export const metadata: Metadata = {
  title: "Cadastro de interesse",
  description:
    "Cadastre seu interesse nas oportunidades de intercâmbio da AIESEC no Brasil.",
};

/** Mantém o layout da rota de atração sem adicionar contêiner visual. */
export default function LeadAtracaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

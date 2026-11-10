import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cadastro de interesse",
  description:
    "Cadastre seu interesse nas oportunidades de intercâmbio da AIESEC no Brasil.",
};

export default function LeadAtracaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

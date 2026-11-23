import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Metadados das páginas de pré-cadastro e qualificação. */
export const metadata: Metadata = {
  title: "Programas de intercâmbio",
  description:
    "Inscreva-se em um programa de intercâmbio da AIESEC no Brasil e viva uma experiência internacional.",
};

/** Repassa o conteúdo da rota para o layout global da aplicação. */
export default function ProgramasIntercambioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

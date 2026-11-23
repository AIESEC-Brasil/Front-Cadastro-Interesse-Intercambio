import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Metadados da etapa de conclusão de um pré-cadastro B2C. */
export const metadata: Metadata = {
  title: "Complete seu cadastro",
  description:
    "Finalize seu cadastro para participar de um programa de intercâmbio da AIESEC no Brasil.",
  icons:{
    icon:"/Favicon.ico"
  }, 
};

/** Repassa a página de conclusão para o layout global da aplicação. */
export default function CompletarCadastroLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

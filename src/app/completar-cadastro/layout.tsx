import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Complete seu cadastro",
  description:
    "Finalize seu cadastro para participar de um programa de intercâmbio da AIESEC no Brasil.",
  icons:{
    icon:"/Favicon.ico"
  }, 
};

export default function CompletarCadastroLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

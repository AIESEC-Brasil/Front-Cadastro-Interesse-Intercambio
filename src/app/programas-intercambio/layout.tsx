import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Programas de intercâmbio",
  description:
    "Inscreva-se em um programa de intercâmbio da AIESEC no Brasil e viva uma experiência internacional.",
};

export default function ProgramasIntercambioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gerador de URLs de campanha",
  description:
    "Gere URLs com parâmetros UTM para acompanhar campanhas de cadastro da AIESEC no Brasil.",
};

export default function UrlBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Cadastro de Interesse | AIESEC no Brasil",
    template: "%s | AIESEC no Brasil",
  },
  description:
    "Conheça oportunidades de intercâmbio e cadastre seu interesse nos programas da AIESEC no Brasil.",
};

/** Envolve cada página com a estrutura HTML comum da aplicação. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

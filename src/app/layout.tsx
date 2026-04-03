import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "L&PMakeUp | Maquiagem Profissional a partir de R$ 6,99",
    template: "%s | L&PMakeUp",
  },
  description:
    "Loja online de maquiagem com preços imbatíveis. Cílios postiços, delineadores, gloss, paletas e mais — tudo por R$ 7,99. Acima de 4 itens: R$ 6,99 cada. Entrega via WhatsApp.",
  keywords: [
    "maquiagem barata",
    "loja maquiagem online",
    "cílios postiços",
    "delineador",
    "gloss labial",
    "paleta maquiagem",
    "maquiagem profissional",
    "makeup",
    "L&PMakeUp",
  ],
  openGraph: {
    title: "L&PMakeUp | Maquiagem Profissional a partir de R$ 6,99",
    description:
      "Os melhores produtos de maquiagem por preços incríveis. Todos os itens por R$ 7,99 — acima de 4 itens, R$ 6,99 cada!",
    type: "website",
    locale: "pt_BR",
    siteName: "L&PMakeUp",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

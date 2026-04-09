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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br",
  ),
  title: {
    default: "L&PMakeUp | Maquiagem Profissional a partir de R$ 6,99",
    template: "%s | L&PMakeUp",
  },
  description:
    "Loja online de maquiagem com preços imbatíveis. Cílios postiços, delineadores, gloss, paletas e mais — tudo por R$ 7,99. Acima de 4 itens: R$ 6,99 cada. Entrega para todo o Brasil.",
  keywords: [
    "maquiagem barata",
    "loja maquiagem online",
    "cílios postiços",
    "delineador",
    "gloss labial",
    "paleta maquiagem",
    "maquiagem profissional",
    "makeup",
    "comprar maquiagem",
    "maquiagem atacado",
    "L&PMakeUp",
  ],
  openGraph: {
    title: "L&PMakeUp | Maquiagem Profissional a partir de R$ 6,99",
    description:
      "Os melhores produtos de maquiagem por preços incríveis. Todos os itens por R$ 7,99 — acima de 4 itens, R$ 6,99 cada!",
    type: "website",
    locale: "pt_BR",
    siteName: "L&PMakeUp",
    url: "/",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "L&PMakeUp — Maquiagem Profissional a partir de R$ 6,99",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "L&PMakeUp | Maquiagem Profissional a partir de R$ 6,99",
    description:
      "Os melhores produtos de maquiagem por preços incríveis. Todos os itens por R$ 7,99 — acima de 4 itens, R$ 6,99 cada!",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: { "pt-BR": "/" },
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

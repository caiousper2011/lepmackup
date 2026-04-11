import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br",
  ),
  title: {
    // CTR-first: palavra-chave principal antes da marca
    default: "Maquiagem Profissional Barata a partir de R$ 6,99 | L&PMakeUp",
    template: "%s | L&PMakeUp",
  },
  description:
    "Loja online de maquiagem profissional com preços imbatíveis. Cílios postiços, delineadores, gloss labial, paletas e mais — todos por R$ 7,99. Compre 4+ itens e pague R$ 6,99 cada. Frete para todo o Brasil via Mercado Pago.",
  applicationName: "L&PMakeUp",
  category: "shopping",
  keywords: [
    "maquiagem barata",
    "loja maquiagem online",
    "cílios postiços baratos",
    "delineador preto",
    "gloss labial",
    "paleta maquiagem",
    "maquiagem profissional",
    "comprar maquiagem",
    "maquiagem atacado",
    "maquiagem por 6,99",
    "maquiagem São Paulo",
    "L&PMakeUp",
  ],
  authors: [{ name: "L&PMakeUp" }],
  creator: "L&PMakeUp",
  publisher: "L&PMakeUp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Maquiagem Profissional Barata a partir de R$ 6,99 | L&PMakeUp",
    description:
      "Cílios, delineadores, gloss e paletas por R$ 7,99. Leve 4+ e pague R$ 6,99 cada! Marcas Vivai, Ruby Rose, Maxlove, Bellafeme, Dapop, Fenzza.",
    type: "website",
    locale: "pt_BR",
    siteName: "L&PMakeUp",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maquiagem Profissional Barata a partir de R$ 6,99 | L&PMakeUp",
    description:
      "Cílios, delineadores, gloss e paletas por R$ 7,99. Leve 4+ e pague R$ 6,99 cada!",
    creator: "@lpmakeup",
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
  verification: {
    // Preencher quando houver Google Search Console
    // google: "xxxxxx",
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

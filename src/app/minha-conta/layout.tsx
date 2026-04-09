import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Conta",
  description:
    "Gerencie sua conta na L&PMakeUp. Veja seus pedidos, endereços e programa de indicações.",
  robots: { index: false, follow: false },
};

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

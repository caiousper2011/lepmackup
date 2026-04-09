import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finalizar Compra",
  description:
    "Finalize sua compra na L&PMakeUp. Pagamento seguro via Mercado Pago com Pix, cartão e boleto. Entrega para todo o Brasil.",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

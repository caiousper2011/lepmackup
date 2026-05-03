import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="bg-blush-50 border-t border-rose-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
              <div className="lp-brand-mark relative w-12 h-12 ring-2 ring-rose-200/60 group-hover:ring-rose-300/80 transition-all duration-300">
                <Image
                  src="/brand/logo-lp-circle.png"
                  alt="L&PMakeUp"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="lp-brand-wordmark text-[22px]">L&PMakeUp</span>
                <span className="lp-brand-tagline">Beauty Store</span>
              </div>
            </Link>
            <p className="text-[13px] text-gray-600 leading-relaxed max-w-sm">
              Maquiagem profissional a preço que cabe no bolso. Loja online +
              física em Vila Aricanduva, SP. Atendendo Brasil inteiro com
              carinho. 💕
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="lp-badge-verified">✓ Verificada</span>
              <span className="lp-badge-gold">🎁 Leve 4+ R$ 6,99</span>
            </div>
          </div>

          {/* Loja — Categorias */}
          <div>
            <h5 className="font-bold font-(family-name:--font-heading) text-[15px] text-gray-900 mb-3.5">
              Loja
            </h5>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                  >
                    {c.dbName}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#produtos"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="/#produtos"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Mais vendidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h5 className="font-bold font-(family-name:--font-heading) text-[15px] text-gray-900 mb-3.5">
              Ajuda
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#produtos"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Como comprar
                </Link>
              </li>
              <li>
                <Link
                  href="/#produtos"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Frete &amp; prazos
                </Link>
              </li>
              <li>
                <Link
                  href="/minha-conta/pedidos"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Meus pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/minha-conta"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Minha conta
                </Link>
              </li>
            </ul>
          </div>

          {/* L&P */}
          <div>
            <h5 className="font-bold font-(family-name:--font-heading) text-[15px] text-gray-900 mb-3.5">
              L&amp;P
            </h5>
            <ul className="space-y-2">
              <li className="text-[13px] text-gray-600">Vila Aricanduva, SP</li>
              <li>
                <a
                  href="https://shopee.com.br/leticia.guardian?entryPoint=ShopByPDP&tab=product"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Shopee
                </a>
              </li>
              <li className="text-[13px] text-gray-600">
                Pagamento via Mercado Pago
              </li>
              <li className="text-[13px] text-gray-600">
                PIX · Cartão · Boleto
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-rose-100 pt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} L&amp;PMakeUp · Leticia e Patricia ·
            Vila Aricanduva, São Paulo — SP · Maquiagem profissional a partir de
            R$ 6,99 · Mercado Pago SSL.
          </p>
        </div>
      </div>
    </footer>
  );
}

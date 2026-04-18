import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-blush-50 to-blush-100 border-t border-rose-100/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-berry flex items-center justify-center shadow-md shadow-berry-600/20">
                <span className="text-white font-bold text-sm">L&P</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent font-[family-name:var(--font-heading)]">
                L&PMakeUp
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Loja online de maquiagem profissional com produtos a partir de R$
              6,99. Cílios, delineadores, gloss e paletas. Entrega para todo o
              Brasil.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Vila Aricanduva, São Paulo — SP
            </p>
          </div>

          {/* Categorias — links reais para SEO */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Categorias
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    className="text-sm text-gray-600 hover:text-berry-600 transition-colors"
                  >
                    {c.dbName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Navegação
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/#produtos"
                  className="text-sm text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Todos os produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/#promo"
                  className="text-sm text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Promoções
                </Link>
              </li>
              <li>
                <Link
                  href="/minha-conta"
                  className="text-sm text-gray-600 hover:text-berry-600 transition-colors"
                >
                  Minha Conta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Atendimento
            </h3>
            <p className="text-xs text-gray-500">
              Pagamento seguro via Mercado Pago: PIX, cartão e boleto.
            </p>
          </div>
        </div>

        <div className="border-t border-rose-100/60 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} L&PMakeUp — Maquiagem profissional a
            partir de R$ 6,99. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

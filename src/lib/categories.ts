/**
 * Mapeamento canônico entre nome da categoria (no banco)
 * e slug SEO-friendly usado nas URLs /categoria/[slug].
 *
 * Estratégia SEO: cada categoria tem URL própria, indexável,
 * com title/description otimizados para palavras-chave de cauda longa.
 */

export interface CategoryMeta {
  /** Slug usado na URL (kebab-case, sem acento) */
  slug: string;
  /** Nome canônico no banco (com acento, igual ao Product.category) */
  dbName: string;
  /** Título H1 otimizado */
  h1: string;
  /** Title da página (≤ 60 chars idealmente) */
  title: string;
  /** Meta description otimizada (≤ 160 chars) */
  description: string;
  /** Palavras-chave principais para o head e schema */
  keywords: string[];
  /** Texto longo para SEO/GEO (200–400 palavras) */
  intro: string;
  /** Perguntas frequentes específicas da categoria (FAQPage schema + visível) */
  faqs: { q: string; a: string }[];
  /** Emoji para UI */
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "olhos",
    dbName: "Olhos",
    emoji: "👁️",
    h1: "Maquiagem para Olhos a partir de R$ 6,99",
    title: "Maquiagem para Olhos Barata | Cílios, Delineador e Máscara R$ 7,99",
    description:
      "Cílios postiços, delineadores, máscaras de cílios e mais para um olhar marcante. Todos os produtos por R$ 7,99 — leve 4+ e pague R$ 6,99 cada. Frete para todo o Brasil.",
    keywords: [
      "maquiagem para olhos",
      "cílios postiços baratos",
      "delineador preto",
      "máscara de cílios",
      "comprar cílios postiços",
      "delineador líquido barato",
      "make olhos profissional",
    ],
    intro:
      "Encontre maquiagem para olhos com qualidade profissional e preço acessível. Nossa seleção inclui cílios postiços com efeito 5D, delineadores ultra black de longa duração, máscaras de cílios alongadoras com biotina e vitamina E, além de colas profissionais à prova d'água. Todos os itens por R$ 7,99 — comprando 4 ou mais, o preço cai para R$ 6,99 por unidade. Ideal para maquiagem do dia a dia, eventos e até para revenda.",
    faqs: [
      {
        q: "Quais marcas de maquiagem para olhos a L&PMakeUp vende?",
        a: "Trabalhamos com marcas como Vivai, Maxlove, Aurora e Lua&Neve, oferecendo cílios postiços, delineadores e máscaras de cílios profissionais por R$ 7,99.",
      },
      {
        q: "Os cílios postiços são reutilizáveis?",
        a: "Sim. Os Cílios Postiços Aurora 5D são reutilizáveis com cuidado adequado: remova com cuidado, limpe a faixa e guarde na embalagem original.",
      },
      {
        q: "O delineador Vivai Ultra Black é à prova d'água?",
        a: "O Delineador Vivai Ultra Black tem secagem rápida, ultra fixação e não borra durante o dia, mesmo em peles oleosas.",
      },
    ],
  },
  {
    slug: "labios",
    dbName: "Lábios",
    emoji: "💋",
    h1: "Gloss e Maquiagem para Lábios a partir de R$ 6,99",
    title: "Gloss Labial Barato | Lip Oil e Gloss Mágico R$ 7,99 — L&PMakeUp",
    description:
      "Gloss labial, lip oil hidratante, gloss mágico e batons por apenas R$ 7,99. Compre 4+ e pague R$ 6,99 cada. Marcas Vivai, Bellafeme, Mahav. Entrega para todo Brasil.",
    keywords: [
      "gloss labial barato",
      "lip oil",
      "gloss mágico",
      "batom barato",
      "gloss vivai",
      "lip oil mahav",
      "comprar gloss",
    ],
    intro:
      "Lábios sempre hidratados, brilhantes e com cor. Nossa linha de maquiagem para lábios reúne lip oil com aromas de cereja e morango, gloss mágico que muda de cor ao contato com os lábios, lip gloss com brilho intenso e embalagens divertidas. Tudo por R$ 7,99 — leve 4+ e pague R$ 6,99 cada. Produtos de marcas como Vivai, Bellafeme e Mahav, ideais para uso diário, eventos e revenda.",
    faqs: [
      {
        q: "O Gloss Mágico Bellafeme realmente muda de cor?",
        a: "Sim. O Gloss Mágico Bellafeme tem fórmula que reage ao pH dos lábios, revelando um tom rosa único com partículas douradas para brilho sofisticado.",
      },
      {
        q: "O Lip Oil Mahav hidrata os lábios?",
        a: "Sim. O Lip Oil Mahav Cereja e Morango oferece hidratação profunda com brilho natural, textura leve e não pegajosa, ideal para uso diário.",
      },
      {
        q: "Vocês têm batom líquido?",
        a: "Atualmente trabalhamos com gloss labial, lip oil e gloss mágico — todos a partir de R$ 6,99 quando você compra 4 ou mais itens. Acompanhe nosso catálogo para novidades.",
      },
    ],
  },
  {
    slug: "rosto",
    dbName: "Rosto",
    emoji: "✨",
    h1: "Maquiagem para Rosto a partir de R$ 6,99",
    title: "Maquiagem Rosto Barata | Pó Banana e Paleta Dapop R$ 7,99",
    description:
      "Pó banana, paleta de contorno, blush e iluminador por R$ 7,99. Marcas Fenzza e Dapop. Compre 4+ itens e pague R$ 6,99 cada. Entrega rápida para todo o Brasil.",
    keywords: [
      "maquiagem rosto",
      "pó banana fenzza",
      "paleta contorno",
      "blush iluminador",
      "paleta dapop",
      "pó facial",
      "make rosto profissional",
    ],
    intro:
      "Construa uma base impecável com nossa linha de maquiagem para rosto. Trabalhamos com pó banana translúcido para acabamento matte, paletas multifuncionais com contorno, blush e iluminador, e produtos de marcas como Fenzza e Dapop. Fórmulas veganas e não comedogênicas. Todos por R$ 7,99 — leve 4+ e pague R$ 6,99 por item.",
    faqs: [
      {
        q: "O Pó Banana Fenzza altera o tom da pele?",
        a: "Não. O Pó Banana Fenzza tem fórmula translúcida que sela a base e o corretivo sem alterar o tom da pele, controlando a oleosidade ao longo do dia.",
      },
      {
        q: "A Paleta Dapop é vegana?",
        a: "Sim. A Paleta Multifuncional Dapop Retrô Mix é vegana, não comedogênica, com tons de contorno, blush e iluminador de textura aveludada.",
      },
      {
        q: "Quanto pó banana vem na embalagem?",
        a: "O Pó Banana Fenzza contém 15g de produto, suficiente para várias semanas de uso diário.",
      },
    ],
  },
  {
    slug: "sobrancelhas",
    dbName: "Sobrancelhas",
    emoji: "✏️",
    h1: "Paletas e Maquiagem para Sobrancelhas a partir de R$ 6,99",
    title: "Paleta Sobrancelha Ruby Rose Barata R$ 7,99 — L&PMakeUp",
    description:
      "Paletas para sobrancelha Ruby Rose com tons versáteis. Defina e corrija falhas com acabamento profissional. R$ 7,99 — 4+ itens por R$ 6,99. Frete para todo o Brasil.",
    keywords: [
      "paleta sobrancelha",
      "ruby rose sobrancelha",
      "sombra sobrancelha",
      "definir sobrancelha",
      "maquiagem sobrancelha barata",
    ],
    intro:
      "Sobrancelhas bem desenhadas mudam todo o rosto. Nossa Paleta para Sobrancelha Ruby Rose oferece tons versáteis (02, 03, 04 e 05) para preencher falhas, definir e dar acabamento profissional — para qualquer tom de pele e cabelo. Apenas R$ 7,99 por unidade, ou R$ 6,99 quando você leva 4+.",
    faqs: [
      {
        q: "A Paleta Ruby Rose serve para qualquer cor de cabelo?",
        a: "Sim. A Paleta para Sobrancelha Ruby Rose tem tons versáteis (02, 03, 04 e 05) que se adaptam a diversos tons de pele e cabelo, do loiro ao castanho escuro.",
      },
      {
        q: "Posso usar a paleta de sobrancelha como sombra?",
        a: "Sim. Os tons da paleta podem ser usados como sombra esfumada para um look natural, especialmente em maquiagens neutras.",
      },
    ],
  },
  {
    slug: "acessorios",
    dbName: "Acessórios",
    emoji: "🧽",
    h1: "Acessórios de Maquiagem a partir de R$ 6,99",
    title: "Esponja de Maquiagem Barata R$ 7,99 — Acessórios L&PMakeUp",
    description:
      "Esponjas de maquiagem 2 em 1, pincéis e acessórios essenciais por R$ 7,99. Compre 4+ itens e pague R$ 6,99 cada. Acabamento profissional. Entrega para todo o Brasil.",
    keywords: [
      "esponja maquiagem",
      "esponja gota",
      "pincel maquiagem",
      "acessório make",
      "esponja chanfrada",
    ],
    intro:
      "Os acessórios certos fazem toda a diferença na hora da maquiagem. Nossas esponjas 2 em 1 com formato de gota e base chanfrada permitem espalhar base, corretivo e pó com precisão e uniformidade. Todos por R$ 7,99 — 4+ itens por R$ 6,99 cada.",
    faqs: [
      {
        q: "Posso escolher a cor da esponja?",
        a: "As Esponjas de Maquiagem 2 em 1 são enviadas em cores variadas conforme disponibilidade do estoque.",
      },
      {
        q: "A esponja serve para base líquida e em pó?",
        a: "Sim. A esponja 2 em 1 é ideal para base líquida, corretivo e pó, com a ponta de gota para detalhes e a base chanfrada para áreas amplas.",
      },
    ],
  },
];

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
const CATEGORY_BY_DB_NAME = new Map(CATEGORIES.map((c) => [c.dbName, c]));

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

export function getCategoryByDbName(dbName: string): CategoryMeta | undefined {
  return CATEGORY_BY_DB_NAME.get(dbName);
}

export function categorySlugFromDbName(dbName: string): string {
  return CATEGORY_BY_DB_NAME.get(dbName)?.slug ?? slugifyFallback(dbName);
}

function slugifyFallback(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

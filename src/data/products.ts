export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  brand: string;
  category: string;
  description: string;
  details: string[];
  originalPrice: number;
  promoPrice: number;
  bulkPrice: number;
  stockQuantity?: number;
  shippingWeightGrams?: number;
  images: string[];
  imageExtension: string;
  tags: string[];
}

export const PROMO_PRICE = 7.99;
export const BULK_PRICE = 6.99;
export const BULK_THRESHOLD = 4;

export const products: Product[] = [
  {
    id: "cilios-posticos-aurora-5d",
    slug: "cilios-posticos-aurora-5d",
    name: "Cílios Postiços Aurora 5D-01",
    shortName: "Cílios Aurora 5D",
    brand: "Aurora",
    category: "Olhos",
    description:
      "Os Cílios Postiços Aurora 5D-01 são ideais para quem deseja realçar o olhar com volume e definição na medida certa. Com efeito 5D, proporcionam cílios mais cheios e alongados, valorizando os olhos sem perder a naturalidade.",
    details: [
      "Efeito 5D para volume e definição",
      "Leves e confortáveis",
      "Fácil aplicação",
      "Reutilizáveis com cuidado adequado",
      "Ideais para uso diário ou ocasiões especiais",
      "Acabamento sofisticado e profissional",
    ],
    originalPrice: 18.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/cilios-posticos-aurora-5d/1.jpeg",
      "/products/cilios-posticos-aurora-5d/2.jpeg",
      "/products/cilios-posticos-aurora-5d/3.jpeg",
      "/products/cilios-posticos-aurora-5d/4.jpeg",
      "/products/cilios-posticos-aurora-5d/5.jpeg",
    ],
    imageExtension: "jpeg",
    tags: ["cílios", "olhos", "5D", "volume", "postiços"],
  },
  {
    id: "cola-cilios-lua-neve",
    slug: "cola-cilios-lua-neve",
    name: "Cola Branca para Cílios Postiços Lua&Neve",
    shortName: "Cola Cílios Lua&Neve",
    brand: "Lua&Neve",
    category: "Olhos",
    description:
      "A Cola para Cílios Postiços Lua&Neve garante fixação segura e duradoura. Com fórmula profissional branca que seca transparente, oferece super fixação à prova d'água, mantendo os cílios firmes o dia todo.",
    details: [
      "Fórmula profissional branca",
      "Seca transparente",
      "Super fixação à prova d'água",
      "Longa duração",
      "Fácil aplicação",
      "Acabamento resistente e profissional",
    ],
    originalPrice: 14.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/cola-cilios-lua-neve/1.jpeg",
      "/products/cola-cilios-lua-neve/2.jpeg",
      "/products/cola-cilios-lua-neve/3.jpeg",
    ],
    imageExtension: "jpeg",
    tags: ["cola", "cílios", "fixação", "à prova d'água"],
  },
  {
    id: "delineador-vivai-ultra-black",
    slug: "delineador-vivai-ultra-black",
    name: "Delineador Vivai Ultra Black",
    shortName: "Delineador Ultra Black",
    brand: "Vivai",
    category: "Olhos",
    description:
      "O Delineador Vivai Ultra Black é ideal para quem busca um traço intenso, definido e de longa duração. Secagem rápida e ultra fixação, garantindo um delineado preciso e resistente ao longo do dia, sem borrar.",
    details: [
      "Pigmentação ultra black intensa",
      "Secagem rápida",
      "Ultra fixação e longa duração",
      "Não borra",
      "Traços finos ou ousados",
      "Acabamento marcante e profissional",
    ],
    originalPrice: 16.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/delineador-vivai-ultra-black/1.jpeg",
      "/products/delineador-vivai-ultra-black/2.jpeg",
      "/products/delineador-vivai-ultra-black/3.jpeg",
      "/products/delineador-vivai-ultra-black/4.jpeg",
      "/products/delineador-vivai-ultra-black/5.jpeg",
      "/products/delineador-vivai-ultra-black/6.jpeg",
    ],
    imageExtension: "jpeg",
    tags: ["delineador", "olhos", "ultra black", "longa duração"],
  },
  {
    id: "esponja-maquiagem-gota",
    slug: "esponja-maquiagem-gota",
    name: "Esponja de Maquiagem 2 em 1 Chanfrada em Formato de Gota",
    shortName: "Esponja Gota 2 em 1",
    brand: "Genérica",
    category: "Acessórios",
    description:
      "A Esponja de Maquiagem 2 em 1 é ideal para uma make rápida, bonita e com acabamento impecável. A ponta em gota alcança detalhes com precisão, enquanto a base chanfrada espalha base, corretivo ou pó de forma uniforme. Cores variadas enviadas conforme disponibilidade.",
    details: [
      "Formato 2 em 1: gota + chanfrada",
      "Ponta para detalhes e precisão",
      "Base para aplicação uniforme",
      "Toque macio",
      "Ideal para base, corretivo e pó",
      "Cores variadas conforme estoque",
    ],
    originalPrice: 12.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: ["/products/esponja-maquiagem-gota/1.png"],
    imageExtension: "png",
    tags: ["esponja", "acessório", "gota", "base", "corretivo"],
  },
  {
    id: "gloss-magico-bellafeme",
    slug: "gloss-magico-bellafeme",
    name: "Gloss Mágico Labial Bellafeme",
    shortName: "Gloss Mágico Bellafeme",
    brand: "Bellafeme",
    category: "Lábios",
    description:
      "O Gloss Mágico Labial Bellafeme é ideal para lábios hidratados, brilhantes e com um toque especial de cor. Sua fórmula muda de cor ao contato com os lábios, revelando um tom rosa único com partículas douradas para brilho sofisticado.",
    details: [
      "Muda de cor ao contato com os lábios",
      "Partículas douradas para brilho delicado",
      "Longa duração",
      "Textura confortável",
      "Hidratação labial",
      "Acabamento luminoso e encantador",
    ],
    originalPrice: 19.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/gloss-magico-bellafeme/1.jpeg",
      "/products/gloss-magico-bellafeme/2.jpeg",
      "/products/gloss-magico-bellafeme/3.jpeg",
      "/products/gloss-magico-bellafeme/4.jpeg",
      "/products/gloss-magico-bellafeme/5.jpeg",
      "/products/gloss-magico-bellafeme/6.jpeg",
    ],
    imageExtension: "jpeg",
    tags: ["gloss", "labial", "mágico", "brilho", "hidratante"],
  },
  {
    id: "lip-gloss-vivai-cute-gloss",
    slug: "lip-gloss-vivai-cute-gloss",
    name: "Lip Gloss Vivai Cute Gloss – Brilho Divertido com Personagens",
    shortName: "Lip Gloss Vivai Cute Gloss",
    brand: "Vivai",
    category: "Lábios",
    description:
      "O Lip Gloss Vivai Cute Gloss proporciona brilho intenso e lábios hidratados com um toque leve e confortável. Com embalagens divertidas de coruja, unicórnio, dinossauro, ursinho, gatinho e cavalo-marinho, é perfeito para quem ama unir beleza e estilo no dia a dia.",
    details: [
      "Brilho intenso com acabamento luminoso",
      "Hidratação labial para uso diário",
      "Textura leve e confortável",
      "Não deixa sensação pesada nos lábios",
      "Embalagens com personagens divertidos",
      "Ideal para quem busca beleza com estilo",
    ],
    originalPrice: 17.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: ["/products/lip-gloss-vivai-cute-gloss/1.png"],
    imageExtension: "png",
    tags: ["lip gloss", "vivai", "lábios", "brilho", "hidratante"],
  },
  {
    id: "lip-oil-mahav-cereja-morango",
    slug: "lip-oil-mahav-cereja-morango",
    name: "Lip Oil Mahav Cereja e Morango – Hidratação com Brilho Natural",
    shortName: "Lip Oil Mahav Cereja e Morango",
    brand: "Mahav",
    category: "Lábios",
    description:
      "O Lip Oil Mahav hidrata profundamente os lábios, deixando-os macios e com brilho natural. Possui textura leve, não pegajosa e deliciosos aromas de cereja e morango, ideal para uso diário com conforto e cuidado.",
    details: [
      "Hidratação profunda dos lábios",
      "Brilho natural para acabamento saudável",
      "Textura leve e não pegajosa",
      "Aromas deliciosos de cereja e morango",
      "Confortável para uso diário",
      "Ajuda a manter os lábios macios",
    ],
    originalPrice: 18.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/lip-oil-mahav-cereja-morango/1.jpeg",
      "/products/lip-oil-mahav-cereja-morango/2.jpeg",
    ],
    imageExtension: "jpeg",
    tags: ["lip oil", "mahav", "lábios", "cereja", "morango", "hidratação"],
  },
  {
    id: "mascara-cilios-maxlove",
    slug: "mascara-cilios-maxlove",
    name: "Máscara de Cílios Maxlove Mega Alongamento e Volume com Biotina e Vitamina E",
    shortName: "Máscara Maxlove Biotina",
    brand: "Maxlove",
    category: "Olhos",
    description:
      "A Máscara de Cílios Maxlove oferece mega alongamento e volume, com fórmula enriquecida com biotina, vitamina E e extratos de aloe vera, algodão, camomila e coco. Fortalece e auxilia no crescimento dos cílios.",
    details: [
      "Mega alongamento e volume",
      "Enriquecida com biotina e vitamina E",
      "Extratos de aloe vera, algodão, camomila e coco",
      "Fortalece os cílios",
      "Auxilia no crescimento",
      "Acabamento profissional",
    ],
    originalPrice: 24.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/mascara-cilios-maxlove/1.png",
      "/products/mascara-cilios-maxlove/2.png",
      "/products/mascara-cilios-maxlove/3.png",
      "/products/mascara-cilios-maxlove/4.png",
      "/products/mascara-cilios-maxlove/5.png",
      "/products/mascara-cilios-maxlove/6.png",
    ],
    imageExtension: "png",
    tags: [
      "máscara",
      "cílios",
      "biotina",
      "vitamina E",
      "volume",
      "alongamento",
    ],
  },
  {
    id: "paleta-multifuncional",
    slug: "paleta-multifuncional",
    name: "Paleta Multifuncional Dapop Retrô Mix",
    shortName: "Paleta Retrô Mix",
    brand: "Dapop",
    category: "Rosto",
    description:
      "A Paleta Multifuncional Dapop Retrô Mix oferece praticidade e versatilidade em uma única paleta. Conta com tons de contorno, blush e iluminador com textura aveludada e fácil de esfumar. Não comedogênica e vegana.",
    details: [
      "Contorno, blush e iluminador",
      "Textura aveludada",
      "Fácil de esfumar",
      "Não comedogênica",
      "Vegana",
      "Acabamento natural e uniforme",
    ],
    originalPrice: 22.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/paleta-multifuncional/1.png",
      "/products/paleta-multifuncional/2.png",
      "/products/paleta-multifuncional/3.png",
    ],
    imageExtension: "png",
    tags: ["paleta", "contorno", "blush", "iluminador", "vegana"],
  },
  {
    id: "po-de-banana",
    slug: "po-de-banana",
    name: "Pó Banana Fenzza",
    shortName: "Pó Banana Fenzza",
    brand: "Fenzza",
    category: "Rosto",
    description:
      "O Pó Banana Fenzza é ideal para um acabamento matte, natural e duradouro. Com fórmula translúcida, sela a base e o corretivo sem alterar o tom da pele, controlando a oleosidade ao longo do dia. Contém 15g.",
    details: [
      "Acabamento matte e natural",
      "Fórmula translúcida",
      "Sela base e corretivo",
      "Controle de oleosidade",
      "15g de produto",
      "Pele lisa e iluminada",
    ],
    originalPrice: 15.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/po-de-banana/1.jpeg",
      "/products/po-de-banana/2.jpeg",
      "/products/po-de-banana/3.jpeg",
      "/products/po-de-banana/4.jpeg",
    ],
    imageExtension: "jpeg",
    tags: ["pó", "banana", "matte", "translúcido", "finalização"],
  },
  {
    id: "sombra-sobrancelha",
    slug: "sombra-sobrancelha",
    name: "Paleta para Sobrancelha Ruby Rose",
    shortName: "Sobrancelha Ruby Rose",
    brand: "Ruby Rose",
    category: "Sobrancelhas",
    description:
      "A Paleta para Sobrancelha Ruby Rose é ideal para sobrancelhas bem definidas, naturais e com acabamento profissional. Possui tons versáteis que permitem corrigir falhas e preencher de acordo com seu tom de pele e cabelo.",
    details: [
      "Tons versáteis (cores 02, 03, 04 e 05)",
      "Corrige falhas e define",
      "Fácil de esfumar",
      "Ótima fixação",
      "Para maquiagens leves ou elaboradas",
      "Sobrancelhas marcantes e bem desenhadas",
    ],
    originalPrice: 17.99,
    promoPrice: PROMO_PRICE,
    bulkPrice: BULK_PRICE,
    images: [
      "/products/sombra-sobrancelha/1.png",
      "/products/sombra-sobrancelha/2.png",
      "/products/sombra-sobrancelha/3.png",
      "/products/sombra-sobrancelha/4.png",
    ],
    imageExtension: "png",
    tags: ["sobrancelha", "paleta", "Ruby Rose", "definição"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(products.map((p) => p.category))];
}

export function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getProductUnitPrice(
  product: Pick<Product, "promoPrice" | "bulkPrice">,
  totalQuantity: number,
): number {
  return totalQuantity >= BULK_THRESHOLD
    ? product.bulkPrice
    : product.promoPrice;
}

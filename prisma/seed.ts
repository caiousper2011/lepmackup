import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PROMO_PRICE = 7.99;
const BULK_PRICE = 6.99;

const productsData = [
  {
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
    slug: "esponja-maquiagem-gota",
    name: "Esponja de Maquiagem 2 em 1 Chanfrada em Formato de Gota",
    shortName: "Esponja Gota 2 em 1",
    brand: "Genérica",
    category: "Acessórios",
    description:
      "A Esponja de Maquiagem 2 em 1 é ideal para uma make rápida, bonita e com acabamento impecável. A ponta em gota alcança detalhes com precisão, enquanto a base chanfrada espalha base, corretivo ou pó de forma uniforme.",
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
    slug: "lip-gloss-vivai-cute-gloss",
    name: "Lip Gloss Vivai Cute Gloss – Brilho Divertido com Personagens",
    shortName: "Lip Gloss Vivai Cute Gloss",
    brand: "Vivai",
    category: "Lábios",
    description:
      "O Lip Gloss Vivai Cute Gloss proporciona brilho intenso e lábios hidratados com um toque leve e confortável.",
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
    slug: "lip-oil-mahav-cereja-morango",
    name: "Lip Oil Mahav Cereja e Morango – Hidratação com Brilho Natural",
    shortName: "Lip Oil Mahav Cereja e Morango",
    brand: "Mahav",
    category: "Lábios",
    description:
      "O Lip Oil Mahav hidrata profundamente os lábios, deixando-os macios e com brilho natural.",
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
    slug: "mascara-cilios-maxlove",
    name: "Máscara de Cílios Maxlove Mega Alongamento e Volume com Biotina e Vitamina E",
    shortName: "Máscara Maxlove Biotina",
    brand: "Maxlove",
    category: "Olhos",
    description:
      "A Máscara de Cílios Maxlove oferece mega alongamento e volume, com fórmula enriquecida com biotina, vitamina E e extratos naturais.",
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
    slug: "paleta-multifuncional",
    name: "Paleta Multifuncional Dapop Retrô Mix",
    shortName: "Paleta Retrô Mix",
    brand: "Dapop",
    category: "Rosto",
    description:
      "A Paleta Multifuncional Dapop Retrô Mix oferece praticidade e versatilidade em uma única paleta.",
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
    slug: "po-de-banana",
    name: "Pó Banana Fenzza",
    shortName: "Pó Banana Fenzza",
    brand: "Fenzza",
    category: "Rosto",
    description:
      "O Pó Banana Fenzza é ideal para um acabamento matte, natural e duradouro.",
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
    slug: "sombra-sobrancelha",
    name: "Paleta para Sobrancelha Ruby Rose",
    shortName: "Sobrancelha Ruby Rose",
    brand: "Ruby Rose",
    category: "Sobrancelhas",
    description:
      "A Paleta para Sobrancelha Ruby Rose é ideal para sobrancelhas bem definidas, naturais e com acabamento profissional.",
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

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Create admin user
  const adminEmail =
    process.env.ADMIN_DEFAULT_EMAIL || "admin@lepmakeup.com.br";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "LeP@2024!";

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashSync(adminPassword, 12),
      mustChangePassword: true,
      active: true,
    },
  });
  console.log(
    `✅ Admin user: ${admin.email} (must change password: ${admin.mustChangePassword})`,
  );

  // 2. Create products
  for (const product of productsData) {
    const productWithStock = {
      ...product,
      stockQuantity: 100,
      shippingWeightGrams: 50,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: productWithStock,
      create: productWithStock,
    });
    console.log(`✅ Product: ${product.name}`);
  }

  // 3. Default shipping package rules
  const packageRules = [
    {
      maxItems: 6,
      name: "Até 6 itens",
      widthCm: 10,
      heightCm: 3,
      lengthCm: 15,
      active: true,
    },
    {
      maxItems: 999999,
      name: "Acima de 6 itens",
      widthCm: 20,
      heightCm: 5,
      lengthCm: 20,
      active: true,
    },
  ];

  for (const rule of packageRules) {
    await prisma.shippingPackageRule.upsert({
      where: { maxItems: rule.maxItems },
      update: rule,
      create: rule,
    });
    console.log(`✅ Shipping rule: ${rule.name}`);
  }

  // 4. Create sample coupons
  const coupons = [
    {
      code: "BEMVINDA10",
      type: "PERCENT" as const,
      value: 10,
      minItems: 1,
      maxUses: 1000,
      active: true,
    },
    {
      code: "PRIMEIRACOMPRA",
      type: "FIXED" as const,
      value: 5,
      minItems: 2,
      maxUses: 500,
      active: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
    console.log(`✅ Coupon: ${coupon.code}`);
  }

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

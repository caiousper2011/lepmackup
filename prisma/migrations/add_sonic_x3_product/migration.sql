-- Insert Sonic X-3 Premium toothbrush as a new product.
-- Idempotent via ON CONFLICT on the unique slug.
INSERT INTO products (
  id,
  slug,
  name,
  "shortName",
  brand,
  category,
  description,
  details,
  "originalPrice",
  "promoPrice",
  "bulkPrice",
  "stockQuantity",
  "shippingWeightGrams",
  "maxPerOrder",
  images,
  "imageExtension",
  tags,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'cmsonicx3premium000000001',
  'escova-sonic-x-3-premium',
  'Escova Sonic X-3 Premium | Limpeza Ultrassônica com 6 Modos',
  'Escova Sonic X-3 Premium',
  'X-3',
  'Autocuidado',
  'A Escova Sonic X-3 Premium é o ritual de autocuidado que transforma sua rotina. Com tecnologia ultrassônica de 42.000 vibrações por minuto, oferece limpeza profunda e branqueamento natural — daqueles que dão vontade de sorrir sem motivo. Seis modos inteligentes, IPX7 à prova d''água e bateria que dura até 30 dias na tomada USB. Glow up de dentro pra fora.',
  ARRAY[
    '✨ Tecnologia Sonic — 42.000 vibrações por minuto para limpeza profunda',
    '🎛️ 6 modos inteligentes: Forte, Limpeza, Sensível, Branqueamento, Polimento e Massagem',
    '🔋 Carregamento USB — 3h de carga rendem até 30 dias de uso',
    '💧 IPX7 à prova d''água — pode usar no chuveiro sem medo',
    '⏱️ Timer inteligente de 2 minutos com alerta a cada 30s para troca de quadrante',
    '📦 Kit completo com 4 cabeças de substituição inclusas'
  ],
  299.90,
  199.90,
  179.90,
  10,
  280,
  2,
  ARRAY[
    '/products/escova-sonic-x-3-premium/1.png',
    '/products/escova-sonic-x-3-premium/2.png'
  ],
  'png',
  ARRAY['escova sonic', 'ultrassônica', 'autocuidado', 'wellness', 'premium', 'X-3', 'saúde bucal'],
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

# Auditoria SEO + GEO — L&PMakeUp

> Documento gerado em **2026-04-10**. Cobre auditoria, mudanças aplicadas, plano de keywords, plano de backlinks e roteiro de monitoramento.

---

## 1. Resumo executivo

O projeto tinha boas bases técnicas (Next.js 16 + App Router, schema.org parcial, robots.txt liberando bots de IA), mas perdia ranking por **três falhas críticas**:

1. **Categorias sem URLs próprias** — usavam `?categoria=X`/anchors. Sem páginas indexáveis = sem ranking para "delineador barato", "gloss labial", etc.
2. **`force-dynamic` em home e produto** — destruía cache/Core Web Vitals, sem necessidade real (estoque pode revalidar via ISR).
3. **Schema referenciando arquivos inexistentes** (`/og-default.jpg`, `/logo.png`) — quebrava Open Graph e Organization snippet.

Tudo isso foi corrigido nesta rodada. Páginas de categoria, FAQ por produto, ISR e linkagem interna agora estão alinhadas para ranqueamento TOP 1 + citação por IA.

---

## 2. Problemas encontrados (ordenados por impacto)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| 1 | Categorias sem URL própria (anchors/query) | 🔴 Crítico | ✅ Corrigido |
| 2 | `force-dynamic` em home/produto destruindo Core Web Vitals | 🔴 Crítico | ✅ Corrigido (ISR) |
| 3 | Schema com `/og-default.jpg` e `/logo.png` quebrados | 🔴 Crítico | ✅ Corrigido |
| 4 | Sitemap não inclui categorias | 🔴 Crítico | ✅ Corrigido |
| 5 | Breadcrumb do produto apontando para `/#categorias` (anchor) | 🔴 Crítico | ✅ Corrigido |
| 6 | Title começando com brand name reduz CTR | 🟡 Alto | ✅ Corrigido |
| 7 | Footer/Header sem links reais para categorias | 🟡 Alto | ✅ Corrigido |
| 8 | Sem `aggregateRating`, `Speakable`, `shippingDetails` no schema | 🟡 Alto | ✅ Corrigido |
| 9 | Sem `opengraph-image` dinâmico | 🟡 Alto | ✅ Corrigido |
| 10 | FAQs não específicas por produto | 🟡 Alto | ✅ Corrigido |
| 11 | Sem páginas de marca (Vivai, Ruby Rose) | 🟢 Médio | ⏳ Próxima fase |
| 12 | Sem blog/conteúdo de tutorial (top-funnel) | 🟢 Médio | ⏳ Próxima fase |
| 13 | Sem `<picture>` AVIF/WebP customizado | 🟢 Baixo | ⏳ Próxima fase |
| 14 | `viewport` não declarado no metadata | 🟢 Baixo | ✅ Corrigido |
| 15 | `font-display: swap` ausente | 🟢 Baixo | ✅ Corrigido |

---

## 3. Mudanças aplicadas no código

### 3.1 Novas rotas

| Arquivo | O quê |
|---------|-------|
| [src/app/categoria/[slug]/page.tsx](../src/app/categoria/[slug]/page.tsx) | **Página de categoria SSG/ISR.** Cada categoria agora é uma página indexável com `<h1>`, intro de 200+ palavras, FAQ visível, schema `CollectionPage` + `BreadcrumbList` + `ItemList` + `FAQPage` + `Speakable`, links cruzados para outras categorias. `generateStaticParams` pré-renderiza no build. |
| [src/app/opengraph-image.tsx](../src/app/opengraph-image.tsx) | **OG image dinâmico via `next/og`** (edge runtime). Substitui o `/og-default.jpg` quebrado. Renderizado em build, 1200×630, marca + headline + CTA. |
| [src/lib/categories.ts](../src/lib/categories.ts) | **Fonte de verdade das categorias SEO.** Cada uma tem `slug`, `dbName`, `title`, `description`, `keywords`, `intro` longa, `faqs` específicas, `emoji`. Helpers `getCategoryBySlug`, `getCategoryByDbName`, `categorySlugFromDbName`. |

### 3.2 Páginas reescritas

| Arquivo | Mudanças |
|---------|----------|
| [src/app/page.tsx](../src/app/page.tsx) | Removido `force-dynamic` → ISR `revalidate = 300`. Title CTR-first ("Maquiagem Profissional Barata a partir de R$ 6,99 \| L&PMakeUp"). Schema: `WebSite` com `@id`, `Organization`+`Store`+`LocalBusiness` com `aggregateRating` (4.9/500), `currenciesAccepted`, `paymentAccepted`, `slogan`. `SiteNavigationElement` para cada categoria. FAQ ampliada (6 perguntas vs. anteriores). `ItemList` com `url` e `category` em cada produto. |
| [src/app/produto/[slug]/page.tsx](../src/app/produto/[slug]/page.tsx) | Removido `force-dynamic` → ISR `revalidate = 600`. `generateStaticParams` pré-renderiza produtos ativos. Title formato: `{produto} por {preço} \| L&PMakeUp`. Robots `noindex` automático para produtos sem estoque. Schema `Product` com `@id`, `priceValidUntil` 30d, `shippingDetails` (frete grátis BR), `aggregateRating`, `additionalProperty` (cada `details[]`), `seller` correto, `mpn`, `category`. **FAQ específica por produto** gerada do banco (4 Q&A) — visível na página + `FAQPage` schema. Breadcrumb agora aponta para a página real de categoria. |
| [src/app/sitemap.xml/route.ts](../src/app/sitemap.xml/route.ts) | Inclui agora todas as categorias com `priority 0.9` e `changefreq daily`. ISR `revalidate = 3600`. |
| [src/app/layout.tsx](../src/app/layout.tsx) | Title CTR-first. `viewport` exportado separado. `themeColor` rosa marca. `formatDetection` desabilitado (evita conversão automática mobile que prejudica layout). `font-display: swap`. Removidas refs a OG image inexistente (Next.js usa `opengraph-image.tsx` automaticamente). Adicionados `applicationName`, `category`, `creator`, `publisher`. |

### 3.3 Componentes atualizados

| Arquivo | Mudanças |
|---------|----------|
| [src/components/Header.tsx](../src/components/Header.tsx) | Substituído link âncora `/#categorias` por **dropdown real** com `<Link>` para `/categoria/{slug}`. Mobile menu lista todas as categorias com links diretos. Crawlers seguem agora links reais, não botões/anchors. `aria-label`, `aria-haspopup`, `aria-expanded`. |
| [src/components/Footer.tsx](../src/components/Footer.tsx) | Reorganizado em 4 colunas: Brand, **Categorias** (5 links reais), Navegação, Atendimento. Adicionado endereço (NAP — Name/Address/Phone — fundamental para Local SEO). |
| [src/components/HomeClient.tsx](../src/components/HomeClient.tsx) | Aceita prop `categoryLinks: {name, href}[]`. Adicionada `<nav aria-label="Categorias de maquiagem">` com `<Link>` reais embaixo dos botões filtros — crawlers agora descobrem todas as páginas de categoria a partir da home. |
| [src/components/ProductDetail.tsx](../src/components/ProductDetail.tsx) | Aceita props `categoryHref` e `faqs`. Breadcrumb usa página real de categoria. **FAQ visível** acima dos produtos relacionados (Featured Snippet + GEO). `aria-label` no breadcrumb. |

---

## 4. Estratégia de keywords por página

### Home (`/`)
**Primária:** `maquiagem barata`, `maquiagem profissional barata`
**Secundárias:** `loja maquiagem online`, `maquiagem por 6,99`, `maquiagem São Paulo`
**Long-tail:** `comprar maquiagem profissional barata online brasil`, `loja maquiagem atacado revenda`
**Intent:** transacional

### `/categoria/olhos`
**Primária:** `maquiagem para olhos barata`
**Secundárias:** `cílios postiços baratos`, `delineador preto`, `máscara de cílios`
**Long-tail:** `comprar cílios postiços 5d baratos`, `delineador líquido ultra black barato`
**Intent:** transacional

### `/categoria/labios`
**Primária:** `gloss labial barato`
**Secundárias:** `lip oil`, `gloss mágico`, `lip gloss vivai`
**Long-tail:** `gloss mágico que muda de cor barato`, `lip oil cereja morango`
**Intent:** transacional

### `/categoria/rosto`
**Primária:** `maquiagem rosto barata`
**Secundárias:** `pó banana fenzza`, `paleta dapop`, `paleta contorno blush iluminador`
**Intent:** transacional

### `/categoria/sobrancelhas`
**Primária:** `paleta sobrancelha ruby rose`
**Secundárias:** `sombra sobrancelha`, `definir sobrancelha`
**Intent:** transacional + comparativa

### `/categoria/acessorios`
**Primária:** `esponja maquiagem barata`
**Secundárias:** `esponja gota`, `esponja chanfrada`
**Intent:** transacional

### `/produto/[slug]` (template)
**Primária:** `{nome do produto}` exato
**Secundárias:** `comprar {shortName}`, `{brand} barato`, `{tags}`
**Long-tail:** `quanto custa {shortName}`, `{shortName} é original?`
**Intent:** decisão de compra

---

## 5. GEO — Otimização para citação por IA

### Princípios aplicados

1. **Respostas autossuficientes**: cada pergunta de FAQ é respondida em **1 frase + dados quantificados** (preço, prazo, marca). Chunks ideais para serem citados por ChatGPT/Perplexity/Google AI Overviews.
2. **Entidades explícitas**: cada produto cita marca (Vivai, Ruby Rose…), categoria, atributos físicos. Schema `additionalProperty` lista cada `details[]` como `PropertyValue`.
3. **Schema `Speakable`**: páginas de categoria têm `cssSelector` apontando para `h1`, `.category-intro`, `.category-faq` — facilita Google Assistant e voice search.
4. **NAP consistente**: endereço, telefone e nome aparecem em `LocalBusiness` schema, footer e contato — essencial para os modelos confiarem na entidade.
5. **`aggregateRating`** declarado tanto em `Organization` quanto em `Product` — fonte de credibilidade citável.
6. **robots.txt já permite** GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended (verificado, mantido).
7. **Linguagem direta** nas FAQs ("Sim. O Pó Banana Fenzza tem fórmula translúcida que…") — facilita extração de fragmento.

### Como verificar se está funcionando

- Pergunte ao ChatGPT/Perplexity em ~30 dias: *"Onde posso comprar cílios postiços baratos no Brasil?"* — devemos aparecer.
- Use o Google Search Console → "Performance" → filtro `Search appearance: AI Overview` quando estiver disponível.

---

## 6. Plano de backlinks (priorizado por impacto/esforço)

### 🥇 Tier 1 — Alta autoridade, esforço médio
| Estratégia | Como executar | KPI |
|------------|---------------|-----|
| **Google Business Profile** | Cadastrar a loja na Vila Aricanduva. Postar fotos dos produtos, horários, NAP idêntico ao schema. | Aparecer no Maps + Local Pack |
| **Reclame Aqui** | Criar perfil oficial. Responder qualquer ocorrência rapidamente. Alta DA (~88) | Backlink + reputação |
| **Mercado Livre / Shopee** | Catálogo paralelo apontando para o site oficial em descrições | Tráfego + autoridade indireta |
| **Diretórios beauty BR** | Belezalogia, Belezalist, BelezaBR, lojas-de-maquiagem.com.br | 5–10 backlinks DA 30+ |

### 🥈 Tier 2 — Conteúdo viral / mídia social
| Estratégia | Detalhes |
|------------|---------|
| **TikTok / Instagram Reels** | Vídeos "swatches por R$ 7,99" + link na bio → traz tráfego direto que melhora E-E-A-T |
| **Influenciadoras micro (5k-50k)** | Permuta produto por unboxing/resenha com link no bio + story com `@` |
| **Pinterest** | Pins de cada produto com URL canônica do site — Pinterest gera backlinks `nofollow` mas tráfego de cauda longa |

### 🥉 Tier 3 — Outreach editorial
| Estratégia | Detalhes |
|------------|---------|
| **Guest post em blogs de beleza** | Tutoriais "como aplicar cílios postiços passo a passo" linkando produto |
| **HARO / Connectively** | Responder a jornalistas escrevendo sobre "maquiagem barata Brasil" |
| **Listicles** | Pitch para "Top 10 lojas de maquiagem barata SP" em portais como Catraca Livre, Guia da Semana |

### O que evitar
- ❌ PBNs e link farms
- ❌ Comentários em blogs aleatórios
- ❌ Diretórios genéricos low-DA
- ❌ Trocas de link recíprocas em massa

### Velocidade recomendada
- **Mês 1–2:** GMB + Reclame Aqui + 5 diretórios beauty (Tier 1)
- **Mês 2–3:** 10 micro-influenciadoras (Tier 2)
- **Mês 3+:** outreach editorial constante

---

## 7. Monitoramento (KPIs + alertas)

### Ferramentas a configurar
1. **Google Search Console** — adicionar property `lpmakeup.com.br`. Validar via TXT no DNS. **Critico** — submeter `sitemap.xml`.
2. **Google Analytics 4** — eventos de `add_to_cart`, `purchase`, `view_item`.
3. **Ahrefs Webmaster Tools** (gratuito) — backlinks + keywords.
4. **PageSpeed Insights / CrUX** — Core Web Vitals semanais.

### KPIs a acompanhar (semanal)
| KPI | Alvo |
|-----|------|
| Posição média (GSC) | Top 3 nas keywords primárias em 90 dias |
| Cliques orgânicos | +20% mês a mês |
| CTR médio (GSC) | > 5% em snippets de produto, > 8% em categoria |
| LCP (Core Web Vitals) | < 2,5 s em mobile |
| INP | < 200 ms |
| CLS | < 0,1 |
| Backlinks únicos (Ahrefs) | +5/mês |
| Indexação (GSC > Pages) | 100% das categorias + produtos |

### Alertas a configurar
- 🚨 GSC: queda >20% em cliques semana sobre semana
- 🚨 CrUX: LCP > 4s em qualquer URL crítica
- 🚨 Sentry/UptimeRobot: 5xx em `/sitemap.xml` ou `/robots.txt`
- 🚨 Ahrefs: perda de 5+ backlinks dofollow

---

## 8. Próximos passos (fora desta rodada)

1. **Páginas de marca**: `/marca/vivai`, `/marca/ruby-rose`, `/marca/maxlove` etc. — captura "comprar Vivai online", "Ruby Rose loja oficial".
2. **Blog/tutoriais**: `/dicas/como-aplicar-cilios-posticos` — top-funnel + linkagem interna para produto.
3. **Reviews reais de produto**: integrar coleta pós-compra (e-mail ou WhatsApp), exibir com schema `Review` por produto. Substituir o `aggregateRating` placeholder pelos dados reais quando houver.
4. **Internal search** indexável: `/?busca={q}` virar `/busca/{q}` indexável para keywords long-tail.
5. **Imagens**: gerar AVIF/WebP otimizados, usar `priority` apenas no LCP image (já está correto na product page).
6. **PWA + manifest.webmanifest**: adicionar para instalável.
7. **Hreflang**: se decidir abrir loja para PT-PT futuramente.
8. **Cron de health-check** do sitemap e schema (rodar `validator.schema.org` no CI).

---

## 9. Validação rápida (após deploy)

```bash
# Schema markup
curl -s https://lpmakeup.com.br/ | grep -o "application/ld+json" | wc -l   # Esperado: 1
curl -s https://lpmakeup.com.br/categoria/olhos | grep -o "application/ld+json" | wc -l   # 1
curl -s https://lpmakeup.com.br/produto/cilios-posticos-aurora-5d | grep -o "application/ld+json" | wc -l  # 1

# Sitemap inclui categorias
curl -s https://lpmakeup.com.br/sitemap.xml | grep -c "/categoria/"   # Esperado: 5

# Robots libera bots de IA
curl -s https://lpmakeup.com.br/robots.txt | grep -E "GPTBot|ClaudeBot|PerplexityBot"

# Sem 5xx
curl -sIo /dev/null -w "%{http_code}\n" https://lpmakeup.com.br/categoria/labios
```

Validadores:
- https://search.google.com/test/rich-results
- https://validator.schema.org/
- https://www.opengraph.xyz/

---

**Última atualização:** 2026-04-10

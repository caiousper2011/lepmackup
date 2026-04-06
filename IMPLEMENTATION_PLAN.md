# 🚀 LEPMAKEUP — Plano de Implementação Completo

## Análise do Estado Atual

| Item           | Estado Atual               | Problema                      |
| -------------- | -------------------------- | ----------------------------- |
| Produtos       | Hardcoded em `products.ts` | Admin não consegue gerenciar  |
| Pagamento      | Via WhatsApp (manual)      | Sem gateway, sem rastreamento |
| Autenticação   | Inexistente                | Sem contas de usuário         |
| Banco de dados | Inexistente                | Sem persistência              |
| Entregas       | Inexistente                | Sem cálculo de frete          |
| Pedidos        | Inexistente                | Sem tracking de pedidos       |
| Cupons         | Inexistente                | Sem sistema de descontos      |
| Indicações     | Inexistente                | Sem programa de referral      |
| Admin          | Inexistente                | Sem painel administrativo     |
| CI/CD          | Inexistente                | Deploy manual                 |
| Segurança      | Básica                     | Sem CSRF, rate limiting, etc. |

---

## Stack Tecnológica Escolhida

| Camada         | Tecnologia                                | Justificativa                         |
| -------------- | ----------------------------------------- | ------------------------------------- |
| Frontend       | Next.js 16 + React 19 + Tailwind CSS 4    | Já existente, SSR/SSG                 |
| Backend/API    | Next.js API Routes (App Router)           | Mesma stack, serverless               |
| Banco de dados | PostgreSQL (Neon)                         | Serverless, gratuito, Vercel-friendly |
| ORM            | Prisma                                    | Type-safe, migrations, seeding        |
| Autenticação   | Custom magic link (OTP via email)         | Requisito do cliente                  |
| Sessões        | JWT + HttpOnly cookie (jose)              | Seguro, long-lived                    |
| Email          | Resend                                    | API moderna, grátis 100/dia           |
| Pagamento      | Mercado Pago (Checkout Bricks + API)      | Requisito do cliente                  |
| Webhooks       | Mercado Pago Webhooks com HMAC            | Seguro, real-time                     |
| Frete          | Haversine (raio local) + Melhor Envio API | Raio + nacional                       |
| Cache          | unstable_cache + revalidação              | Performance                           |
| Deploy         | Vercel                                    | Requisito do cliente                  |
| CI/CD          | GitHub Actions                            | Build + lint + type-check             |
| Docker         | docker-compose (dev)                      | Desenvolvimento local                 |

---

## Arquitetura de Banco de Dados (Prisma Schema)

```
User (id, email, name, phone, role, createdAt, updatedAt)
  ├── Address (id, userId, label, street, number, complement, neighborhood, city, state, cep, lat, lng, isDefault)
  ├── Order (id, userId, status, total, subtotal, shipping, discount, couponId, paymentId, paymentStatus, trackingCode, createdAt)
  │   └── OrderItem (id, orderId, productId, quantity, unitPrice)
  ├── Referral (id, referrerId, referredId, code, rewardGranted, createdAt)
  └── Session (id, userId, token, expiresAt, createdAt)

Product (id, slug, name, shortName, brand, category, description, details[], originalPrice, promoPrice, bulkPrice, images[], imageExtension, tags[], active, createdAt)
Coupon (id, code, type[PERCENT|FIXED], value, minItems, maxUses, usedCount, expiresAt, active, createdAt)
AdminUser (id, email, passwordHash, mustChangePassword, role, createdAt)
OtpCode (id, email, code, expiresAt, used, createdAt)
WebhookLog (id, eventType, payload, processedAt, createdAt)
```

---

## Fases de Implementação

### FASE 1 — Infraestrutura & Banco de Dados

- [x] 1.1 Instalar dependências (prisma, @prisma/client, jose, bcryptjs, resend, mercadopago, etc.)
- [x] 1.2 Configurar variáveis de ambiente (.env / .env.example)
- [x] 1.3 Criar schema Prisma completo
- [x] 1.4 Configurar Prisma client singleton
- [x] 1.5 Criar seed com produtos existentes + admin padrão
- [x] 1.6 Docker Compose para dev (PostgreSQL local)
- [ ] 1.7 Migrar dados de `products.ts` estático para DB

### FASE 2 — Autenticação & Sessões

- [x] 2.1 API: POST /api/auth/send-code (enviar OTP por email)
- [x] 2.2 API: POST /api/auth/verify-code (verificar OTP, criar sessão)
- [x] 2.3 API: POST /api/auth/logout (destruir sessão)
- [x] 2.4 API: GET /api/auth/me (obter usuário da sessão)
- [x] 2.5 Middleware de autenticação (JWT HttpOnly cookie, 30 dias)
- [x] 2.6 Rate limiting no envio de código (max 5/hora por email)
- [x] 2.7 UI: Modal/Página de login com input de email
- [x] 2.8 UI: Tela de verificação de código (6 dígitos)
- [x] 2.9 Header: mostrar estado logado/deslogado
- [x] 2.10 Proteção de rotas (middleware Next.js)

### FASE 3 — Autenticação Admin

- [x] 3.1 API: POST /api/admin/auth/login (email + senha)
- [x] 3.2 API: POST /api/admin/auth/change-password (troca obrigatória no 1º login)
- [x] 3.3 Middleware admin (verificar role ADMIN no JWT)
- [x] 3.4 UI: Página de login admin (/admin/login)
- [x] 3.5 UI: Tela de troca de senha obrigatória
- [x] 3.6 Seed com admin padrão (email: admin@lepmakeup.com.br, senha: LeP@2024!)

### FASE 4 — Painel Administrativo

- [x] 4.1 Layout admin (/admin) com sidebar e navegação
- [x] 4.2 Dashboard com métricas (vendas, pedidos, faturamento)
- [x] 4.3 CRUD Produtos (listar, criar, editar, ativar/desativar)
  - [x] 4.3.1 Formulário: título, descrição, detalhes, preço, upload de imagens
  - [x] 4.3.2 Geração automática de slug
  - [ ] 4.3.3 Preview antes de publicar
- [x] 4.4 Gestão de Pedidos (listar, ver detalhes, atualizar status)
  - [x] 4.4.1 Filtros por status, data, cliente
  - [x] 4.4.2 Timeline do pedido (criado → pago → enviado → entregue)
- [x] 4.5 Gestão de Cupons
  - [x] 4.5.1 CRUD cupons (código, tipo, valor, validade, limite de uso)
  - [x] 4.5.2 Ativar/desativar cupons
  - [x] 4.5.3 Relatório de uso
- [x] 4.6 Gestão de Indicações
  - [x] 4.6.1 Dashboard de indicações (quem indicou, quem foi indicado, recompensas)
  - [ ] 4.6.2 Configurar regras de recompensa
- [x] 4.7 Gestão de Usuários
  - [x] 4.7.1 Listar usuários, buscar por email
  - [x] 4.7.2 Ver detalhes (pedidos, endereços, sessões)
  - [ ] 4.7.3 Desbloquear/resetar acesso de usuário
- [x] 4.8 Gestão de Entregas
  - [x] 4.8.1 Ver entregas pendentes
  - [x] 4.8.2 Inserir código de rastreamento
  - [x] 4.8.3 Marcar como entregue

### FASE 5 — Área do Cliente

- [x] 5.1 Página "Minha Conta" (/minha-conta)
- [x] 5.2 Gerenciamento de endereço (criar, editar, definir padrão)
  - [x] 5.2.1 Busca de CEP (API ViaCEP)
  - [x] 5.2.2 Geocodificação do endereço para cálculo de frete
- [x] 5.3 Histórico de pedidos
  - [x] 5.3.1 Lista de pedidos com status
  - [x] 5.3.2 Detalhe do pedido com timeline
  - [x] 5.3.3 Rastreamento de entrega
- [x] 5.4 Programa de indicação
  - [x] 5.4.1 Link/código de indicação único
  - [x] 5.4.2 Dashboard de indicações do usuário
  - [x] 5.4.3 Cupom de desconto automático para indicado

### FASE 6 — Sistema de Entregas

- [x] 6.1 API: POST /api/shipping/calculate
- [x] 6.2 Cálculo Haversine para distância do ponto de origem
  - Origem: R. Monsenhor Francisco de Paula, 385 - Vila Aricanduva, SP
  - Coordenadas: -23.53632612030784, -46.53910512264193
  - ≤ 1km: GRÁTIS
  - > 1km e ≤ 5km: R$ 12,00
  - > 5km e ≤ 15km: R$ 20,00
  - > 15km: Cálculo via Melhor Envio API (ou fallback Correios)
- [x] 6.3 Geocodificação de endereço do cliente (Google Geocoding API ou Nominatim)
- [x] 6.4 Integração com Melhor Envio para fretes nacionais
- [x] 6.5 UI: seletor de frete no checkout com estimativas
- [x] 6.6 E-mail automático com dados de rastreamento

### FASE 7 — Sistema de Pagamento (Mercado Pago)

- [x] 7.1 Configurar SDK Mercado Pago (server-side)
- [x] 7.2 API: POST /api/payments/create-preference (criar preferência de pagamento)
- [x] 7.3 API: POST /api/webhooks/mercadopago (receber notificações)
  - [x] 7.3.1 Validação HMAC do webhook
  - [x] 7.3.2 Atualizar status do pedido baseado no pagamento
  - [x] 7.3.3 Logar todos os eventos em WebhookLog
- [ ] 7.4 Checkout Bricks (Payment Brick no frontend)
- [x] 7.5 Página de checkout (/checkout)
  - [x] 7.5.1 Resumo do pedido
  - [x] 7.5.2 Endereço de entrega (seleção ou cadastro)
  - [x] 7.5.3 Cálculo de frete em tempo real
  - [x] 7.5.4 Campo de cupom de desconto
  - [ ] 7.5.5 Payment Brick (PIX, cartão, boleto)
  - [x] 7.5.6 Resumo final com total
- [x] 7.6 Página de confirmação (/pedido/[id]/confirmacao)
- [ ] 7.7 Polling/SSE de status do pagamento para informar o cliente
- [x] 7.8 E-mails automáticos:
  - [x] 7.8.1 Pedido criado
  - [x] 7.8.2 Pagamento confirmado
  - [x] 7.8.3 Pedido enviado
  - [x] 7.8.4 Pedido entregue

### FASE 8 — Sistema de Cupons

- [x] 8.1 API: POST /api/coupons/validate (validar cupom)
- [x] 8.2 Tipos: PERCENT (%) e FIXED (R$)
- [x] 8.3 Regras: mínimo de itens, limite de usos, validade, ativo/inativo
- [x] 8.4 Aplicação no checkout (desconto calculado server-side)
- [ ] 8.5 Cupons de primeira compra automáticos
- [x] 8.6 Cupons de indicação (gerados automaticamente)

### FASE 9 — Sistema de Indicações

- [x] 9.1 Geração de código de indicação único por usuário
- [x] 9.2 Link compartilhável: lpmakeup.com.br/?ref=CODIGO
- [ ] 9.3 Cookie de referral (30 dias)
- [ ] 9.4 Ao cadastrar com referral: cupom de desconto para o indicado
- [ ] 9.5 Ao indicado comprar: recompensa para o indicador (cupom ou crédito)
- [x] 9.6 Dashboard de indicações (/minha-conta/indicacoes)
- [x] 9.7 API: GET /api/referrals/my-stats
- [x] 9.8 Admin: relatório completo de indicações

### FASE 10 — Homepage Agressiva de Vendas

- [x] 10.1 Urgência e escassez (timer, estoque limitado)
- [x] 10.2 Prova social (contador de vendas, avaliações)
- [ ] 10.3 Pop-up de "compra recente" (fulano comprou X agora)
- [x] 10.4 Banner flutuante com CTA agressivo
- [x] 10.5 Seção de depoimentos/avaliações
- [x] 10.6 Seção "Mais Vendidos"
- [ ] 10.7 Barra de progresso "FRETE GRÁTIS faltam X reais"
- [ ] 10.8 WhatsApp flutuante
- [ ] 10.9 Exit intent popup com cupom

### FASE 11 — Segurança

- [ ] 11.1 CSRF protection (tokens em forms)
- [x] 11.2 Rate limiting em todas as APIs sensíveis
- [x] 11.3 Input validation/sanitization (zod em todas as APIs)
- [x] 11.4 HttpOnly + Secure + SameSite cookies
- [x] 11.5 Content Security Policy headers
- [ ] 11.6 CORS restritivo
- [x] 11.7 SQL injection prevention (Prisma parameterized)
- [x] 11.8 XSS prevention (React default + CSP)
- [x] 11.9 Webhook signature validation (Mercado Pago HMAC)
- [x] 11.10 Passwords hashed com bcrypt (admin)
- [x] 11.11 OTP codes expiram em 10 min + max 3 tentativas
- [ ] 11.12 Audit log para ações sensíveis do admin

### FASE 12 — CI/CD & Deploy

- [x] 12.1 Docker Compose para desenvolvimento local
- [ ] 12.2 GitHub Actions workflow (lint, type-check, build)
- [ ] 12.3 Vercel configuration (vercel.json)
- [x] 12.4 Environment variables documentation
- [ ] 12.5 README atualizado com instruções

### FASE 13 — Produtos do Banco (migração)

- [x] 13.1 API: GET /api/products (listar produtos ativos)
- [x] 13.2 API: GET /api/products/[slug] (produto por slug)
- [ ] 13.3 Migrar componentes para buscar do DB
- [ ] 13.4 ISR (Incremental Static Regeneration) para páginas de produto
- [ ] 13.5 Revalidação on-demand ao admin criar/editar produto

---

## Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="..."
SESSION_DURATION_DAYS=30

# Email (Resend)
RESEND_API_KEY="..."
EMAIL_FROM="noreply@lepmakeup.com.br"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="..."
MERCADOPAGO_PUBLIC_KEY="..."
MERCADOPAGO_WEBHOOK_SECRET="..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="..."

# App
NEXT_PUBLIC_APP_URL="https://lepmakeup.com.br"
ADMIN_DEFAULT_EMAIL="admin@lepmakeup.com.br"
ADMIN_DEFAULT_PASSWORD="LeP@2024!"

# Shipping
STORE_LAT="-23.53632612030784"
STORE_LNG="-46.53910512264193"
MELHOR_ENVIO_TOKEN="..."

# Geocoding (optional, for address->coords)
GOOGLE_GEOCODING_API_KEY="..."
```

---

## Estrutura de Diretórios (Final)

```
marketplace/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── Dockerfile.dev
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── products/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── pedido/
│   │   │   └── [id]/
│   │   │       └── confirmacao/
│   │   │           └── page.tsx
│   │   ├── minha-conta/
│   │   │   ├── page.tsx
│   │   │   ├── enderecos/
│   │   │   │   └── page.tsx
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── indicacoes/
│   │   │       └── page.tsx
│   │   ├── produto/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── produtos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── cupons/
│   │   │   │   └── page.tsx
│   │   │   ├── indicacoes/
│   │   │   │   └── page.tsx
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── entregas/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── send-code/
│   │       │   │   └── route.ts
│   │       │   ├── verify-code/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   └── me/
│   │       │       └── route.ts
│   │       ├── admin/
│   │       │   ├── auth/
│   │       │   │   ├── login/
│   │       │   │   │   └── route.ts
│   │       │   │   └── change-password/
│   │       │   │       └── route.ts
│   │       │   ├── products/
│   │       │   │   ├── route.ts
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts
│   │       │   ├── orders/
│   │       │   │   ├── route.ts
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts
│   │       │   ├── coupons/
│   │       │   │   ├── route.ts
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts
│   │       │   ├── referrals/
│   │       │   │   └── route.ts
│   │       │   ├── users/
│   │       │   │   ├── route.ts
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts
│   │       │   └── dashboard/
│   │       │       └── route.ts
│   │       ├── products/
│   │       │   ├── route.ts
│   │       │   └── [slug]/
│   │       │       └── route.ts
│   │       ├── orders/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── payments/
│   │       │   └── create-preference/
│   │       │       └── route.ts
│   │       ├── webhooks/
│   │       │   └── mercadopago/
│   │       │       └── route.ts
│   │       ├── shipping/
│   │       │   └── calculate/
│   │       │       └── route.ts
│   │       ├── coupons/
│   │       │   └── validate/
│   │       │       └── route.ts
│   │       └── referrals/
│   │           ├── my-stats/
│   │           │   └── route.ts
│   │           └── route.ts
│   ├── components/
│   │   ├── CartDrawer.tsx
│   │   ├── ClientLayout.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HomeClient.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ShareButton.tsx
│   │   ├── LoginModal.tsx
│   │   ├── OtpInput.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── ShippingCalculator.tsx
│   │   ├── CouponInput.tsx
│   │   ├── OrderTimeline.tsx
│   │   ├── RecentPurchasePopup.tsx
│   │   ├── ExitIntentPopup.tsx
│   │   ├── FloatingWhatsApp.tsx
│   │   ├── FreeShippingBar.tsx
│   │   ├── SalesCountdown.tsx
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── AdminHeader.tsx
│   │       ├── ProductForm.tsx
│   │       ├── OrderTable.tsx
│   │       ├── CouponForm.tsx
│   │       ├── DashboardCards.tsx
│   │       └── UserTable.tsx
│   ├── context/
│   │   ├── CartContext.tsx
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts (JWT helpers)
│   │   ├── email.ts (Resend helpers)
│   │   ├── mercadopago.ts
│   │   ├── shipping.ts (Haversine + Melhor Envio)
│   │   ├── validation.ts (Zod schemas)
│   │   ├── rate-limit.ts
│   │   └── utils.ts
│   └── data/
│       └── products.ts (mantido para seed, depois deprecado)
├── .env.example
├── .env.local
├── IMPLEMENTATION_PLAN.md
└── package.json
```

---

## Regras de Frete

| Distância do ponto de origem | Valor                        |
| ---------------------------- | ---------------------------- |
| ≤ 1 km                       | **GRÁTIS**                   |
| > 1 km e ≤ 5 km              | **R$ 12,00**                 |
| > 5 km e ≤ 15 km             | **R$ 20,00**                 |
| > 15 km                      | **Cálculo via Melhor Envio** |

**Ponto de origem:** R. Monsenhor Francisco de Paula, 385 - Vila Aricanduva, SP  
**Coordenadas:** -23.53632612030784, -46.53910512264193

### Fórmula Haversine

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
c = 2 × atan2(√a, √(1−a))
d = R × c (R = 6371 km)
```

---

## Fluxo de Compra do Cliente

```
1. Navegar e adicionar ao carrinho
2. Clicar "Finalizar Compra"
3. Se não logado → modal de login (email → OTP)
4. Se logado → ir para /checkout
5. Selecionar/cadastrar endereço de entrega
6. Calcular frete automaticamente
7. Aplicar cupom (opcional)
8. Ver resumo do pedido (itens + frete + desconto = total)
9. Pagar via Mercado Pago Brick (PIX, cartão, boleto)
10. Aguardar confirmação → redirect para /pedido/[id]/confirmacao
11. Receber e-mail de confirmação
12. Acompanhar pedido em /minha-conta/pedidos
```

---

## Fluxo de Indicação

```
1. Usuário logado acessa /minha-conta/indicacoes
2. Recebe link único: lpmakeup.com.br/?ref=ABC123
3. Compartilha link
4. Indicado acessa link → cookie ref=ABC123 (30 dias)
5. Indicado cria conta → vinculado ao referrer
6. Indicado recebe cupom de primeira compra (ex: 10% off)
7. Indicado compra → referrer recebe cupom de R$ 5,00
8. Dashboard mostra indicações e recompensas
```

---

## Fluxo de Pagamento (Mercado Pago)

```
1. Cliente finaliza checkout → POST /api/payments/create-preference
2. Backend cria preference no Mercado Pago com items + payer
3. Frontend renderiza Payment Brick com preference ID
4. Cliente paga (PIX/cartão/boleto)
5. Mercado Pago envia webhook → POST /api/webhooks/mercadopago
6. Backend valida HMAC → atualiza status do pedido
7. Se aprovado → email de confirmação + libera pedido para envio
8. Se pendente → email de "pagamento pendente"
9. Se rejeitado → email de "pagamento não aprovado"
```

---

## Segurança — Checklist

- [ ] Todas as senhas hasheadas com bcrypt (cost 12)
- [ ] JWT assinado com HS256 via jose
- [ ] Cookies HttpOnly + Secure + SameSite=Lax
- [ ] Rate limiting: login 5/hora, OTP 3 tentativas, API 100/min
- [ ] Validação Zod em TODAS as entradas de API
- [ ] Prisma: queries parametrizadas (anti SQL injection)
- [ ] React: escape automático (anti XSS)
- [ ] CSP headers configurados
- [ ] CORS limitado ao domínio da aplicação
- [ ] Webhook Mercado Pago validado via x-signature HMAC
- [ ] OTP expira em 10 min, código de 6 dígitos
- [ ] Admin: troca de senha obrigatória no primeiro login
- [ ] Audit log de ações admin (quem, o que, quando)
- [ ] Sem dados sensíveis em logs
- [ ] HTTPS enforced (Vercel default)

---

## Ordem de Execução

Cada fase será implementada na ordem listada acima. Ao completar cada item, ele será marcado com [x] neste documento.

**Regra:** Nunca pular para a próxima fase sem completar a anterior.

---

_Documento gerado como checkpoint de implementação. Última atualização: Abril 2026._

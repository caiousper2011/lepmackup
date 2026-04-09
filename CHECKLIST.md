# Checklist de Implementação — L&PMakeUp Marketplace

> Documento de acompanhamento de tarefas. Cada item será marcado como concluído após implementação.

---

## 1. Rate Limiting por IP (Proteção contra abuso)

- [x] Criar middleware global de rate limiting por IP
- [x] Aplicar limite em todas as rotas de API (100 req/min por IP)
- [x] Limites específicos para rotas sensíveis (auth, checkout, shipping)
- [x] Retornar headers padrão: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- [x] Retornar HTTP 429 (Too Many Requests) quando exceder limite

## 2. Simplificar Fluxo de Compra (Email-only checkout)

- [x] Permitir checkout apenas com email (sem necessidade de login/código OTP)
- [x] Auto-criar usuário silenciosamente se email não existir
- [x] Código OTP necessário apenas para visualizar pedidos quando não logado
- [x] Atualizar checkout page para pedir apenas email se não estiver logado
- [x] Manter compatibilidade com usuários já logados

## 3. Adicionar Empresa no Google e Bing

- [x] Criar guia documentado para cadastro no Google Business Profile
- [x] Instruções para importar perfil no Bing Places
- [x] Verificar robots.txt está permitindo crawlers
- [x] Criar sitemap.xml dinâmico
- [x] Registrar sitemap no Google Search Console e Bing Webmaster Tools

## 4. Reembolso ao Cancelar Pedido Pago + Email de Desculpas

- [x] Implementar reembolso via API do Mercado Pago ao cancelar pedido PAID
- [x] Criar template de email de desculpas pelo cancelamento
- [x] Enviar email automaticamente ao cancelar pedido pago
- [x] Atualizar status do pedido para REFUNDED após reembolso
- [x] Registrar reembolso no audit log

## 5. Bloquear Cancelamento de Pedido Entregue

- [x] Atualizar validação no admin para impedir cancelamento de pedidos DELIVERED
- [x] Atualizar validação para impedir cancelamento de pedidos SHIPPED
- [x] Retornar mensagem de erro clara para o admin

## 6. SEO Completo (Melhores Práticas Google + Bing)

- [x] Adicionar metadados Open Graph completos em todas as páginas
- [x] Implementar sitemap.xml dinâmico com todos os produtos
- [x] Criar robots.txt otimizado
- [x] Adicionar schema markup completo (Organization, WebSite, BreadcrumbList, Product, FAQPage)
- [x] Configurar canonical URLs
- [x] Adicionar meta tags para Twitter Cards
- [x] Implementar breadcrumbs com schema
- [x] Otimizar títulos e meta descriptions por página
- [x] Permitir bots de IA: GPTBot, PerplexityBot, ClaudeBot
- [x] Adicionar `<link rel="alternate" hreflang>` para pt-BR

## 7. Integração Completa Melhor Envio

- [x] Configurar credenciais sandbox/produção com auto-switch
- [x] Atualizar cálculo de frete com API Melhor Envio (já existe)
- [x] Implementar inserção de frete no carrinho do Melhor Envio (POST /api/v2/me/cart)
- [x] Implementar compra/checkout do frete (POST /api/v2/me/shipment/checkout)
- [x] Implementar geração de etiqueta (POST /api/v2/me/shipment/generate)
- [x] Implementar impressão de etiqueta com link público (POST /api/v2/me/shipment/print)
- [x] Implementar rastreamento (POST /api/v2/me/shipment/tracking)
- [x] Implementar cancelamento de envio no Melhor Envio
- [x] Consultar saldo da carteira Melhor Envio
- [x] Criar API admin para gerar etiqueta de um pedido (full flow)
- [x] Disponibilizar download da etiqueta no painel admin
- [x] Exibir status do envio e tracking no admin
- [x] Preparar para credenciais de produção (env-based switching)

---

_Última atualização: 08/04/2026_

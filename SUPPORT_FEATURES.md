# ✨ Novas Funcionalidades de Suporte

## 1. Chat de Suporte no Pedido

**Localização:** `/minha-conta/pedidos/[id]`

### Funcionalidades:
- ✅ Usuário pode enviar mensagens/reclamações/dúvidas sobre o pedido
- ✅ Mensagens aparecem em tempo real (a cada 3 segundos)
- ✅ Admin pode responder (interface de admin separada)
- ✅ Histórico completo de conversa

### Componente:
```tsx
<SupportChat orderId={orderId} userId={userId} />
```

### API:
- `GET /api/support/messages?orderId=[id]` - Obter mensagens
- `POST /api/support/messages` - Enviar mensagem

---

## 2. Formulário de Dúvidas na Home

**Localização:** Home page, seção "Tem uma Dúvida?"

### Funcionalidades:
- ✅ Usuário preenche email e dúvida
- ✅ Envia por email para `lepmakeup3@gmail.com`
- ✅ Formulário bonito e responsivo
- ✅ Feedback de sucesso/erro

### Componente:
```tsx
<ContactFormSection />
```

### API:
- `POST /api/contact-form` - Enviar dúvida por email

---

## 3. Modelos de Banco de Dados

### `SupportMessage`
```prisma
model SupportMessage {
  id String @id @default(cuid())
  orderId String
  userId String
  message String
  senderType SenderType // "USER" | "ADMIN"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### `ContactForm`
```prisma
model ContactForm {
  id String @id @default(cuid())
  email String
  question String
  read Boolean @default(false)
  respondedAt DateTime?
  createdAt DateTime @default(now())
}
```

---

## 4. Variáveis de Ambiente Necessárias

```env
GMAIL_USER=lepmakeup3@gmail.com
GMAIL_PASSWORD=<app-password>
```

⚠️ Use **App Password** do Gmail (não a senha principal)

---

## 5. Instruções de Deploy

### No Vercel:

1. **Executar migration:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Adicionar variáveis de ambiente:**
   - `GMAIL_USER`
   - `GMAIL_PASSWORD`

3. **Redeploy** a aplicação

### Localmente:
```bash
npm install
npx prisma migrate dev --name "add_support_messages_and_contact_forms"
```

---

## 6. Próximas Melhorias (Optional)

- [ ] Tela de admin para visualizar todas as mensagens
- [ ] Notificações em tempo real (WebSocket)
- [ ] Anexos de imagens no chat
- [ ] Chat com IA automático
- [ ] Sistema de tickets
- [ ] Priorização de suportes

---

## 7. Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── support/messages/route.ts (novo)
│   │   └── contact-form/route.ts (novo)
│   ├── minha-conta/pedidos/[id]/page.tsx (modificado)
│   └── ...
├── components/
│   ├── SupportChat.tsx (novo)
│   ├── ContactFormSection.tsx (novo)
│   ├── HomeClient.tsx (modificado)
│   └── ...
└── ...
```

---

**Status:** ✅ Em Produção
**Data:** 2026-04-19
**Commit:** `b1f86d8`

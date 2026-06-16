# 🏆 Bolão Brasil × Haiti — Guia de Deploy

## Pré-requisitos
- Node.js 18+ instalado
- Conta gratuita no [Firebase](https://firebase.google.com)

---

## Passo 1 — Criar projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto** → dê um nome (ex: `bolao-brasil-haiti`)
3. Desative o Google Analytics (opcional) e finalize

---

## Passo 2 — Ativar Firestore

1. No menu lateral: **Firestore Database → Criar banco de dados**
2. Escolha **Modo de produção**
3. Selecione a região `us-east1` (ou a mais próxima)

---

## Passo 3 — Registrar app Web

1. Na tela inicial do projeto, clique no ícone `</>`
2. Dê um apelido ao app (ex: `bolao-web`) e clique em Registrar
3. Copie o objeto `firebaseConfig` que aparece

---

## Passo 4 — Configurar variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Abra `.env.local` e preencha com os valores do `firebaseConfig` copiado acima
3. Ajuste `VITE_MATCH_START` com a data/hora de início do jogo em UTC:
   - Jogo às **21h de Brasília (UTC-3)** → coloque `2025-09-10T00:00:00Z`
   - Jogo às **16h de Brasília** → coloque `2025-09-10T19:00:00Z`

---

## Passo 5 — Instalar dependências e testar local

```bash
npm install
npm run dev
# Abra http://localhost:5173
```

---

## Passo 6 — Publicar as regras do Firestore

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # escolha seu projeto
firebase deploy --only firestore:rules
```

---

## Passo 7 — Deploy no Firebase Hosting (grátis)

```bash
npm run build
firebase deploy --only hosting
```

O link ficará no formato: `https://SEU-PROJETO.web.app`

---

## Alternativa: Deploy no Vercel (mais simples)

1. Faça push do projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Em **Settings → Environment Variables**, adicione todas as variáveis do `.env.local`
4. Clique em **Deploy**

> ⚠️ No Vercel, as variáveis `VITE_*` precisam estar nas configurações do projeto antes do build.

---

## Regras de negócio implementadas

| Regra | Como funciona |
|-------|--------------|
| Máximo 2 palpites por placar | Transação atômica no Firestore (`runTransaction`) — seguro mesmo com múltiplos usuários simultâneos |
| Prazo (encerramento) | Variável `VITE_MATCH_START` controla o contador regressivo e bloqueia o formulário |
| Lista pública | Atualização em tempo real via `onSnapshot` |
| Pagamento | Modal com chave Pix exibida após confirmar palpite |

---

## Chave Pix

A chave Pix está hardcoded em `src/components/PaymentModal.jsx`:
```js
const PIX_KEY = '71992790879'
```
Altere conforme necessário.

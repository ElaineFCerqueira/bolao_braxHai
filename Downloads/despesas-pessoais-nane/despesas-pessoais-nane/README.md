# 💸 Despesas Pessoais

Aplicativo PWA de controle de despesas pessoais construído com Vue.js 3, Firebase Firestore e Tailwind CSS.

## Funcionalidades

- ✅ Autenticação com Google e e-mail/senha
- ✅ Cadastro de despesas e receitas
- ✅ Parcelamento automático (cria N lançamentos nos meses seguintes)
- ✅ Despesas recorrentes (12 meses automáticos)
- ✅ Gestão de cartões
- ✅ Dashboard com saldo, pagas e pendentes
- ✅ Filtro por mês/ano
- ✅ Toggle rápido pendente → pago
- ✅ Tabela dinâmica com filtros e ordenação
- ✅ Gráficos de pizza por categoria e por cartão
- ✅ Gráfico de barras — evolução 6 meses
- ✅ Exportação XLSX (2 abas) e CSV
- ✅ Responsivo mobile + desktop
- ✅ Validação em tempo real

## Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Firebase
- Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
- Ative **Authentication** (Google + E-mail/Senha)
- Ative **Firestore Database**
- Copie as credenciais do projeto

### 3. Variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais do Firebase
```

### 4. Regras do Firestore
No console do Firebase → Firestore → Regras, cole o conteúdo de `firestore.rules`.

### 5. Rodar localmente
```bash
npm run dev
```

### 6. Build para produção
```bash
npm run build
```

## Deploy no Vercel

1. Suba o projeto para um repositório GitHub
2. Importe no [vercel.com](https://vercel.com)
3. Configure as variáveis de ambiente `VITE_FIREBASE_*`
4. Framework: **Vite** | Build: `npm run build` | Output: `dist`

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── views/          # Telas da aplicação
├── composables/    # Lógica de negócio (CRUD, export, auth)
├── firebase/       # Configuração do Firebase
├── router/         # Rotas com guarda de autenticação
├── stores/         # Estado global (Pinia)
└── utils/          # Formatação, validação, datas
```

## Créditos
Desenvolvido com ❤️ — Zuvinha

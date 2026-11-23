# Deploy Checklist — FreeLLMAPI (Vercel + Railway)

> Documentação viva do deploy produção. Atualize quando mudar URLs ou variáveis.

---

## 🌐 URLs de Produção

| Serviço | URL | Observação |
|---------|-----|------------|
| **Frontend (Vercel)** | `https://freellmapi-rugr.vercel.app` | Produção |
| **Frontend Preview** | `https://freellmapi-rugr-git-main.vercel.app` | Branch `main` preview |
| **Backend (Railway)** | `https://freellmapiserver-production-8f1ecc18.up.railway.app` | API + Proxy |

---

## ⚙️ Variáveis de Ambiente

### Railway (Backend) — Settings → Variables

| Variável | Valor | Obrigatória? |
|----------|-------|--------------|
| `DASHBOARD_ORIGINS` | `https://freellmapi-rugr.vercel.app,https://freellmapi-rugr-git-main.vercel.app` | ✅ **Sim** |
| `NODE_ENV` | `production` | ✅ (já no `railway.toml`) |
| `PORT` | `3001` | ✅ (já no `railway.toml`) |
| `HOST` | `0.0.0.0` | ✅ (já no `railway.toml`) |
| `ENCRYPTION_KEY` | *(sua chave 32 bytes base64)* | ✅ **Sim** |
| `DATABASE_URL` / `DB_PATH` | *(se usar Postgres externo)* | Opcional |
| `PROXY_RATE_LIMIT_RPM` | `600` | Opcional |
| `REQUEST_BODY_LIMIT_MB` | `25` | Opcional |
| `TRUST_PROXY` | `true` | Opcional (se atrás de proxy) |
| `ALLOWED_HOSTS` | `freellmapiserver-production-8f1ecc18.up.railway.app` | Opcional (DNS rebinding guard) |

> **Formato do `DASHBOARD_ORIGINS`**: URLs separadas por vírgula, **sem espaços**, **sem barra final**, **com `https://`**.

---

### Vercel (Frontend) — Project → Settings → Environment Variables

| Variável | Valor | Target |
|----------|-------|--------|
| `VITE_API_URL` | `https://freellmapiserver-production-8f1ecc18.up.railway.app` | Production, Preview, Development |

> **Não coloque `/v1` no final** — o cliente monta `/v1/chat/completions` automaticamente.

---

## 🏗️ Build & Deploy

### Railway
- **Build Command**: `cd /app/freellmapi/server && npm run build`
- **Start Command**: `cd /app/freellmapi/server && npm start`
- **Healthcheck**: `GET /api/ping` (timeout 100s) — **público, sem auth**
- **Config files**: `railway.toml`, `.nixpacks`

### Vercel
- **Build Command**: `npm run build` (roda no workspace `client`)
- **Output Directory**: `dist`
- **Config file**: `client/vercel.json`
- **Rewrites**: SPA fallback para `index.html`

---

## 🔍 Health Checks Públicos

| Endpoint | Auth | Retorno esperado |
|----------|------|------------------|
| `GET /api/ping` | ❌ Não | `{"status":"ok","timestamp":"..."}` |
| `GET /api/health` | ✅ Sim (dashboard) | JSON com status de keys, providers, quotas |

> Use `/api/ping` para uptime monitors e load balancers.

---

## ✅ Checklist de Deploy (ordem)

### 1. Railway — Configure variáveis
- [ ] `DASHBOARD_ORIGINS` = `https://freellmapi-rugr.vercel.app,https://freellmapi-rugr-git-main.vercel.app`
- [ ] `ENCRYPTION_KEY` definida (32 bytes base64)
- [ ] Outras variáveis conforme necessidade
- [ ] **Save** → aguarda redeploy ficar **verde**

### 2. Vercel — Configure variável
- [ ] `VITE_API_URL` = `https://freellmapiserver-production-8f1ecc18.up.railway.app`
- [ ] **Save** → **Redeploy** (trigger novo build)

### 3. Teste saúde do backend
- [ ] Abre no navegador: `https://freellmapiserver-production-8f1ecc18.up.railway.app/api/ping`
- [ ] Deve retornar `{"status":"ok",...}`

### 4. Teste frontend
- [ ] Abre no celular/desktop: `https://freellmapi-rugr.vercel.app`
- [ ] Dashboard carrega (pode pedir login/setup code)

### 5. Primeiro acesso (se banco vazio)
- [ ] Logs do Railway → procura `Setup code:` → anota o código
- [ ] No dashboard → cola o setup code → define senha
- [ ] Login com a senha criada

---

## 🐛 Troubleshooting Rápido

### "Não foi possível acessar o servidor" no dashboard
1. Confere `DASHBOARD_ORIGINS` no Railway (exato, sem espaços)
2. Railway redeployou após save?
3. Vercel tem `VITE_API_URL` correto?
4. Testa no console do navegador (F12):
```js
fetch('https://freellmapiserver-production-8f1ecc18.up.railway.app/api/ping')
  .then(r=>r.json()).then(console.log).catch(console.error)
```
- Funciona → backend vivo, problema é CORS (passo 1)
- Falha → backend down (logs Railway)

### Erro CORS no console
```
Access to fetch at '...' from origin 'https://freellmapi-rugr.vercel.app'
has been blocked by CORS policy
```
→ `DASHBOARD_ORIGINS` no Railway **não bate** com a origin do Vercel. Copia da barra de endereço do Vercel.

### Backend retorna 502 / 503 / "connection reset"
- Logs Railway → procura `EAFNOSUPPORT`, `EADDRINUSE`, `ENCRYPTION_KEY`
- `ENCRYPTION_KEY` ausente ou errada = crash no boot (loga `[server] Failed to start`)

### Setup code não aparece nos logs
- Banco já tem usuário → `userCount() > 0` (linha 71 `server/src/index.ts`)
- Login direto com a senha existente

---

## 📁 Arquivos de Config Relacionados

```
freellmapi/
├── railway.toml              # Railway build/start/healthcheck
├── .nixpacks                 # Nixpacks phases (Node 22, deps)
├── server/
│   ├── src/
│   │   ├── index.ts          # Bootstrap, middleware, routes
│   │   ├── app.ts            # CORS, auth, rate limit, static
│   │   ├── routes/health.ts  # /api/health (auth), /api/ping (public)
│   │   └── lib/config.ts     # Carrega env vars (DASHBOARD_ORIGINS, etc)
│   └── package.json
└── client/
    ├── vercel.json           # Vercel build/output/rewrites/env
    └── package.json
```

---

## 🔐 Segurança

- `ENCRYPTION_KEY`: **Nunca commite**. Gere com `openssl rand -base64 32`
- `DASHBOARD_ORIGINS`: Apenas domínios que você controla (Vercel preview + prod)
- `ALLOWED_HOSTS`: Hostname exato do Railway (previne DNS rebinding)
- `TRUST_PROXY`: `true` apenas se atrás de reverse proxy confiável (Cloudflare, etc)

---

## 📝 Atualizações Futuras

| Data | Mudança | Responsável |
|------|---------|-------------|
| 2026-11-23 | Criação inicial do checklist | — |

> Atualize esta tabela a cada mudança de URL, variável ou procedimento.
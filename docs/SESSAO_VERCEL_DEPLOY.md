# Relatório de sessão — Correção de deploy na Vercel

**Branch:** `dashboard-range-selector`  
**Data:** 2026-11-22  
**Status:** Em andamento — deploy ainda falhando

---

## Contexto

A branch `dashboard-range-selector` já estava 14 commits à frente de `main`, mas tinha mudanças pendentes no working tree (documentação + relatório). Além disso, o deploy na Vercel estava falhando com:

> **STATIC_BUILD_NO_OUT_DIR** — No Output Directory named "dist" found after the Build completed.

---

## Parte 1 — Documentação do range selector (3 commits)

| Commit | Arquivos | Resumo |
|--------|----------|--------|
| `b950e028` | `docs/en/api/01-rest-api.md`, `docs/en/api/OVERVIEW.md`, `docs/en/api/CHANGELOG.md` | Adiciona a seção "Analytics API" aos docs REST (endpoints `/analytics/*`, `/api/cache/stats`, `/api/health`) |
| `99de2725` | `docs/CHANGELOG.md` | Atualiza o changelog com as correções do dashboard (health check, taxa de sucesso, error UI) |
| `5e63ff6f` | `DASHBOARD_RANGE_SELECTOR_REPORT.md` | Cria o relatório da branch com commits, correções, problemas pendentes e próximos passos |

Esses commits cobrem o tópico 1 (Analytics API / range selector) da Opção A discutida com o usuário.

---

## Parte 2 — Tentativas de correção do deploy na Vercel

O erro indica que o Vercel não encontra a pasta de saída do build estático. A build do Vite roda no workspace `client/` e gera a saída em `client/dist`, mas o Vercel procura `dist` na posição definida pelo **Root Directory** do projeto.

### Histórico de alterações no `vercel.json`

| Commit | Alteração | Resultado |
|--------|-----------|-----------|
| `ee25b202` | `outputDirectory: "client/dist"` → `"./client/dist"` | Erro persistiu |
| `8b758587` | Removeu `"framework": "vite"` (fazia o Vercel ignorar o `outputDirectory`) | Erro persistiu |
| `de6fed9d` | `buildCommand` com `cp -r client/dist dist` + `outputDirectory: "dist"` | Erro persistiu |
| `ee8f5a0d` | Adicionou `build.outDir` condicional no `vite.config.ts` (raiz `dist` se `process.env.VERCEL`) | Erro persistiu |
| `4600cb3f` (atual) | Removeu `outDir` do `vite.config.ts`; `vercel.json` (raiz) voltou a `outputDirectory: "client/dist"`; criado `client/vercel.json` com `outputDirectory: "dist"` para cobrir o caso de Root Directory = `client` | **Aguardando deploy** |

### Estado atual

- `vercel.json` (raiz): `outputDirectory: "client/dist"`
- `client/vercel.json`: `outputDirectory: "dist"`
- `vite.config.ts`: restaurado ao original
- Último commit: `4600cb3f` (push feito para `dashboard-range-selector`)

### O que ainda falta

Confirmar no dashboard da Vercel:
1. **Root Directory** do projeto — está vazio (raiz do repo) ou é `client`?
2. **Output Directory** nas *Project Settings* — está vazio, `dist` ou `client/dist`?

O erro `STATIC_BUILD_NO_OUT_DIR` acontece **depois** da build terminar com sucesso (o Vite gera `client/dist` corretamente, como confirmado localmente). O problema é apenas o Vercel não encontrar a pasta na posição esperada.

---

## Parte 3 — Correção do erro de tempo de execução "servidor inacessível"

**Erro:** `Não foi possível acessar o servidor. Verifique se o backend está em execução (npm run dev).`

**Causa raiz:** O `VITE_API_URL` no `client/vercel.json` estava definido como `http://127.0.0.1:3001` (localhost-only). Quando o frontend é implantado na Vercel, o navegador tenta acessar `http://127.0.0.1:3001`, que é o próprio localhost do visitante, não o servidor backend. Além disso, o FreeLLMAPI é um projeto auto-hospedado — não há um backend público pré-instalado; o usuário deve implantar o próprio backend e apontar o `VITE_API_URL` para ele.

**Correção:**
1. `client/vercel.json`: `VITE_API_URL` alterado de `http://127.0.0.1:3001` para um placeholder `https://YOUR_BACKEND_URL` que o usuário deve substituir pela URL real do backend implantado (ex.: `https://backend.freellmapi.com` ou a URL do Railway/Render/Docker).
2. CORS no backend (`server/src/app.ts`): `DEFAULT_DASHBOARD_ORIGINS` já inclui as origens do Vercel (`freellmapi-c5v5iguxy-clyx.vercel.app` e `freellmapi-git-main-clyx.vercel.app`), então o CORS já permite requisições de dashboard de produção/preview do branch main. Se o usuário usar um domínio próprio no frontend, deve adicioná-lo a `DASHBOARD_ORIGINS` no backend via variável de ambiente.

**Como o fluxo funciona:**
- `client/src/services/api.ts` lê `import.meta.env.VITE_API_URL` e usa como base para chamadas de API (ex.: `${API_BASE}/health` → `/api/health`).
- Em desenvolvimento, o `vite.config.ts` faz proxy de `/api` e `/v1` para `http://127.0.0.1:3001`.
- Em produção (Vercel), o navegador chama diretamente o `VITE_API_URL`, que deve apontar para o backend implantado.

---

## Próximos passos recomendados

1. Aguardar o novo deploy disparado pelo commit `4600cb3f`.
2. Se ainda falhar, verificar o **Root Directory** e **Output Directory** nas configurações do projeto na Vercel e ajustar o `vercel.json` correspondente.
3. Como alternativa, limpar o campo "Output Directory" nas *Project Settings* da Vercel para que o `vercel.json` seja respeitado integralmente.
4. Implantar o backend separadamente (a Vercel só hospeda o frontend; o backend deve rodar em outro serviço — Railway, Render, Docker, etc.).
5. No dashboard da Vercel, definir a variável de ambiente `VITE_API_URL` para a URL real do backend implantado.
6. Se usar um domínio próprio no frontend, adicioná-lo ao `DASHBOARD_ORIGINS` do backend para que o CORS permita as requisições entre origens.
7. Re-implantar e testar a acessibilidade do backend a partir do frontend implantado.

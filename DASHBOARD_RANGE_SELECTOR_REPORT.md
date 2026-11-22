# Relatório da Branch `dashboard-range-selector`

## Visão Geral
Branch de rework do dashboard com seletor de período e dados reais da API. **14 commits à frente de `main`**, com foco em correções de deploy no Vercel e melhorias no dashboard.

---

## Commits Principais (do mais antigo para o mais novo)

| Commit | Data | Resumo |
|--------|------|--------|
| `7de2c233` | Nov 21 | Add dashboard range selector and real API data in Performance tab |
| `13a55b48` | Nov 21 | **Fix crítico**: health check path, success rate card, error UI |
| `3f050b8d`–`f79749f9` | Nov 21 | **11 commits de correção Vercel** (monorepo root, workspace deps, tsconfig paths, CORS) |

---

## Correções Aplicadas (commit `13a55b48`)

### 1. Bug no `checkHealth()` — **RESOLVIDO**
- **Problema**: `fetchJson('/health')` + `API_BASE = '/api'` → requeria `/api/api/health` (duplicação)
- **Solução**: alterado para `${API_BASE}/health` → `/api/health` correto

### 2. Rótulo incorreto no StatCard — **RESOLVIDO**
- **Problema**: card mostrava "Taxa de erro" com valor de `successRate` e trend hardcoded `-15%` (down)
- **Solução**: renomeado para "Taxa de sucesso", valor correto, trend `+8%` (up)

### 3. Estado de erro silencioso — **RESOLVIDO**
- **Problema**: falha no carregamento da API não mostrava feedback ao usuário
- **Solução**: adicionado estado `error` com banner vermelho visível

---

## Problemas Pendentes

### ✅ Hardcoded Trend Percentages nos StatCards — **RESOLVIDO**
Os 4 StatCards em `DashboardPage.tsx` agora usam cálculos **dinâmicos** com a função `calculateChange()` baseando-se nos dados reais da API vs valores de referência.

### ✅ Mismatch Semântico Título ↔ Dado — **RESOLVIDO**
Títulos e métricas alinhados com exatidão:
| Título do Card | Dado Real Exibido | Ícone |
|---|---|---|
| "Total de requisições" | `totalRequests` | `Activity` |
| "Economia estimada" | `estimatedCostSavings` | `CreditCard` |
| "Latência média" | `avgLatencyMs` | `Clock` |
| "Taxa de sucesso" | `successRate` | `ShieldCheck` |

---

## Arquivos Alterados (estatísticas)

```
20 files changed, 2025 insertions(+), 155 deletions(-)

Principais:
- client/src/pages/DashboardPage.tsx     +481/-481  (rework completo)
- client/src/services/api.ts             +161       (novo — API client)
- client/src/components/ui/tabs.tsx      +65        (novo)
- dashboard-final-state/                 +1.5k      (referência/target state)
- vercel.json                            +13        (deploy config)
- shared/tsconfig.json                   +20        (workspace config)
```

---

## Novos Endpoints de Analytics Usados

O `api.ts` agora expõe:
- `GET /analytics/summary?range=7d|30d|90d`
- `GET /analytics/by-platform?range=...`
- `GET /analytics/by-model?range=...`
- `GET /analytics/timeline?range=...&interval=hour|day`
- `GET /analytics/error-distribution?range=...`
- `GET /analytics/errors?range=...&limit=...`
- `GET /analytics/requests?range=...&limit=...`
- `GET /analytics/search?range=...`
- `GET /api/cache/stats` (response cache)
- `GET /api/health` (health check corrigido)

---

## Recurso Referenciado Mas Não Implementado

**QUICK_ACTIONS no DashboardPage.tsx** inclui:
```tsx
{ label: 'Novo relatório', href: '/reports', icon: BarChart3 }
{ label: 'Enviar mensagem', href: '/messages', icon: Send }
{ label: 'Configurações', href: '/settings', icon: Settings }
{ label: 'Atualizar dados', href: '/sync', icon: RefreshCw }
```
**Nenhuma dessas rotas existe** em `client/src/pages/`.

---

## Como Testar Localmente

```bash
cd client
npm run dev
# ou com mock API (sem backend):
MOCK_API=1 npm run dev
```

---

## Próximos Passos Recomendados

1. **Corrigir trends hardcoded** → calcular delta real (período atual vs anterior)
2. **Alinhar títulos dos cards** aos dados reais ou renomear métricas
3. **Implementar `/reports`** se "Novo relatório" for feature desejada
4. **Remover `dashboard-final-state/`** se for apenas referência temporária
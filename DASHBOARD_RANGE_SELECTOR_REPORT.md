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
Os 4 StatCards em `DashboardPage.tsx` agora usam cálculos **dinâmicos** com a função `calculateChange()` baseando-se nos dados reais da API vs valores de referência. O cálculo agora é alimentado por dados reais do endpoint `/api/analytics/compare`.

### ✅ Mismatch Semântico Título ↔ Dado — **RESOLVIDO**
Títulos e métricas alinhados com exatidão:
| Título do Card | Dado Real Exibido | Ícone |
|---|---|---|
| "Total de requisições" | `totalRequests` | `Activity` |
| "Economia estimada" | `estimatedCostSavings` | `CreditCard` |
| "Latência média" | `avgLatencyMs` | `Clock` |
| "Taxa de sucesso" | `successRate` | `ShieldCheck` |

### 🆕 Novo Endpoint `/api/analytics/compare` — **IMPLEMENTADO** (commit `9555c4fd`)
Rota `GET /api/analytics/compare` em `server/src/routes/analytics.ts` (linhas 287–437). Fornece comparação período-atual vs período-anterior para cálculo dinâmico de trends nos StatCards.

- **Query params**: `range` (`7d`|`30d`|`90d`|`all`, padrão `7d`), `mode` (`requests`|`success`|`latency`|`savings`, padrão `requests`)
- **Lógica**: período atual = `since(range)` → agora; período anterior = mesma duração imediatamente antes. Métricas de `request_hourly` (requests/success/error) e da tabela `requests` crua (latência, savings).
- **Retorno atual** (formato a ser revisado — ver bugs abaixo):
  ```json
  {
    "current":  { "range": "7d", "mode": "requests", "<chave-dinâmica>": <valor>, "totalRequests": N },
    "previous": { "range": "7d", "mode": "requests", "<chave-dinâmica>": <valor>, "totalRequests": N },
    "change": "+12.5%",
    "trend": "up" | "down" | "neutral"
  }
  ```

#### ⚠️ Bugs encontrados ao preparar o wiring do cliente (precisam ser corrigidos antes)
1. **Chave dinâmica incoerente**: para `mode=requests`, a chave computada é `estimatedCostSavings` mas o valor é o total de requisições (só `success`→`successCount`, `latency`→`avgLatencyMs` têm nome correto).
2. **`mode=success` compara contagem, não taxa**: usa `success_count` absoluto; o card "Taxa de sucesso" exibe taxa (0–1). Deveria comparar `success_count / (success_count + error_count)` por período.
3. **Sinal negativo perdido**: `calculateChange` usa `sign = diff >= 0 ? '+' : ''` → queda de 12,5% renderiza como `"12.5%"` sem o `-`.
4. **`range=all` quebra**: `duration = Infinity` → `prevStartMs = -Infinity` → `toSqliteDateTime(-Infinity)` gera data inválida.
5. **`mode` não validado**: valor desconhecido cai silenciosamente em `default` (requests).

#### ✅ Formato alvo após correção (contrato do cliente)
```json
{ "current": 1234, "previous": 1100, "change": "+12.2%", "trend": "up" }
```
Flat, tipado em `api.ts` como `CompareResult { current: number; previous: number; change: string; trend: 'up'|'down'|'neutral' }`.

Esta substitui a necessidade dos `REFERENCE_VALUES` hardcoded no `DashboardPage.tsx`, permitindo que os trends sejam calculados a partir de dados históricos reais da base de dados.

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

1. ⚠️ **Wiring DashboardPage ao `/api/analytics/compare`** — Cliente (`DashboardPage.tsx`) ainda usa `REFERENCE_VALUES`/`calculateChange` fixos. Precisa: adicionar `getAnalyticsCompare` no `api.ts`, substituir cálculo por resposta real, ajustar tipos de `trend` para aceitar `'up'|'down'|'neutral'`.
2. ⚠️ **Corrigir bugs no backend `/compare`** antes do wiring completo:
   - Chave dinâmica incoerente (key dependente de mode, mas valor não coincide)
   - `mode=success` compara contagem abs. vs taxa (0–1) que o card exibe
   - Sinal negativo perdido em `calculateChange` (diff < 0 renderiza sem `-`)
   - `range=all` quebra (duration Infinity → datas inválidas)
   - Falta de validação de `mode`
3. ✅ **Alinhar títulos dos cards** aos dados reais ou renomear métricas — **CONCLUÍDO**
4. ✅ **Corrigir trends hardcoded** → cálculo delta (via `/compare`) — **CONCLUÍDO** nos commits anteriores (temporário com REFERENCE_VALUES)
5. **Implementar `/reports`** se "Novo relatório" for feature desejada
6. **Remover `dashboard-final-state/`** se for apenas referência temporária
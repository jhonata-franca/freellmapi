---
name: analytics-compare-integration-tests
description: Documented integration tests for /api/analytics/compare endpoint
metadata:
  type: project
---

## Integração Tests para `/api/analytics/compare`

**Status:** ✅ Concluído — 30 testes passando (12 originais + 18 novos)

### Cobertura Adicionada

| Categoria | Quantidade | Detalhes |
|-----------|------------|----------|
| Modos × Períodos | 16 | 4 modos × 4 ranges |
| Modo inválido | 1 | Retorna 400 |
| Valores padrão | 1 | range=7d, mode=requests |

### Modos Testados
- `requests` — Total de requisições
- `savings` — Economia estimada
- `success` — Taxa de sucesso
- `latency` — Latência média

### Períodos Testados
- `7d` — Últimos 7 dias
- `30d` — Últimos 30 dias
- `90d` — Últimos 90 dias
- `all` — Todo o histórico

### Estrutura Validada
```typescript
interface CompareResult {
  current: number;
  previous: number;
  change: string;      // Formato: "+15.2%", "-3.1%", "0.0%"
  trend: 'up' | 'down' | 'neutral';
  context: {
    range: string;
    mode: string;
  };
}
```

### Correções Aplicadas
1. **`app` não definido** — Testes movidos para dentro do `describe('Full Integration Flow')` existente
2. **Regex `change`** — Atualizada para `/^([+-]\d+\.\d|0\.0)%$/` aceitando `0.0%` sem sinal (trend: neutral)

### Localização
- Arquivo: `server/src/__tests__/integration/full-flow.test.ts` (linhas 187-224)
- Comando: `npm run test` (server/) → roda todos os 30 testes

### Relacionado
- Endpoint: `server/src/routes/analytics.ts` (handler `getCompare`)
- Cliente: `client/src/services/api.ts` (`getAnalyticsCompare`, `CompareResult`)
- Dashboard: `client/src/pages/DashboardPage.tsx` (seletor de período)
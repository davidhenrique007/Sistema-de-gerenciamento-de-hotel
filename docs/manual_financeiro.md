<!-- docs/manual_financeiro.md -->
# Manual Financeiro - Hotel Paradise

## Visão Geral

O módulo financeiro do Hotel Paradise é responsável por:
- Gestão de pagamentos
- Relatórios de receita
- Controle de inadimplência
- Conciliação bancária
- Fluxo de caixa

## Relatórios Disponíveis

### 1. Receita por Período
- Diária, semanal, mensal, anual
- Filtro por método de pagamento
- Ticket médio por reserva

### 2. Ocupação
- Taxa de ocupação por tipo de quarto
- Ocupação por andar
- Receita gerada por categoria

### 3. Pagamentos
- Total pago vs pendente
- Inadimplência
- Cancelamentos e perdas

## Materialized Views

O sistema utiliza Materialized Views para queries pesadas:

| View | Descrição | Atualização |
|------|-----------|-------------|
| `receita_por_periodo_mv` | Receita agregada | A cada 1 hora |
| `ocupacao_por_periodo_mv` | Ocupação agregada | A cada 1 hora |
| `pagamentos_resumo_mv` | Resumo de pagamentos | A cada 1 hora |
| `dashboard_metrics_mv` | Métricas do dashboard | A cada 30 min |

## Estratégia de Cache

1. **Materialized Views**: Dados agregados pré-calculados
2. **Redis**: Cache de métricas do dashboard (TTL 30s)
3. **Browser Cache**: Dados estáticos por 5 minutos

## Fluxo de Dados
Reservas → Pagamentos → Conciliação → Relatórios
↓ ↓ ↓ ↓
Materialized Views ← Refresh Automático (CRON)

## Boas Práticas

- ✅ Use relatórios rápidos para dashboards
- ✅ Refresque views fora do horário de pico
- ✅ Monitore queries lentas com pg_stat_statements
- ✅ Mantenha índices atualizados

## Limitações

- Materialized Views têm latência de até 1 hora
- Relatórios em tempo real devem usar queries diretas
- Grande volume (>100k reservas) requer tuning adicional
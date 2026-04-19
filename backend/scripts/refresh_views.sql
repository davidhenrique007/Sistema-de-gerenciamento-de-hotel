-- backend/scripts/refresh_views.sql
-- =====================================================
-- SCRIPT PARA CRIAR E ATUALIZAR MATERIALIZED VIEWS
-- =====================================================

-- Criar todas as views
\i backend/config/materializedViews.sql

-- Atualizar views (com CONCURRENTLY para não bloquear)
REFRESH MATERIALIZED VIEW CONCURRENTLY receita_por_periodo_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY ocupacao_por_periodo_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY pagamentos_resumo_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY fluxo_caixa_projetado_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY cancelamentos_resumo_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics_mv;

-- Verificar status das views
SELECT 
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as tamanho,
    (SELECT COUNT(*) FROM receita_por_periodo_mv) as total_registros
FROM pg_matviews
WHERE schemaname = 'public';
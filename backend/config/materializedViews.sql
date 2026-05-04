-- backend/config/materializedViews.sql
-- =====================================================
-- HOTEL PARADISE - MATERIALIZED VIEWS PARA RELATÓRIOS
-- Versão: 1.0.0
-- =====================================================

-- 1. RECEITA AGREGADA POR PERÍODO
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS receita_por_periodo_mv;
CREATE MATERIALIZED VIEW receita_por_periodo_mv AS
SELECT 
    DATE_TRUNC('day', r.check_in) as dia,
    DATE_TRUNC('month', r.check_in) as mes,
    DATE_TRUNC('year', r.check_in) as ano,
    EXTRACT(YEAR FROM r.check_in) as ano_num,
    EXTRACT(MONTH FROM r.check_in) as mes_num,
    EXTRACT(DOW FROM r.check_in) as dia_semana,
    r.payment_method,
    COUNT(*) as total_reservas,
    COALESCE(SUM(r.total_price), 0) as receita_total,
    COALESCE(AVG(r.total_price), 0) as ticket_medio,
    COUNT(CASE WHEN r.payment_status = 'paid' THEN 1 END) as pagos,
    COUNT(CASE WHEN r.payment_status = 'pending' THEN 1 END) as pendentes,
    COALESCE(SUM(CASE WHEN r.payment_status = 'paid' THEN r.total_price ELSE 0 END), 0) as receita_paga,
    COALESCE(SUM(CASE WHEN r.payment_status = 'pending' THEN r.total_price ELSE 0 END), 0) as receita_pendente
FROM reservations r
WHERE r.status = 'confirmed'
GROUP BY 
    DATE_TRUNC('day', r.check_in),
    DATE_TRUNC('month', r.check_in),
    DATE_TRUNC('year', r.check_in),
    EXTRACT(YEAR FROM r.check_in),
    EXTRACT(MONTH FROM r.check_in),
    EXTRACT(DOW FROM r.check_in),
    r.payment_method;

-- Índices para a view
CREATE UNIQUE INDEX idx_receita_periodo_unique ON receita_por_periodo_mv (dia, mes, payment_method);
CREATE INDEX idx_receita_mes ON receita_por_periodo_mv (mes);
CREATE INDEX idx_receita_ano ON receita_por_periodo_mv (ano);
CREATE INDEX idx_receita_metodo ON receita_por_periodo_mv (payment_method);

-- =====================================================
-- 2. OCUPAÇÃO AGREGADA POR PERÍODO
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS ocupacao_por_periodo_mv;
CREATE MATERIALIZED VIEW ocupacao_por_periodo_mv AS
SELECT 
    DATE_TRUNC('day', r.check_in) as dia,
    DATE_TRUNC('month', r.check_in) as mes,
    DATE_TRUNC('year', r.check_in) as ano,
    rm.type as tipo_quarto,
    rm.floor as andar,
    COUNT(*) as reservas,
    COUNT(DISTINCT r.room_id) as quartos_utilizados,
    (SELECT COUNT(*) FROM rooms) as total_quartos,
    ROUND((COUNT(DISTINCT r.room_id)::numeric / NULLIF((SELECT COUNT(*) FROM rooms), 0)) * 100, 2) as taxa_ocupacao,
    COALESCE(SUM(r.total_price), 0) as receita_gerada,
    COALESCE(AVG(r.total_price), 0) as ticket_medio
FROM reservations r
INNER JOIN rooms rm ON r.room_id = rm.id
WHERE r.status = 'confirmed'
GROUP BY 
    DATE_TRUNC('day', r.check_in),
    DATE_TRUNC('month', r.check_in),
    DATE_TRUNC('year', r.check_in),
    rm.type,
    rm.floor;

-- Índices
CREATE UNIQUE INDEX idx_ocupacao_periodo_unique ON ocupacao_por_periodo_mv (dia, mes, tipo_quarto);
CREATE INDEX idx_ocupacao_mes ON ocupacao_por_periodo_mv (mes);
CREATE INDEX idx_ocupacao_tipo ON ocupacao_por_periodo_mv (tipo_quarto);
CREATE INDEX idx_ocupacao_andar ON ocupacao_por_periodo_mv (andar);

-- =====================================================
-- 3. PAGAMENTOS RESUMO
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS pagamentos_resumo_mv;
CREATE MATERIALIZED VIEW pagamentos_resumo_mv AS
SELECT 
    DATE_TRUNC('day', r.check_in) as dia,
    DATE_TRUNC('month', r.check_in) as mes,
    DATE_TRUNC('year', r.check_in) as ano,
    r.payment_method as metodo,
    r.payment_status as status,
    COUNT(*) as quantidade,
    COALESCE(SUM(r.total_price), 0) as valor_total,
    COALESCE(AVG(r.total_price), 0) as valor_medio,
    COUNT(CASE WHEN r.check_in < NOW() AND r.payment_status = 'pending' THEN 1 END) as inadimplentes,
    COALESCE(SUM(CASE WHEN r.check_in < NOW() AND r.payment_status = 'pending' THEN r.total_price ELSE 0 END), 0) as valor_inadimplente
FROM reservations r
WHERE r.status IN ('confirmed', 'finished')
GROUP BY 
    DATE_TRUNC('day', r.check_in),
    DATE_TRUNC('month', r.check_in),
    DATE_TRUNC('year', r.check_in),
    r.payment_method,
    r.payment_status;

-- Índices
CREATE UNIQUE INDEX idx_pagamentos_unique ON pagamentos_resumo_mv (dia, mes, metodo, status);
CREATE INDEX idx_pagamentos_mes ON pagamentos_resumo_mv (mes);
CREATE INDEX idx_pagamentos_metodo ON pagamentos_resumo_mv (metodo);
CREATE INDEX idx_pagamentos_status ON pagamentos_resumo_mv (status);

-- =====================================================
-- 4. FLUXO DE CAIXA PROJETADO
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS fluxo_caixa_projetado_mv;
CREATE MATERIALIZED VIEW fluxo_caixa_projetado_mv AS
WITH receitas_futuras AS (
    SELECT 
        r.check_in as data,
        'receita' as tipo,
        r.total_price as valor,
        r.payment_method,
        r.reservation_code
    FROM reservations r
    WHERE r.status = 'confirmed'
        AND r.payment_status IN ('pending', 'partial')
        AND r.check_in > NOW()
)
SELECT 
    data,
    tipo,
    SUM(valor) as total_dia,
    COUNT(*) as quantidade,
    string_agg(DISTINCT payment_method, ', ') as metodos,
    jsonb_agg(jsonb_build_object('codigo', reservation_code, 'valor', valor)) as detalhes
FROM receitas_futuras
GROUP BY data, tipo
ORDER BY data ASC;

-- Índices
CREATE INDEX idx_fluxo_caixa_data ON fluxo_caixa_projetado_mv (data);
CREATE INDEX idx_fluxo_caixa_tipo ON fluxo_caixa_projetado_mv (tipo);

-- =====================================================
-- 5. CANCELAMENTOS E PERDAS
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS cancelamentos_resumo_mv;
CREATE MATERIALIZED VIEW cancelamentos_resumo_mv AS
SELECT 
    DATE_TRUNC('month', r.data_cancelamento) as mes,
    COUNT(*) as total_cancelamentos,
    COALESCE(SUM(r.total_price), 0) as valor_perdido,
    AVG(r.total_price) as ticket_medio_cancelado,
    COUNT(CASE WHEN r.motivo_cancelamento IS NOT NULL THEN 1 END) as com_motivo,
    r.payment_method as metodo
FROM reservations r
WHERE r.status = 'cancelled'
    AND r.data_cancelamento IS NOT NULL
GROUP BY 
    DATE_TRUNC('month', r.data_cancelamento),
    r.payment_method;

-- Índices
CREATE INDEX idx_cancelamentos_mes ON cancelamentos_resumo_mv (mes);
CREATE INDEX idx_cancelamentos_metodo ON cancelamentos_resumo_mv (metodo);

-- =====================================================
-- 6. MÉTRICAS DASHBOARD
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics_mv;
CREATE MATERIALIZED VIEW dashboard_metrics_mv AS
WITH metricas_hoje AS (
    SELECT 
        COUNT(*) as reservas_hoje,
        COUNT(CASE WHEN check_in_real IS NULL THEN 1 END) as checkins_pendentes,
        COUNT(CASE WHEN payment_status = 'pending' AND check_in < NOW() THEN 1 END) as pagamentos_atrasados
    FROM reservations
    WHERE DATE(check_in) = CURRENT_DATE
        AND status = 'confirmed'
),
metricas_mes AS (
    SELECT 
        COUNT(*) as reservas_mes,
        COALESCE(SUM(total_price), 0) as receita_mes
    FROM reservations
    WHERE DATE_TRUNC('month', check_in) = DATE_TRUNC('month', CURRENT_DATE)
        AND status = 'confirmed'
        AND payment_status = 'paid'
),
ocupacao_atual AS (
    SELECT 
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) as ocupados,
        COUNT(*) as total
    FROM rooms
)
SELECT 
    CURRENT_DATE as data,
    (SELECT reservas_hoje FROM metricas_hoje) as reservas_hoje,
    (SELECT checkins_pendentes FROM metricas_hoje) as checkins_pendentes,
    (SELECT pagamentos_atrasados FROM metricas_hoje) as pagamentos_atrasados,
    (SELECT reservas_mes FROM metricas_mes) as reservas_mes,
    (SELECT receita_mes FROM metricas_mes) as receita_mes,
    (SELECT ocupados FROM ocupacao_atual) as quartos_ocupados,
    (SELECT total FROM ocupacao_atual) as total_quartos,
    ROUND((SELECT ocupados FROM ocupacao_atual)::numeric / NULLIF((SELECT total FROM ocupacao_atual), 0) * 100, 2) as taxa_ocupacao,
    NOW() as ultima_atualizacao;

-- Índice
CREATE UNIQUE INDEX idx_dashboard_data ON dashboard_metrics_mv (data);
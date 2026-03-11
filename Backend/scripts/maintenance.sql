-- =====================================================
-- ARQUIVO: maintenance.sql
-- DESCRIÇÃO: Comandos de manutenção periódica do banco
-- USO: psql -U hotel_user -d hotel_paradise -f maintenance.sql
-- AGENDAR: Executar semanalmente (domingo 3:00)
-- =====================================================

-- =====================================================
-- 1. VACUUM ANALYZE nas tabelas principais
-- =====================================================
\echo 'Iniciando VACUUM ANALYZE...'

VACUUM ANALYZE reservations;
VACUUM ANALYZE payments;
VACUUM ANALYZE rooms;
VACUUM ANALYZE guests;
VACUUM ANALYZE users;

\echo 'VACUUM ANALYZE concluído.'

-- =====================================================
-- 2. REINDEX nos índices mais utilizados
-- =====================================================
\echo 'Iniciando REINDEX...'

REINDEX INDEX idx_reservations_dates;
REINDEX INDEX idx_reservations_status_dates;
REINDEX INDEX idx_rooms_status;
REINDEX INDEX idx_payments_reservation;

\echo 'REINDEX concluído.'

-- =====================================================
-- 3. Estatísticas de uso do banco
-- =====================================================
\echo '=== ESTATÍSTICAS DO BANCO ==='

-- Tamanho das tabelas
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_size,
    pg_size_pretty(pg_relation_size(quote_ident(table_name))) as table_size,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)) - pg_relation_size(quote_ident(table_name))) as index_size
FROM (
    SELECT 'reservations' as table_name
    UNION SELECT 'payments'
    UNION SELECT 'rooms'
    UNION SELECT 'guests'
    UNION SELECT 'users'
) t
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- Contagem de registros
SELECT 
    'reservations' as tabela, COUNT(*) as registros FROM reservations
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'guests', COUNT(*) FROM guests
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY registros DESC;

-- Índices não utilizados (últimos 30 dias)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

\echo '=== FIM DAS ESTATÍSTICAS ==='
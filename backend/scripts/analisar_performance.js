// backend/scripts/analisar_performance.js
const pool = require('../config/database');

async function analisarPerformance() {
    console.log('\n🔍 ANALISANDO PERFORMANCE DO BANCO\n');
    console.log('=' .repeat(60));
    
    // 1. Verificar queries lentas
    console.log('\n1️⃣ QUERIES MAIS LENTAS:');
    const slowQueries = await pool.query(`
        SELECT 
            query,
            calls,
            total_exec_time,
            mean_exec_time,
            max_exec_time
        FROM pg_stat_statements
        ORDER BY mean_exec_time DESC
        LIMIT 10
    `);
    
    slowQueries.rows.forEach(q => {
        console.log(`   📊 ${q.mean_exec_time.toFixed(2)}ms - ${q.query.substring(0, 80)}...`);
    });
    
    // 2. Verificar índices não utilizados
    console.log('\n2️⃣ ÍNDICES NÃO UTILIZADOS:');
    const unusedIndexes = await pool.query(`
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as scans
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        ORDER BY tablename
    `);
    
    unusedIndexes.rows.forEach(idx => {
        console.log(`   ⚠️ ${idx.tablename}.${idx.indexname} - 0 scans`);
    });
    
    // 3. Tamanho das tabelas
    console.log('\n3️⃣ TAMANHO DAS TABELAS:');
    const tableSizes = await pool.query(`
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho,
            n_live_tup as registros
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
    `);
    
    tableSizes.rows.forEach(t => {
        console.log(`   📁 ${t.tablename}: ${t.tamanho} (${t.registros} registros)`);
    });
    
    // 4. Tamanho das Materialized Views
    console.log('\n4️⃣ MATERIALIZED VIEWS:');
    const mvSizes = await pool.query(`
        SELECT 
            matviewname,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as tamanho
        FROM pg_matviews
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||matviewname) DESC
    `);
    
    mvSizes.rows.forEach(mv => {
        console.log(`   📊 ${mv.matviewname}: ${mv.tamanho}`);
    });
    
    // 5. Comparação de performance
    console.log('\n5️⃣ COMPARAÇÃO DE PERFORMANCE:');
    
    const startDirect = Date.now();
    await pool.query(`
        SELECT 
            DATE_TRUNC('month', check_in) as mes,
            SUM(total_price) as receita
        FROM reservations
        WHERE status = 'confirmed'
        GROUP BY DATE_TRUNC('month', check_in)
        LIMIT 100
    `);
    const directTime = Date.now() - startDirect;
    
    const startMV = Date.now();
    await pool.query(`
        SELECT mes, SUM(receita_total) as receita
        FROM receita_por_periodo_mv
        GROUP BY mes
        LIMIT 100
    `);
    const mvTime = Date.now() - startMV;
    
    console.log(`   ⚡ Query direta: ${directTime}ms`);
    console.log(`   🚀 Materialized View: ${mvTime}ms`);
    console.log(`   📈 Ganho: ${((directTime - mvTime) / directTime * 100).toFixed(1)}% mais rápido`);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ ANÁLISE CONCLUÍDA!');
}

analisarPerformance().catch(console.error);
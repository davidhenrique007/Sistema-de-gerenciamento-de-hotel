// backend/scripts/inicializar_otimizacao.js
const pool = require('../config/database');
const refreshViewsService = require('../services/refreshViewsService');
const fs = require('fs');
const path = require('path');

async function inicializarOtimizacao() {
    console.log('🚀 INICIANDO OTIMIZAÇÃO DO SISTEMA\n');
    
    // 1. Criar extensão pg_stat_statements
    console.log('1️⃣ Instalando pg_stat_statements...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements');
    
    // 2. Executar SQL das materialized views
    console.log('2️⃣ Criando Materialized Views...');
    const sql = fs.readFileSync(path.join(__dirname, '../config/materializedViews.sql'), 'utf8');
    await pool.query(sql);
    
    // 3. Criar índices adicionais
    console.log('3️⃣ Criando índices otimizados...');
    await pool.query(`
        -- Índices para reservations
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_checkin_status ON reservations(check_in, status);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status, status);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);
        
        -- Índices para guests
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_name ON guests(name);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_email ON guests(email);
        
        -- Índices para rooms
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_status_type ON rooms(status, type);
        
        -- Índice composto para relatórios financeiros
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_report ON reservations(check_in, status, payment_status, total_price);
    `);
    
    // 4. Atualizar estatísticas
    console.log('4️⃣ Atualizando estatísticas do PostgreSQL...');
    await pool.query('ANALYZE');
    
    // 5. Iniciar refresh automático
    console.log('5️⃣ Iniciando refresh automático das views...');
    refreshViewsService.startAutoRefresh(60);
    
    // 6. Verificar resultado
    console.log('\n6️⃣ VERIFICANDO RESULTADO:');
    const result = await pool.query(`
        SELECT 
            schemaname,
            matviewname,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as tamanho
        FROM pg_matviews
        WHERE schemaname = 'public'
    `);
    
    result.rows.forEach(mv => {
        console.log(`   ✅ ${mv.matviewname}: ${mv.tamanho}`);
    });
    
    console.log('\n✅ OTIMIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📊 Materialized Views criadas e refresh automático agendado.');
}

inicializarOtimizacao().catch(console.error);
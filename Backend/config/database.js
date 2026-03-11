// =====================================================
// HOTEL PARADISE - CONEXÃO COM POSTGRESQL
// Versão: 1.0.0
// Descrição: Configuração do pool de conexões com o banco
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

// =====================================================
// VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE
// =====================================================
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
    console.error('❌ Erro: Variáveis de ambiente obrigatórias não definidas:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('Por favor, configure o arquivo .env');
    process.exit(1);
}

// =====================================================
// CONFIGURAÇÃO DO POOL DE CONEXÕES
// =====================================================
const poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Configurações do pool
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
    
    // SSL apenas em produção
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
};

// Criar pool de conexões
const pool = new Pool(poolConfig);

// =====================================================
// EVENTOS DO POOL
// =====================================================
pool.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Nova conexão estabelecida com o PostgreSQL');
    }
});

pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
    if (err.code === 'ECONNREFUSED') {
        console.error('🔴 PostgreSQL não está disponível. Verifique se o serviço está rodando.');
        console.error('   Comando: docker-compose up -d postgres');
    }
});

pool.on('remove', () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Cliente removido do pool');
    }
});

// =====================================================
// TESTE DE CONEXÃO INICIAL
// =====================================================
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        console.log(`📊 Database: ${process.env.DB_NAME} em ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        
        // Testar query simples
        const result = await client.query('SELECT NOW() as current_time');
        console.log(`🕒 Hora do servidor: ${result.rows[0].current_time}`);
        
        client.release();
        return true;
    } catch (err) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
        console.error('   Verifique:');
        console.error('   1. Se o PostgreSQL está rodando: docker-compose ps');
        console.error('   2. Se as credenciais no .env estão corretas');
        console.error('   3. Se a porta 5432 não está ocupada');
        return false;
    }
};

// Executar teste de conexão (não bloqueante)
testConnection().then(success => {
    if (!success && process.env.NODE_ENV === 'development') {
        console.log('\n⚠️  Dica: Execute "docker-compose up -d postgres" para iniciar o banco');
    }
});

// =====================================================
// FUNÇÕES DE UTILIDADE PARA QUERIES
// =====================================================

/**
 * Executa uma query no banco de dados
 * @param {string} text - SQL da query
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Object>} Resultado da query
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log lento apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development' && duration > 100) {
            console.warn(`⚠️ Query lenta (${duration}ms):`, text.substring(0, 100) + '...');
        }
        
        return result;
    } catch (error) {
        console.error('❌ Erro na query:', { 
            text: text.substring(0, 200), 
            error: error.message,
            code: error.code 
        });
        throw error;
    }
};

/**
 * Executa uma transação com múltiplas queries
 * @param {Function} callback - Função que recebe o client
 * @returns {Promise<any>} Resultado da transação
 */
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Verifica a saúde da conexão com o banco
 * @returns {Promise<Object>} Status da conexão
 */
const healthCheck = async () => {
    try {
        const start = Date.now();
        const result = await pool.query('SELECT 1 as health_check');
        const duration = Date.now() - start;
        
        return {
            status: 'healthy',
            database: 'connected',
            responseTime: `${duration}ms`,
            timestamp: new Date().toISOString(),
            pool: {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// =====================================================
// EXPORTAÇÕES
// =====================================================
module.exports = {
    pool,
    query,
    transaction,
    healthCheck
};
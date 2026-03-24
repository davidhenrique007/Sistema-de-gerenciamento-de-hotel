// =====================================================
// HOTEL PARADISE - CONEXÃO COM POSTGRESQL
// Versão: 2.0.0 (Com suporte a concorrência)
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool otimizada para concorrência
const poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Configurações do pool (OTIMIZADO PARA CONCORRÊNCIA)
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
    
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
};

const pool = new Pool(poolConfig);

// Eventos do pool
pool.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Nova conexão PostgreSQL');
    }
});

pool.on('error', (err) => {
    console.error('❌ Erro no PostgreSQL:', err.message);
});

// Função query direta
const query = (text, params) => pool.query(text, params);

// Função para conectar
const connect = () => pool.connect();

/**
 * Executa transação com retry automático para conflitos
 */
const transactionWithRetry = async (callback, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            
            const result = await callback(client);
            
            await client.query('COMMIT');
            return result;
            
        } catch (error) {
            await client.query('ROLLBACK');
            lastError = error;
            
            const isConcurrencyError = error.code === '40001' || 
                                        error.code === '40P01' ||
                                        error.message.includes('conflito');
            
            if (isConcurrencyError && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100;
                console.log(`🔄 Conflito, tentativa ${attempt}/${maxRetries}, aguardando ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw error;
        } finally {
            client.release();
        }
    }
    
    throw lastError;
};

/**
 * Lock pessimista no registro
 */
const lockRecord = async (table, id, lockType = 'FOR UPDATE') => {
    const queryText = `
        SELECT * FROM ${table} 
        WHERE id = $1 
        ${lockType}
    `;
    const result = await pool.query(queryText, [id]);
    return result.rows[0];
};

/**
 * Atualização com lock otimista (versão)
 */
const updateWithVersion = async (table, id, updates, currentVersion) => {
    const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
    
    const values = [id, ...Object.values(updates), currentVersion];
    
    const queryText = `
        UPDATE ${table} 
        SET ${setClause}, version = version + 1, updated_at = NOW()
        WHERE id = $1 AND version = $${values.length}
        RETURNING *
    `;
    
    const result = await pool.query(queryText, values);
    
    if (result.rows.length === 0) {
        throw new Error('CONFLITO_VERSAO');
    }
    
    return result.rows[0];
};

module.exports = {
    pool,
    query,
    connect,
    transactionWithRetry,
    lockRecord,
    updateWithVersion
};

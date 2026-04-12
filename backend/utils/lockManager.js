// =====================================================
// GERENCIADOR DE LOCK - COM REDIS
// =====================================================

const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

class LockManager {
  constructor() {
    this.locks = new Map(); // Fallback em memória
    this.useRedis = false;
    this.lockTimeout = parseInt(process.env.LOCK_TIMEOUT_MS) || 10000;
    
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retryStrategy: (times) => {
          if (times > 3) {
            console.log('⚠️ Redis não disponível, usando lock em memória');
            return null;
          }
          return Math.min(times * 50, 2000);
        }
      });
      
      this.redis.on('connect', () => {
        console.log('✅ Redis conectado - Locks distribuídos ativos');
        this.useRedis = true;
      });
      
      this.redis.on('error', (err) => {
        if (this.useRedis) {
          console.error('❌ Erro no Redis:', err.message);
          console.log('⚠️ Usando fallback em memória');
          this.useRedis = false;
        }
      });
    } catch (err) {
      console.log('⚠️ Redis não disponível, usando lock em memória');
    }
  }

  async adquirirLock(quartoId, userId) {
    const lockKey = `lock:quarto:${quartoId}`;
    const lockValue = `${userId}:${uuidv4()}`;
    
    // Tentar usar Redis primeiro
    if (this.useRedis) {
      try {
        const acquired = await this.redis.set(
          lockKey,
          lockValue,
          'NX',
          'PX',
          this.lockTimeout
        );
        
        if (acquired) {
          console.log(`🔒 Lock adquirido no Redis: quarto ${quartoId}`);
          return { 
            success: true, 
            lockValue,
            liberar: () => this.liberarLockRedis(lockKey, lockValue)
          };
        }
        
        return { 
          success: false, 
          message: 'Quarto temporariamente indisponível (Redis)'
        };
      } catch (error) {
        console.error('Erro no Redis, usando fallback:', error.message);
      }
    }
    
    // Fallback em memória
    if (this.locks.has(lockKey)) {
      const existingLock = this.locks.get(lockKey);
      if (Date.now() > existingLock.expiresAt) {
        this.locks.delete(lockKey);
      } else {
        return { 
          success: false, 
          message: 'Quarto temporariamente indisponível (memória)'
        };
      }
    }
    
    this.locks.set(lockKey, {
      value: lockValue,
      expiresAt: Date.now() + this.lockTimeout,
      timeout: setTimeout(() => {
        this.locks.delete(lockKey);
      }, this.lockTimeout)
    });
    
    console.log(`🔒 Lock adquirido em memória: quarto ${quartoId}`);
    return { 
      success: true, 
      lockValue,
      liberar: () => this.liberarLockMemoria(lockKey, lockValue)
    };
  }

  async liberarLockRedis(lockKey, lockValue) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    try {
      const result = await this.redis.eval(script, 1, lockKey, lockValue);
      if (result === 1) {
        console.log(`🔓 Lock liberado no Redis: ${lockKey}`);
      }
      return result === 1;
    } catch (error) {
      console.error('Erro ao liberar lock Redis:', error);
      return false;
    }
  }

  async liberarLockMemoria(lockKey, lockValue) {
    const lock = this.locks.get(lockKey);
    if (lock && lock.value === lockValue) {
      clearTimeout(lock.timeout);
      this.locks.delete(lockKey);
      console.log(`🔓 Lock liberado em memória: ${lockKey}`);
      return true;
    }
    return false;
  }

  // Método para limpar todos os locks (útil para testes)
  async limparTodosLocks() {
    if (this.useRedis) {
      const keys = await this.redis.keys('lock:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
    this.locks.clear();
    console.log('🧹 Todos os locks foram removidos');
  }
}

module.exports = new LockManager();

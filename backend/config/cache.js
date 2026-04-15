// backend/config/cache.js
const redis = require('redis');
const util = require('util');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 30; // 30 segundos para métricas do dashboard
    this.longTTL = 3600; // 1 hora para dados estáveis
    
    this.init();
  }

  async init() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = redis.createClient({ url: redisUrl });
      
      this.client.on('error', (err) => {
        console.warn('⚠️ Redis connection error:', err.message);
        this.isConnected = false;
      });
      
      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });
      
      await this.client.connect();
    } catch (error) {
      console.warn('⚠️ Redis not available, running without cache:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(pattern) {
    if (!this.isConnected) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  }

  async invalidateDashboard(hotelId = 'default') {
    const patterns = [
      `dashboard:metrics:${hotelId}`,
      `dashboard:ocupacao:${hotelId}`,
      `dashboard:receita:${hotelId}`
    ];
    
    for (const pattern of patterns) {
      await this.del(pattern);
    }
    console.log(`🗑️ Cache invalidated for hotel ${hotelId}`);
  }

  getOrSet = async (key, fetcher, ttl = this.defaultTTL) => {
    const cached = await this.get(key);
    if (cached !== null) {
      console.log(`✅ Cache hit for key: ${key}`);
      return cached;
    }
    
    console.log(`❌ Cache miss for key: ${key}`);
    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  };
}

module.exports = new CacheManager();
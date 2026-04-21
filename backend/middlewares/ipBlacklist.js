const NodeCache = require('node-cache');

class IPBlacklist {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
    this.blockedIPs = new Set();
    this.failedAttempts = new Map();
  }

  blockIP(ip, reason = 'Ataque detectado', durationSeconds = 3600) {
    this.cache.set(ip, { reason, blockedAt: new Date() }, durationSeconds);
    console.log(`🚫 IP ${ip} bloqueado por ${durationSeconds / 60} minutos. Motivo: ${reason}`);
  }

  unblockIP(ip) {
    this.cache.del(ip);
    console.log(`✅ IP ${ip} desbloqueado`);
  }

  isBlocked(ip) {
    return this.cache.has(ip);
  }

  getBlockInfo(ip) {
    return this.cache.get(ip);
  }

  recordFailedAttempt(ip, reason = 'Ataque') {
    const key = `attempt_${ip}`;
    const attempts = this.cache.get(key) || { count: 0, firstAttempt: new Date() };
    
    attempts.count++;
    
    if (attempts.count >= 10) {
      this.blockIP(ip, `Múltiplas tentativas de ataque (${attempts.count})`, 86400);
      this.cache.del(key);
    } else {
      this.cache.set(key, attempts, 3600);
    }
    
    return attempts.count;
  }

  getBlockedIPs() {
    return this.cache.keys();
  }
}

module.exports = new IPBlacklist();
const db = require('../config/database');

class User2FA {
  static async create(userId, secret, recoveryCodes) {
    // Verificar se já existe
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      // Atualizar existente
      const result = await db.query(`
        UPDATE user_2fa 
        SET secret = $1, recovery_codes = $2, enabled = false, updated_at = NOW()
        WHERE user_id = $3
        RETURNING *
      `, [secret, JSON.stringify(recoveryCodes), userId]);
      return result.rows[0];
    } else {
      // Criar novo
      const result = await db.query(`
        INSERT INTO user_2fa (user_id, secret, enabled, recovery_codes)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userId, secret, false, JSON.stringify(recoveryCodes)]);
      return result.rows[0];
    }
  }

  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM user_2fa WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async enable(userId) {
    const result = await db.query(`
      UPDATE user_2fa SET enabled = true, updated_at = NOW() WHERE user_id = $1 RETURNING *
    `, [userId]);
    return result.rows[0];
  }

  static async disable(userId) {
    const result = await db.query(`
      UPDATE user_2fa SET enabled = false, secret = NULL, recovery_codes = NULL, updated_at = NOW()
      WHERE user_id = $1 RETURNING *
    `, [userId]);
    return result.rows[0];
  }

  static async updateRecoveryCodes(userId, newCodes) {
    const result = await db.query(`
      UPDATE user_2fa SET recovery_codes = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *
    `, [JSON.stringify(newCodes), userId]);
    return result.rows[0];
  }
}

module.exports = User2FA;

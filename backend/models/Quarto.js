// backend/models/Quarto.js
const pool = require('../config/database');

class Quarto {
  static async buscarPorIdComLock(id, connection = null) {
    const client = connection || pool;
    const query = `
      SELECT * FROM quartos 
      WHERE id = $1 
      FOR UPDATE
    `;
    const result = await client.query(query, [id]);
    return result.rows[0];
  }

  static async atualizarStatusComVersao(id, status, version, connection = null) {
    const client = connection || pool;
    const query = `
      UPDATE quartos 
      SET status = $2, updated_at = NOW()
      WHERE id = $1 AND version = $3
      RETURNING *
    `;
    const result = await client.query(query, [id, status, version]);
    
    if (result.rows.length === 0) {
      throw new Error('CONFLITO_VERSAO');
    }
    
    return result.rows[0];
  }

  static async verificarDisponibilidade(quartoId, checkIn, checkOut, connection = null) {
    const client = connection || pool;
    const query = `
      SELECT q.*, r.id as reserva_existente
      FROM quartos q
      LEFT JOIN reservas r ON r.quarto_id = q.id 
        AND r.status NOT IN ('cancelada', 'expirada')
        AND r.check_in < $3
        AND r.check_out > $2
      WHERE q.id = $1
      FOR UPDATE
    `;
    const result = await client.query(query, [quartoId, checkIn, checkOut]);
    
    if (result.rows.length === 0) return null;
    
    const quarto = result.rows[0];
    if (quarto.reserva_existente) return null;
    
    return quarto;
  }

  static async buscarDisponiveis(checkIn, checkOut, tipo = null) {
    let query = `
      SELECT q.* FROM quartos q
      WHERE q.status = 'disponível'
      AND NOT EXISTS (
        SELECT 1 FROM reservas r
        WHERE r.quarto_id = q.id
        AND r.status NOT IN ('cancelada', 'expirada')
        AND r.check_in < $2
        AND r.check_out > $1
      )
    `;
    
    const params = [checkIn, checkOut];
    
    if (tipo) {
      query += ` AND q.tipo = $3`;
      params.push(tipo);
    }
    
    query += ` ORDER BY q.numero`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = Quarto;
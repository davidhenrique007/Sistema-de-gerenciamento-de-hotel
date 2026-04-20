const { pool } = require('../config/database');

class QuartosService {
  static async getAvailableRooms(checkIn, checkOut) {
    const query = `
      SELECT r.*,
        (SELECT COUNT(*) FROM reservations 
         WHERE room_id = r.id 
         AND status = 'confirmed'
         AND check_in < $2 
         AND check_out > $1) as reservas_conflitantes
      FROM rooms r
      WHERE r.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM reservations res
        WHERE res.room_id = r.id
        AND res.status = 'confirmed'
        AND res.check_in < $2
        AND res.check_out > $1
      )
      ORDER BY r.price_per_night
      LIMIT 50
    `;
    
    const result = await pool.query(query, [checkIn, checkOut]);
    return result.rows;
  }
}

module.exports = QuartosService;
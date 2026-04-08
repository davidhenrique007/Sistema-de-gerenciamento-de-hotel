const pool = require('../../config/database');

class QuartoAdminController {
  
  // Listar quartos
  async listar(req, res) {
    try {
      const result = await pool.query(`
        SELECT id, room_number, type, floor, status, price_per_night, updated_at 
        FROM rooms 
        WHERE deleted_at IS NULL
        ORDER BY room_number
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Estatísticas
  async obterEstatisticas(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'available' AND deleted_at IS NULL THEN 1 END) as disponiveis,
          COUNT(CASE WHEN status = 'occupied' AND deleted_at IS NULL THEN 1 END) as ocupados,
          COUNT(CASE WHEN status = 'maintenance' AND deleted_at IS NULL THEN 1 END) as manutencao
        FROM rooms WHERE deleted_at IS NULL
      `);
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Buscar por ID
  async buscarPorId(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM rooms WHERE id = $1 AND deleted_at IS NULL',
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quarto não encontrado' });
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Atualizar status
  async atualizarStatus(req, res) {
    try {
      const result = await pool.query(
        'UPDATE rooms SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING *',
        [req.body.status, req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quarto não encontrado' });
      }
      res.json({ success: true, message: 'Status atualizado', data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // EXCLUIR (Soft Delete) - VERSÃO SIMPLES
  async excluir(req, res) {
    try {
      const { id } = req.params;
      
      console.log('📝 Excluindo quarto:', id);
      
      const result = await pool.query(
        `UPDATE rooms 
         SET deleted_at = NOW(), 
             status = 'inactive',
             updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, room_number`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quarto não encontrado' });
      }
      
      console.log('✅ Quarto excluído:', result.rows[0].room_number);
      
      res.json({
        success: true,
        message: `Quarto ${result.rows[0].room_number} movido para a lixeira`,
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      res.status(500).json({ success: false, message: 'Erro ao excluir quarto: ' + error.message });
    }
  }

  // Listar lixeira
  async listarLixeira(req, res) {
    try {
      const result = await pool.query(`
        SELECT id, room_number, type, floor, status, price_per_night, deleted_at 
        FROM rooms 
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Recuperar da lixeira
  async recuperar(req, res) {
    try {
      const result = await pool.query(
        `UPDATE rooms 
         SET deleted_at = NULL, status = 'available', updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NOT NULL
         RETURNING id, room_number`,
        [req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quarto não encontrado na lixeira' });
      }
      
      res.json({ success: true, message: `Quarto ${result.rows[0].room_number} recuperado` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Excluir permanentemente
  async excluirPermanentemente(req, res) {
    try {
      const result = await pool.query(
        'DELETE FROM rooms WHERE id = $1 AND deleted_at IS NOT NULL RETURNING room_number',
        [req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quarto não encontrado na lixeira' });
      }
      
      res.json({ success: true, message: `Quarto ${result.rows[0].room_number} removido permanentemente` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new QuartoAdminController();

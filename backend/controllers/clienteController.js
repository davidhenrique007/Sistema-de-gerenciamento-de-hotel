const pool = require('../config/database');

const clienteController = {
  async identificarCliente(req, res) {
    try {
      const { name, phone, document, email } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Nome e telefone são obrigatórios' });
      }
      
      const telefoneLimpo = phone.replace(/\D/g, '');
      
      let cliente = await pool.query('SELECT * FROM guests WHERE phone = $1', [telefoneLimpo]);
      
      if (cliente.rows.length === 0) {
        const result = await pool.query(
          'INSERT INTO guests (name, phone, email, document) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, telefoneLimpo, email || null, document || null]
        );
        cliente = result.rows[0];
      } else {
        cliente = cliente.rows[0];
      }
      
      res.json({ success: true, data: cliente });
    } catch (error) {
      console.error('Erro ao identificar cliente:', error);
      res.status(500).json({ success: false, message: 'Erro interno' });
    }
  },
  
  async buscarPorTelefone(req, res) {
    try {
      const { telefone } = req.params;
      const telefoneLimpo = telefone.replace(/\D/g, '');
      const result = await pool.query('SELECT * FROM guests WHERE phone = $1', [telefoneLimpo]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, message: 'Erro interno' });
    }
  },
  
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM guests WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, message: 'Erro interno' });
    }
  },
  
  async atualizarCliente(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, email, document } = req.body;
      
      const result = await pool.query(
        'UPDATE guests SET name = COALESCE($1, name), phone = COALESCE($2, phone), email = COALESCE($3, email), document = COALESCE($4, document), updated_at = NOW() WHERE id = $5 RETURNING *',
        [name, phone, email, document, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, message: 'Erro interno' });
    }
  },
  
  async listarClientes(req, res) {
    try {
      const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC LIMIT 100');
      res.json({ success: true, data: result.rows, total: result.rows.length });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, message: 'Erro interno' });
    }
  }
};

module.exports = clienteController;

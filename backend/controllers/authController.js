const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Tentativa de login:', email);
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }
      
      const result = await pool.query(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'hotel-paradise-secret',
        { expiresIn: '7d' }
      );
      
      const response = {
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
      
      console.log('✅ Login bem-sucedido para:', email);
      return res.status(200).json(response);
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  // ADICIONAR ESTE MÉTODO
  async verificarToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token não fornecido' 
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-paradise-secret');
      
      return res.json({
        success: true,
        user: decoded
      });
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido ou expirado' 
      });
    }
  }
}

module.exports = new AuthController();

// =====================================================
// ADMIN AUTH CONTROLLER - ESPECÍFICO PARA O FRONTEND
// =====================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const adminAuthController = {
  // Login específico para o frontend admin
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 [Admin] Tentativa de login:', email);
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }
      
      // Buscar usuário no banco
      const result = await pool.query(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        console.log('❌ [Admin] Usuário não encontrado:', email);
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      const user = result.rows[0];
      console.log('✅ [Admin] Usuário encontrado:', user.email, 'Role:', user.role);
      
      // Verificar se é admin, recepcionista ou financeiro
      if (!['admin', 'receptionist', 'financial'].includes(user.role)) {
        console.log('❌ [Admin] Usuário não tem permissão de admin:', user.role);
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem acessar.'
        });
      }
      
      // Verificar senha
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        console.log('❌ [Admin] Senha inválida para:', email);
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      console.log('✅ [Admin] Senha válida!');
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'hotel-paradise-secret',
        { expiresIn: '7d' }
      );
      
      console.log('✅ [Admin] Token gerado com sucesso');
      
      // FORMATO ESPERADO PELO FRONTEND
      const response = {
        success: true,
        message: 'Login realizado com sucesso',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
      
      console.log('📦 [Admin] Enviando resposta no formato correto');
      res.json(response);
      
    } catch (error) {
      console.error('❌ [Admin] Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
};

module.exports = adminAuthController;

process.env.TZ = "Africa/Maputo";
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const reservaRoutes = require('./routes/reservaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const quartoRoutes = require('./routes/quartoRoutes');
const reciboRoutes = require('./routes/reciboRoutes');
const adminDashboardRoutes = require('./routes/admin/dashboardRoutes');
const quartoAdminRoutes = require('./routes/admin/quartoRoutes');
const reservaAdminRoutes = require('./routes/admin/reservaAdminRoutes');
const utilizadorRoutes = require('./routes/admin/utilizadorRoutes');
const logRoutes = require('./routes/admin/logRoutes');
const relatorioRoutes = require('./routes/admin/relatorioRoutes');
const financeiroRoutes = require('./routes/admin/financeiroRoutes');
const reconciliacaoRoutes = require('./routes/admin/reconciliacaoRoutes');

app.use('/api/reservas', reservaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/quartos', quartoRoutes);
app.use('/api/recibos', reciboRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/quartos', quartoAdminRoutes);
app.use('/api/admin', reservaAdminRoutes);
app.use('/api/admin', utilizadorRoutes);
app.use('/api/admin', logRoutes);
app.use('/api/admin', relatorioRoutes);
app.use('/api/admin', financeiroRoutes);
app.use('/api/admin', reconciliacaoRoutes);

// ==================== ROTA DE LOGIN ====================
app.post('/api/auth/login', async (req, res) => {
  console.log('📝 Recebendo login request:', req.body);
  
  const { email, password } = req.body;
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const pool = require('./config/database');
  const { registrarLogin } = require('./middlewares/auth');
  
  try {
    console.log('🔍 Buscando usuário:', email);
    const result = await pool.query('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      console.log('❌ Usuário inativo:', user.email);
      return res.status(401).json({ success: false, message: 'Conta desativada. Contacte o administrador.' });
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'hotel-paradise-secret', 
      { expiresIn: '7d' }
    );
    
    // Registrar login
    await registrarLogin(user.id, req.ip, req.get('user-agent'));
    
    console.log('✅ Login bem sucedido, token gerado');
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== ROTA DE LOGOUT ====================
app.post('/api/auth/logout', async (req, res) => {
  const { registrarLogout } = require('./middlewares/auth');
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-paradise-secret');
      const duracao = await registrarLogout(decoded.id, req.ip);
      console.log(`✅ Logout: usuário ${decoded.id} ficou online por ${duracao} segundos`);
    } catch(e) {
      console.error('Erro no logout:', e.message);
    }
  }
  
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// ==================== ROTA DE HEARTBEAT ====================
app.post('/api/auth/heartbeat', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-paradise-secret');
      const pool = require('./config/database');
      
      await pool.query(`
        UPDATE user_sessions 
        SET last_heartbeat = NOW() 
        WHERE user_id = $1 AND logout_time IS NULL
      `, [decoded.id]);
      
      res.json({ success: true });
    } catch(e) {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => { 
  res.json({ status: 'ok', timestamp: new Date().toISOString() }); 
});

// ==================== TRATAMENTO DE ERROS GLOBAL ====================
app.use((err, req, res, next) => {
  console.error('❌ Erro global:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => { 
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📍 CORS permitindo: http://localhost:3000`);
});


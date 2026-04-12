const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configuração CORS correta
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true,                 // Permitir cookies/credenciais
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
const reservaAdminRoutes = require('./routes/admin/reservaAdminRoutes'); // ✅ NOVA LINHA

app.use('/api/reservas', reservaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/quartos', quartoRoutes);
app.use('/api/recibos', reciboRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/quartos', quartoAdminRoutes);
app.use('/api/admin', reservaAdminRoutes); // ✅ NOVA LINHA

// ✅ Rota de login
app.post('/api/auth/login', async (req, res) => {
  console.log('📝 Recebendo login request:', req.body);
  
  const { email, password } = req.body;
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const pool = require('./config/database');
  
  try {
    console.log('🔍 Buscando usuário:', email);
    const result = await pool.query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
    
    const user = result.rows[0];
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

// Health check
app.get('/api/health', (req, res) => { 
  res.json({ status: 'ok', timestamp: new Date().toISOString() }); 
});

// ✅ Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('❌ Erro global:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

app.listen(PORT, () => { 
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📍 CORS permitindo: http://localhost:3000`);
});
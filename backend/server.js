process.env.TZ = "Africa/Maputo";
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== IMPORTS DOS MIDDLEWARES ====================
const wafMiddleware = require('./middlewares/waf');
const helmet = require('helmet');
const { globalLimiter, authLimiter, reservaLimiter, checkBlockedIP } = require('./middlewares/rateLimit');
const { sanitizeInput, validateDataTypes, securityHeaders } = require('./middlewares/sanitize');
const { verificarToken, verificarRole } = require('./middlewares/auth');
const { performanceLogger } = require('./middlewares/performanceLogger');
// const auditLogger = require('./middlewares/auditLogger'); // Desativado

// ==================== APLICAR MIDDLEWARES (ORDEM CORRIGIDA) ====================

// 1. Headers de segurança e WAF (aplicados ANTES de tudo)
app.use(helmet());
app.use(securityHeaders);
app.use(wafMiddleware);

// 2. CORS (deve vir cedo, mas depois dos headers de segurança)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Rate Limiting e Bloqueio de IP
app.use(checkBlockedIP);
app.use(globalLimiter);

// 4. Sanitização de inputs (ANTES das rotas, mas DEPOIS de json()/urlencoded())
app.use(performanceLogger);
app.use(express.json()); // <-- Movido para ANTES da sanitização e das rotas
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use(validateDataTypes);

// 5. Rate limiting específico para rotas
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/reservas', reservaLimiter);

// ==================== ROTAS PÚBLICAS ====================

app.get('/api/health', (req, res) => { 
  res.json({ status: 'ok', timestamp: new Date().toISOString() }); 
});

// ==================== ROTA PÚBLICA PARA IDENTIFICAR CLIENTE ====================
app.post('/api/clientes/identificar', async (req, res) => {
  console.log('📝 Identificando cliente:', req.body);
  
  const pool = require('./config/database');
  
  try {
    const { nome, telefone, documento, email } = req.body;
    
    if (!nome || !telefone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome e telefone são obrigatórios' 
      });
    }
    
    // 1. Buscar ou criar na tabela clientes (id inteiro)
    let clientResult = await pool.query(
      'SELECT * FROM clientes WHERE telefone = $1',
      [telefone]
    );
    
    let client;
    if (clientResult.rows.length === 0) {
      console.log('📝 Criando novo cliente na tabela clientes:', nome);
      const insertResult = await pool.query(
        `INSERT INTO clientes (nome, telefone, documento, email, data_cadastro)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [nome, telefone, documento || null, email || null]
      );
      client = insertResult.rows[0];
    } else {
      client = clientResult.rows[0];
      console.log('✅ Cliente encontrado na tabela clientes:', client.nome);
    }
    
    // 2. Buscar ou criar na tabela guests (UUID)
    let guestResult = await pool.query(
      'SELECT id FROM guests WHERE phone = $1',
      [telefone]
    );
    
    let guestId;
    if (guestResult.rows.length === 0) {
      console.log('📝 Criando novo guest na tabela guests:', nome);
      const insertGuest = await pool.query(
        `INSERT INTO guests (name, phone, email, document, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id`,
        [nome, telefone, email || null, documento || null]
      );
      guestId = insertGuest.rows[0].id;
      console.log('✅ Guest criado com UUID:', guestId);
    } else {
      guestId = guestResult.rows[0].id;
      console.log('✅ Guest encontrado com UUID:', guestId);
    }
    
    // 3. Gerar token JWT com ambos os IDs
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: client.id, 
        guest_id: guestId, 
        telefone: client.telefone, 
        nome: client.nome,
        email: client.email 
      },
      process.env.JWT_SECRET || 'hotel-paradise-secret',
      { expiresIn: '7d' }
    );
    
    // 4. Retornar AMBOS os IDs
    res.json({
      success: true,
      data: {
        id: client.id,
        guest_id: guestId,
        nome: client.nome,
        telefone: client.telefone,
        documento: client.documento,
        email: client.email
      },
      token: token
    });
    
  } catch (error) {
    console.error('❌ Erro ao identificar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar requisição',
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  console.log('🔑 Recebendo login request:', req.body);
  
  const { email, password } = req.body;
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const pool = require('./config/database');
  const { registrarLogin } = require('./middlewares/auth');
  const auditService = require('./services/auditService');
  
  try {
    console.log('🔍 Buscando usuário:', email);
    const result = await pool.query('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      await auditService.log({
        acao: 'LOGIN_FAILURE',
        entidade: 'Autenticacao',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'ERROR',
        detalhes: { email, motivo: 'Email não encontrado' }
      });
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      console.log('⛔ Usuário inativo:', user.email);
      return res.status(401).json({ success: false, message: 'Conta desativada. Contacte o administrador.' });
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log('❌ Senha inválida');
      await auditService.log({
        acao: 'LOGIN_FAILURE',
        entidade: 'Autenticacao',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'ERROR',
        detalhes: { email, motivo: 'Senha incorreta' }
      });
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'hotel-paradise-secret', 
      { expiresIn: '7d' }
    );
    
    await registrarLogin(user.id, req.ip, req.get('user-agent'));
    
    await auditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      acao: 'LOGIN_SUCCESS',
      entidade: 'Autenticacao',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      detalhes: { email: user.email }
    });
    
    console.log('✅ Login bem sucedido, token gerado');
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
    
  } catch (error) {
    console.error('🔥 Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const { registrarLogout } = require('./middlewares/auth');
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-paradise-secret');
      const duracao = await registrarLogout(decoded.id, req.ip);
      console.log(`⏱️ Logout: usuário ${decoded.id} ficou online por ${duracao} segundos`);
    } catch(e) {
      console.error('Erro no logout:', e.message);
    }
  }
  
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

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

// ==================== ROTAS PROTEGIDAS ====================

// Importar rotas
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
const performanceRoutes = require('./routes/admin/performanceRoutes');
const auditRoutes = require('./routes/admin/auditRoutes');
const twoFactorRoutes = require('./routes/auth/2faRoutes');

// Rotas 2FA (públicas)
app.use('/api/auth', twoFactorRoutes);

// Aplicar middleware de autenticação em TODAS as rotas protegidas
app.use('/api/reservas', verificarToken, reservaRoutes);
app.use('/api/clientes', verificarToken, clienteRoutes);
app.use('/api/quartos', verificarToken, quartoRoutes);
app.use('/api/recibos', verificarToken, reciboRoutes);
app.use('/api/admin/dashboard', verificarToken, verificarRole(['admin', 'financial']), adminDashboardRoutes);
app.use('/api/admin/quartos', verificarToken, verificarRole(['admin']), quartoAdminRoutes);
app.use('/api/admin', verificarToken, reservaAdminRoutes);
app.use('/api/admin', verificarToken, utilizadorRoutes);
app.use('/api/admin', verificarToken, logRoutes);
app.use('/api/admin', verificarToken, relatorioRoutes);
app.use('/api/admin', verificarToken, financeiroRoutes);
app.use('/api/admin', verificarToken, reconciliacaoRoutes);
app.use('/api/admin', verificarToken, performanceRoutes);
app.use('/api/admin', verificarToken, auditRoutes);

// ==================== SCHEDULER ====================
if (process.env.NODE_ENV !== 'test') {
  const cron = require('node-cron');
  const { exec } = require('child_process');
  
  cron.schedule('0 * * * *', () => {
    console.log('📊 Executando refresh agendado das Materialized Views...');
    exec('node scripts/refreshViews.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no refresh agendado:', error);
      } else {
        console.log('✅ Refresh agendado concluído');
      }
    });
  });
  
  console.log('⏰ Scheduler de Materialized Views ativado (refresh a cada hora)');
}

// ==================== TRATAMENTO DE ERROS GLOBAL ====================
app.use((err, req, res, next) => {
  console.error('🔥 Erro global:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// ==================== INICIAR SERVIDOR ====================
if (require.main === module) {
  app.listen(PORT, () => { 
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🌐 CORS permitindo: http://localhost:3000`);
  });
}

module.exports = app;
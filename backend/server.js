const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Rotas
const reservaRoutes = require('./routes/reservaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const quartoRoutes = require('./routes/quartoRoutes');
const reciboRoutes = require('./routes/reciboRoutes');
const adminDashboardRoutes = require('./routes/admin/dashboardRoutes');

app.use('/api/reservas', reservaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/quartos', quartoRoutes);
app.use('/api/recibos', reciboRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// Rota de login simples
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const pool = require('./config/database');
  
  try {
    const result = await pool.query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'hotel-paradise-secret', { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Health check
app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });

app.listen(PORT, () => { console.log(`🚀 Servidor rodando em http://localhost:${PORT}`); });



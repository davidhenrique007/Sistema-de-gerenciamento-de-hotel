// =====================================================
// HOTEL PARADISE - SETUP PARA TESTES
// =====================================================

process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = 5432;
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'hotel_paradise_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

beforeAll(async () => {
  try {
    // Criar tabelas se não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        document VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        capacity INTEGER DEFAULT 2,
        status VARCHAR(20) DEFAULT 'available',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        reservation_code VARCHAR(50) UNIQUE NOT NULL,
        guest_id INTEGER REFERENCES guests(id),
        room_id INTEGER REFERENCES rooms(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        cancellation_reason TEXT,
        cancellation_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP,
        last_heartbeat TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT
      );
    `);

    // Limpar dados de teste
    await pool.query('DELETE FROM user_sessions');
    await pool.query('DELETE FROM reservations');
    await pool.query('DELETE FROM guests');
    await pool.query('DELETE FROM users WHERE email LIKE \'%@test.com\'');
    await pool.query('UPDATE rooms SET status = \'available\'');

    // Inserir usuário de teste
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('test123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = $3
    `, ['Admin Teste', 'admin@test.com', passwordHash, 'admin', true]);

    // Inserir quartos de teste
    await pool.query(`
      INSERT INTO rooms (room_number, type, price_per_night, capacity, status)
      VALUES 
        ('101', 'Standard', 2500, 2, 'available'),
        ('102', 'Standard', 2500, 2, 'available'),
        ('201', 'Deluxe', 4500, 4, 'available')
      ON CONFLICT (room_number) DO NOTHING
    `);

    console.log('✅ Banco de teste preparado');
  } catch (error) {
    console.error('❌ Erro no setup:', error.message);
  }
});

afterAll(async () => {
  await pool.end();
});

global.pool = pool;
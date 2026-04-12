const db = require('../config/database');

async function criarTabelas() {
  console.log('🔧 Criando tabelas do sistema de reservas...');

  const sql = `
    -- Tabela de clientes
    CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        telefone VARCHAR(50),
        documento VARCHAR(100),
        endereco TEXT,
        data_cadastro TIMESTAMP DEFAULT NOW()
    );

    -- Tabela de quartos
    CREATE TABLE IF NOT EXISTS quartos (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(10) NOT NULL UNIQUE,
        tipo VARCHAR(50) NOT NULL,
        andar INTEGER,
        status VARCHAR(50) DEFAULT 'DISPONIVEL',
        valor_diaria DECIMAL(10,2) NOT NULL,
        capacidade INTEGER DEFAULT 2,
        descricao TEXT
    );

    -- Tabela de reservas
    CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        codigo_reserva VARCHAR(50) NOT NULL UNIQUE,
        cliente_id INTEGER REFERENCES clientes(id),
        quarto_id INTEGER REFERENCES quartos(id),
        data_checkin DATE NOT NULL,
        data_checkout DATE NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        status_pagamento VARCHAR(50) DEFAULT 'PENDENTE',
        status_reserva VARCHAR(50) DEFAULT 'PENDENTE',
        metodo_pagamento VARCHAR(50),
        observacoes TEXT,
        data_criacao TIMESTAMP DEFAULT NOW(),
        data_atualizacao TIMESTAMP DEFAULT NOW(),
        data_cancelamento TIMESTAMP,
        motivo_cancelamento TEXT,
        data_pagamento TIMESTAMP,
        valor_pago DECIMAL(10,2),
        data_checkin_real TIMESTAMP,
        data_checkout_real TIMESTAMP,
        usuario_checkin VARCHAR(255),
        usuario_checkout VARCHAR(255)
    );

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_reservas_quarto ON reservas(quarto_id);
    CREATE INDEX IF NOT EXISTS idx_reservas_datas ON reservas(data_checkin, data_checkout);
    CREATE INDEX IF NOT EXISTS idx_reservas_status ON reservas(status_reserva);
    CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo_reserva);
  `;

  try {
    await db.query(sql);
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Verificar se há dados de exemplo
    const quartosResult = await db.query('SELECT COUNT(*) FROM quartos');
    if (parseInt(quartosResult.rows[0].count) === 0) {
      console.log('📝 Inserindo quartos de exemplo...');
      await db.query(`
        INSERT INTO quartos (numero, tipo, andar, valor_diaria, capacidade) VALUES
        ('101', 'Standard', 1, 3000, 2),
        ('102', 'Standard', 1, 3000, 2),
        ('103', 'Standard', 1, 3000, 2),
        ('201', 'Superior', 2, 4500, 3),
        ('202', 'Superior', 2, 4500, 3),
        ('301', 'Deluxe', 3, 6000, 4),
        ('302', 'Suite', 3, 8000, 4)
      `);
      console.log('✅ Quartos de exemplo inseridos!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    process.exit();
  }
}

criarTabelas();

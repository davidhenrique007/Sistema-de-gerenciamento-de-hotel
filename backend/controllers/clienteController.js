// =====================================================
// HOTEL PARADISE - CONTROLLER DE CLIENTE
// Versão: 1.0.0
// =====================================================

const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hotel_paradise'
});

// =====================================================
// VALIDAÇÕES
// =====================================================
const validarTelefone = (telefone) => {
  const numeros = String(telefone).replace(/\D/g, '');
  if (numeros.length === 9 && numeros[0] === '8' && ['4', '5', '6', '7'].includes(numeros[1])) {
    return true;
  }
  if (numeros.length === 12 && numeros.startsWith('258') &&
    numeros[3] === '8' && ['4', '5', '6', '7'].includes(numeros[4])) {
    return true;
  }
  return false;
};

const validarDocumento = (documento) => {
  if (!documento) return true;
  const doc = String(documento).replace(/[\s-]/g, '');
  return doc.length >= 6 && doc.length <= 20 && /^[A-Z0-9]+$/i.test(doc);
};

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================
const formatPhone = (phone) => {
  if (!phone) return null;
  return String(phone).replace(/\D/g, '');
};

const formatDocument = (doc) => {
  if (!doc) return null;
  return String(doc).replace(/[\s-]/g, '').toUpperCase();
};

// =====================================================
// BUSCAR CLIENTE POR TELEFONE
// =====================================================
const buscarPorTelefone = async (req, res) => {
  try {
    const { telefone } = req.params;

    if (!telefone) {
      return res.status(400).json({
        success: false,
        message: 'Telefone é obrigatório'
      });
    }

    // Limpar o telefone (remover caracteres especiais)
    const telefoneLimpo = formatPhone(telefone);
    
    console.log(`🔍 Buscando cliente por telefone: ${telefoneLimpo}`);

    // Buscar diretamente no banco
    const result = await pool.query(
      'SELECT id, name, phone, email, document, created_at FROM guests WHERE phone = $1',
      [telefoneLimpo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    const cliente = result.rows[0];

    console.log(`✅ Cliente encontrado: ${cliente.name} (${cliente.phone})`);

    res.json({
      success: true,
      data: {
        id: cliente.id,
        name: cliente.name,
        phone: cliente.phone,
        email: cliente.email,
        document: cliente.document,
        createdAt: cliente.created_at
      }
    });

  } catch (error) {
    console.error('🔥 Erro ao buscar cliente por telefone:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =====================================================
// BUSCAR CLIENTE POR ID
// =====================================================
const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID é obrigatório'
      });
    }

    const result = await pool.query(
      'SELECT id, name, phone, email, document, created_at FROM guests WHERE id = $1::uuid',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    const cliente = result.rows[0];

    res.json({
      success: true,
      data: {
        id: cliente.id,
        name: cliente.name,
        phone: cliente.phone,
        email: cliente.email,
        document: cliente.document,
        createdAt: cliente.created_at
      }
    });

  } catch (error) {
    console.error('🔥 Erro ao buscar cliente por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// LISTAR TODOS OS CLIENTES
// =====================================================
const listarClientes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone, email, document, created_at FROM guests ORDER BY created_at DESC LIMIT 100'
    );

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('🔥 Erro ao listar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// CRIAR NOVO CLIENTE
// =====================================================
const criarCliente = async (req, res) => {
  try {
    const { name, phone, document, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nome e telefone são obrigatórios'
      });
    }

    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Nome deve ter pelo menos 3 caracteres'
      });
    }

    if (!validarTelefone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone inválido'
      });
    }

    if (document && !validarDocumento(document)) {
      return res.status(400).json({
        success: false,
        message: 'Documento inválido'
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    const telefoneFormatado = formatPhone(phone);
    
    // Verificar se já existe
    const existente = await pool.query(
      'SELECT id FROM guests WHERE phone = $1',
      [telefoneFormatado]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Telefone já cadastrado',
        data: existente.rows[0]
      });
    }

    const documentFormatado = document ? formatDocument(document) : null;
    
    const result = await pool.query(
      `INSERT INTO guests (name, phone, email, document) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, phone, email, document, created_at`,
      [name, telefoneFormatado, email || null, documentFormatado]
    );

    const novoCliente = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: novoCliente
    });

  } catch (error) {
    console.error('🔥 Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// ATUALIZAR CLIENTE
// =====================================================
const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, document } = req.body;

    // Verificar se cliente existe
    const existe = await pool.query('SELECT id FROM guests WHERE id = $1::uuid', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (name) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (phone) {
      const telefoneFormatado = formatPhone(phone);
      updates.push(`phone = $${idx++}`);
      values.push(telefoneFormatado);
    }
    if (email !== undefined) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }
    if (document !== undefined) {
      const docFormatado = document ? formatDocument(document) : null;
      updates.push(`document = $${idx++}`);
      values.push(docFormatado);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    values.push(id);
    const query = `UPDATE guests SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}::uuid RETURNING id, name, phone, email, document, created_at`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('🔥 Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// IDENTIFICAR CLIENTE (fluxo principal)
// =====================================================
const identificarCliente = async (req, res) => {
  console.log('📦 Dados recebidos:', req.body);

  try {
    const { name, phone, document, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nome e telefone são obrigatórios'
      });
    }

    console.log('🔍 Validando telefone:', phone);
    if (!validarTelefone(phone)) {
      console.log('❌ Telefone inválido segundo validação');
      return res.status(400).json({
        success: false,
        message: 'Telefone inválido'
      });
    }
    console.log('✅ Telefone válido!');

    const telefoneFormatado = formatPhone(phone);
    
    // Buscar cliente existente
    let result = await pool.query(
      'SELECT id, name, phone, email, document, created_at FROM guests WHERE phone = $1',
      [telefoneFormatado]
    );

    let cliente;
    
    if (result.rows.length > 0) {
      cliente = result.rows[0];
      
      // Atualizar dados se necessário
      const updates = [];
      const values = [];
      let idx = 1;
      
      if (name !== cliente.name) {
        updates.push(`name = $${idx++}`);
        values.push(name);
      }
      if (document && document !== cliente.document) {
        updates.push(`document = $${idx++}`);
        values.push(formatDocument(document));
      }
      if (email && email !== cliente.email) {
        updates.push(`email = $${idx++}`);
        values.push(email);
      }
      
      if (updates.length > 0) {
        values.push(cliente.id);
        await pool.query(
          `UPDATE guests SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}::uuid`,
          values
        );
        
        // Buscar dados atualizados
        result = await pool.query(
          'SELECT id, name, phone, email, document, created_at FROM guests WHERE id = $1::uuid',
          [cliente.id]
        );
        cliente = result.rows[0];
      }
    } else {
      // Criar novo cliente
      const docFormatado = document ? formatDocument(document) : null;
      result = await pool.query(
        `INSERT INTO guests (name, phone, email, document) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, phone, email, document, created_at`,
        [name, telefoneFormatado, email || null, docFormatado]
      );
      cliente = result.rows[0];
    }

    res.json({
      success: true,
      message: 'Cliente identificado com sucesso',
      data: cliente
    });

  } catch (error) {
    console.error('🔥 Erro ao identificar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// EXPORTAÇÕES
// =====================================================
module.exports = {
  buscarPorTelefone,
  buscarPorId,
  listarClientes,
  criarCliente,
  atualizarCliente,
  identificarCliente
};
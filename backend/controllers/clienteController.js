// =====================================================
// HOTEL PARADISE - CONTROLLER DE CLIENTE
// Versão: 1.0.0
// =====================================================

const Cliente = require('../models/entities/Cliente');

// =====================================================
// VALIDAÇÕES
// =====================================================
const validarTelefone = (telefone) => {
  const numeros = telefone.replace(/\D/g, '');
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
  const doc = documento.replace(/[\s-]/g, '');
  return doc.length >= 6 && doc.length <= 20 && /^[A-Z0-9]+$/i.test(doc);
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

    const telefoneFormatado = Cliente.formatPhone(telefone);
    const cliente = await Cliente.query().findOne({ phone: telefoneFormatado });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente.toJSON()
    });

  } catch (error) {
    console.error('🔥 Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
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

    const cliente = await Cliente.query().findById(id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente.toJSON()
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
    const clientes = await Cliente.query().orderBy('created_at', 'DESC').limit(100);

    res.json({
      success: true,
      data: clientes.map(c => c.toJSON()),
      total: clientes.length
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
    const { name, phone, document, email, birth_date, address } = req.body;

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

    const telefoneFormatado = Cliente.formatPhone(phone);
    const existente = await Cliente.query().findOne({ phone: telefoneFormatado });

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Telefone já cadastrado',
        data: existente.toJSON()
      });
    }

    const clienteData = {
      name,
      phone: telefoneFormatado,
      document: document ? Cliente.formatDocument(document) : null,
      email: email || null,
      birth_date: birth_date || null,
      address_street: address?.street,
      address_number: address?.number,
      address_complement: address?.complement,
      address_neighborhood: address?.neighborhood,
      address_city: address?.city,
      address_state: address?.state,
      address_zipcode: address?.zipcode,
      address_country: address?.country || 'Brasil'
    };

    const novoCliente = await Cliente.query().insert(clienteData);

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: novoCliente.toJSON()
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
    const updates = req.body;

    const cliente = await Cliente.query().findById(id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    if (updates.name && updates.name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Nome deve ter pelo menos 3 caracteres'
      });
    }

    if (updates.phone) {
      if (!validarTelefone(updates.phone)) {
        return res.status(400).json({
          success: false,
          message: 'Telefone inválido'
        });
      }
      updates.phone = Cliente.formatPhone(updates.phone);
    }

    if (updates.document !== undefined) {
      if (updates.document && !validarDocumento(updates.document)) {
        return res.status(400).json({
          success: false,
          message: 'Documento inválido'
        });
      }
      updates.document = updates.document ? Cliente.formatDocument(updates.document) : null;
    }

    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (updates.phone && updates.phone !== cliente.phone) {
      const existente = await Cliente.query().findOne({ phone: updates.phone });
      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Telefone já cadastrado para outro cliente'
        });
      }
    }

    if (updates.address) {
      updates.address_street = updates.address.street;
      updates.address_number = updates.address.number;
      updates.address_complement = updates.address.complement;
      updates.address_neighborhood = updates.address.neighborhood;
      updates.address_city = updates.address.city;
      updates.address_state = updates.address.state;
      updates.address_zipcode = updates.address.zipcode;
      updates.address_country = updates.address.country;
      delete updates.address;
    }

    const clienteAtualizado = await Cliente.query().patchAndFetchById(id, updates);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: clienteAtualizado.toJSON()
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

    const telefoneFormatado = phone.replace(/\D/g, '');
    let cliente = await Cliente.query().findOne({ phone: telefoneFormatado });

    if (cliente) {
      const updates = {};
      if (name !== cliente.name) updates.name = name;
      if (document && document !== cliente.document) updates.document = document;
      if (email && email !== cliente.email) updates.email = email;

      if (Object.keys(updates).length > 0) {
        cliente = await Cliente.query().patchAndFetchById(cliente.id, updates);
      }
    } else {
      cliente = await Cliente.query().insert({
        name,
        phone: telefoneFormatado,
        document: document || null,
        email: email || null
      });
    }

    res.json({
      success: true,
      message: 'Cliente identificado com sucesso',
      data: cliente.toJSON()
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
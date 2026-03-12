// =====================================================
// HOTEL PARADISE - CONTROLLER DE CLIENTE
// Versão: 1.0.0
// =====================================================

const Cliente = require('../models/entities/Cliente');

// =====================================================
// VALIDAÇÕES
// =====================================================
const validarTelefone = (telefone) => {
  // Regex para telefone internacional e nacional
  // Aceita: +258841234567, 841234567, 258841234567
  const regex = /^(\+?\d{1,3})?[\s-]?\(?\d{2,3}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
  return regex.test(telefone);
};

const validarDocumento = (documento) => {
  if (!documento) return true; // Opcional
  // Aceita: BI (AB123456), Passaporte, etc.
  const regex = /^[A-Z0-9]{6,20}$/i;
  return regex.test(documento);
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

    // Formatar telefone (remover caracteres especiais)
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
// CRIAR NOVO CLIENTE
// =====================================================
const criarCliente = async (req, res) => {
  try {
    const { name, phone, document, email, birth_date, address } = req.body;

    // Validações
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

    // Verificar se telefone já existe
    const telefoneFormatado = Cliente.formatPhone(phone);
    const existente = await Cliente.query().findOne({ phone: telefoneFormatado });

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Telefone já cadastrado',
        data: existente.toJSON()
      });
    }

    // Preparar dados do cliente
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

    // Criar cliente
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

    // Verificar se cliente existe
    const cliente = await Cliente.query().findById(id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Validações básicas
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

    // Se estiver atualizando telefone, verificar se já existe
    if (updates.phone && updates.phone !== cliente.phone) {
      const existente = await Cliente.query().findOne({ phone: updates.phone });
      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Telefone já cadastrado para outro cliente'
        });
      }
    }

    // Mapear campos de endereço
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

    // Atualizar cliente
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
  try {
    const { name, phone, document, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nome e telefone são obrigatórios'
      });
    }

    // Validar telefone
    if (!validarTelefone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone inválido'
      });
    }

    const telefoneFormatado = Cliente.formatPhone(phone);

    // Buscar cliente existente
    let cliente = await Cliente.query().findOne({ phone: telefoneFormatado });

    if (cliente) {
      // Atualizar dados se necessário
      const updates = {};
      if (name !== cliente.name) updates.name = name;
      if (document && document !== cliente.document) updates.document = Cliente.formatDocument(document);
      if (email && email !== cliente.email) updates.email = email;

      if (Object.keys(updates).length > 0) {
        cliente = await Cliente.query().patchAndFetchById(cliente.id, updates);
      }
    } else {
      // Criar novo cliente
      cliente = await Cliente.query().insert({
        name,
        phone: telefoneFormatado,
        document: document ? Cliente.formatDocument(document) : null,
        email: email || null
      });
    }

    res.json({
      success: true,
      message: cliente.wasCreated ? 'Cliente criado com sucesso' : 'Cliente identificado com sucesso',
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

module.exports = {
  buscarPorTelefone,
  criarCliente,
  atualizarCliente,
  identificarCliente
};
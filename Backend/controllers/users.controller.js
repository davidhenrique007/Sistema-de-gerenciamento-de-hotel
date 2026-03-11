// =====================================================
// HOTEL PARADISE - USERS CONTROLLER
// Versão: 1.0.0
// =====================================================

const bcrypt = require('bcryptjs');
const { models } = require('../models');

/**
 * Listar todos os usuários
 */
const findAll = async (req, res) => {
  try {
    const users = await models.users.findAll();
    
    // Remover senhas
    const usersWithoutPassword = users.map(user => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    res.json({
      success: true,
      data: usersWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Buscar usuário por ID
 */
const findById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permissão (admin ou próprio usuário)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const user = await models.users.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Criar novo usuário
 */
const create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se email já existe
    const existingUser = await models.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Criar usuário
    const [newUser] = await models.users.create({
      name,
      email,
      password_hash,
      role: role || 'receptionist',
      is_active: true
    });

    const { password_hash: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Atualizar usuário
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Verificar permissão
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const user = await models.users.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se admin pode alterar role, senão mantém a atual
    const updateData = {
      name: name || user.name,
      email: email || user.email
    };

    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }

    const [updatedUser] = await models.users.update(id, updateData);

    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Deletar usuário
 */
const delete_user = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.users.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir deletar o próprio admin
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar seu próprio usuário'
      });
    }

    await models.users.delete(id);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Ativar/Desativar usuário
 */
const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.users.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir desativar o próprio admin
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível alterar seu próprio status'
      });
    }

    const [updatedUser] = await models.users.update(id, {
      is_active: !user.is_active
    });

    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: `Usuário ${updatedUser.is_active ? 'ativado' : 'desativado'} com sucesso`,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: delete_user,
  toggleActive
};
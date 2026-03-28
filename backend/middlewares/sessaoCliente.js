// =====================================================
// HOTEL PARADISE - MIDDLEWARE DE SESSÃO DO CLIENTE
// Versão: 1.0.0
// =====================================================

const Cliente = require('../models/entities/Cliente');

/**
 * Middleware para validar sessão do cliente
 * Verifica se o ID do cliente existe e está ativo
 */
const sessaoCliente = async (req, res, next) => {
  try {
    // O ID do cliente pode vir do header ou da sessão
    const clienteId = req.headers['x-cliente-id'] || req.body.clienteId || req.query.clienteId;

    if (!clienteId) {
      return res.status(401).json({
        success: false,
        message: 'ID do cliente não fornecido'
      });
    }

    // Buscar cliente no banco
    const cliente = await Cliente.query().findById(clienteId);

    if (!cliente) {
      return res.status(401).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Adicionar cliente à requisição para uso posterior
    req.cliente = cliente;

    next();
  } catch (error) {
    console.error('Erro no middleware de sessão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Middleware para verificar se o cliente pode acessar um recurso específico
 * Exemplo: verificar se o cliente é dono da reserva
 */
const verificarProprietario = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const cliente = req.cliente;

      if (!cliente) {
        return res.status(401).json({
          success: false,
          message: 'Cliente não autenticado'
        });
      }

      // Aqui você pode implementar lógica específica
      // Por exemplo, verificar se a reserva pertence ao cliente
      
      next();
    } catch (error) {
      console.error('Erro ao verificar proprietário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  };
};

module.exports = {
  sessaoCliente,
  verificarProprietario
};
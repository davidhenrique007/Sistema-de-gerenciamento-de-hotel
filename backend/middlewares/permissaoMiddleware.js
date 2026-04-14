// backend/middlewares/permissaoMiddleware.js
const Log = require('../models/Log');

// Definição de permissões por perfil
const permissoes = {
  admin: {
    '*': ['*'] // Acesso total
  },
  receptionist: {
    'reservas': ['listar', 'visualizar', 'criar', 'editar', 'cancelar', 'checkin', 'checkout'],
    'quartos': ['listar', 'visualizar', 'editar'],
    'hospedes': ['listar', 'visualizar', 'criar'],
    'relatorios': ['visualizar'],
    '*': [] // Negar tudo que não for explicitamente permitido
  },
  financial: {
    'pagamentos': ['listar', 'visualizar', 'confirmar'],
    'recibos': ['listar', 'visualizar', 'gerar'],
    'relatorios': ['listar', 'visualizar', 'exportar'],
    'auditoria': ['listar', 'visualizar'],
    '*': []
  }
};

const verificarPermissao = (recurso, acao) => {
  return async (req, res, next) => {
    try {
      const usuario = req.user;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const role = usuario.role;
      const perfilPermissoes = permissoes[role];

      if (!perfilPermissoes) {
        await Log.registrar({
          usuarioId: usuario.id,
          usuarioNome: usuario.name,
          usuarioRole: role,
          acao: 'ACL_DENIED',
          recurso,
          recursoId: req.params.id,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          sucesso: false,
          mensagemErro: `Perfil ${role} não encontrado`
        });

        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Perfil não reconhecido.'
        });
      }

      // Verificar permissão específica
      const temPermissao = 
        perfilPermissoes['*']?.includes('*') ||
        perfilPermissoes[recurso]?.includes(acao) ||
        perfilPermissoes[recurso]?.includes('*');

      if (!temPermissao) {
        await Log.registrar({
          usuarioId: usuario.id,
          usuarioNome: usuario.name,
          usuarioRole: role,
          acao: 'ACL_DENIED',
          recurso,
          recursoId: req.params.id,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          sucesso: false,
          mensagemErro: `Acesso negado: ${role} não tem permissão para ${acao} em ${recurso}`
        });

        return res.status(403).json({
          success: false,
          message: `Acesso negado. Você não tem permissão para ${acao} em ${recurso}.`
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de permissão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao verificar permissões'
      });
    }
  };
};

const verificarAcessoUtilizadores = (req, res, next) => {
  const usuario = req.user;
  
  // Apenas admin pode gerenciar utilizadores
  if (usuario.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem gerenciar utilizadores.'
    });
  }
  
  next();
};

const verificarNaoAutoDesativacao = async (req, res, next) => {
  const { id } = req.params;
  const usuarioLogado = req.user;
  
  // Impedir que o admin desative a si mesmo
  if (id === usuarioLogado.id && req.body.is_active === false) {
    return res.status(400).json({
      success: false,
      message: 'Você não pode desativar seu próprio usuário.'
    });
  }
  
  next();
};

module.exports = {
  verificarPermissao,
  verificarAcessoUtilizadores,
  verificarNaoAutoDesativacao,
  permissoes
};
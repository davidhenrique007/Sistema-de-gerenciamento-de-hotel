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
    'dashboard': ['visualizar'],
    'auditoria': [],
    'pagamentos': [],
    'utilizadores': [],
    '*': []
  },
  financial: {
    'pagamentos': ['listar', 'visualizar', 'confirmar'],
    'recibos': ['listar', 'visualizar', 'gerar'],
    'relatorios': ['listar', 'visualizar', 'exportar'],
    'auditoria': ['listar', 'visualizar'],
    'dashboard': ['visualizar'],
    'reservas': [],
    'quartos': [],
    'utilizadores': [],
    '*': []
  }
};

// Função para registrar acesso negado
const registrarAcessoNegado = async (usuario, recurso, acao, req) => {
  await Log.registrar({
    usuarioId: usuario.id,
    usuarioNome: usuario.name,
    usuarioRole: usuario.role,
    acao: 'ACL_DENIED',
    recurso: recurso,
    recursoId: req.params.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    sucesso: false,
    mensagemErro: `Tentativa de acesso negado: ${acao} em ${recurso}`
  });
};

// Middleware principal para verificar permissões
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
        await registrarAcessoNegado(usuario, recurso, acao, req);
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
        await registrarAcessoNegado(usuario, recurso, acao, req);
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

// Middleware específico para acesso a pagamentos
const verificarAcessoPagamentos = (req, res, next) => {
  const usuario = req.user;
  
  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  if (usuario.role !== 'admin' && usuario.role !== 'financial') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores e financeiro podem acessar pagamentos.'
    });
  }
  
  next();
};

// Middleware específico para acesso a utilizadores
const verificarAcessoUtilizadores = (req, res, next) => {
  const usuario = req.user;
  
  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  // Apenas admin pode gerenciar utilizadores
  if (usuario.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem gerenciar utilizadores.'
    });
  }
  
  next();
};

// Middleware para impedir auto-desativação
const verificarNaoAutoDesativacao = async (req, res, next) => {
  const { id } = req.params;
  const usuarioLogado = req.user;
  
  if (!usuarioLogado) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  // Impedir que o admin desative a si mesmo
  if (id === usuarioLogado.id && req.body.is_active === false) {
    return res.status(400).json({
      success: false,
      message: 'Você não pode desativar seu próprio usuário.'
    });
  }
  
  next();
};

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
  const usuario = req.user;
  
  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  if (usuario.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
    });
  }
  
  next();
};

// Middleware para verificar permissão de dashboard (apenas visualização)
const verificarAcessoDashboard = (req, res, next) => {
  const usuario = req.user;
  
  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  // Todos os perfis autenticados podem ver o dashboard
  // (mas com dados diferentes conforme o perfil)
  next();
};

module.exports = {
  verificarPermissao,
  verificarAcessoPagamentos,
  verificarAcessoUtilizadores,
  verificarNaoAutoDesativacao,
  verificarAdmin,
  verificarAcessoDashboard,
  permissoes
};
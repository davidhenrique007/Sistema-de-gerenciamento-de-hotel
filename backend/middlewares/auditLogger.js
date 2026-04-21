// =====================================================
// MIDDLEWARE DE AUDITORIA AUTOMÁTICA - HOTEL PARADISE
// =====================================================

const auditService = require('../services/auditService');
const config = require('../config/audit.config');

const auditLogger = (req, res, next) => {
  // Ignorar rotas configuradas
  if (config.ignorePaths.includes(req.path)) {
    return next();
  }

  // Capturar IP real (considerando proxy)
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  // Capturar início da requisição
  const startTime = Date.now();

  // Interceptar resposta para capturar status
  const oldJson = res.json;
  res.json = function(data) {
    res.locals.responseData = data;
    res.locals.responseTime = Date.now() - startTime;
    return oldJson.call(this, data);
  };

  // Registrar após resposta
  res.on('finish', async () => {
    // Determinar ação baseada no método e rota
    const acao = getActionFromRoute(req.method, req.path);
    if (!acao) return;

    // Determinar entidade
    const entidade = getEntityFromRoute(req.path);
    
    // Determinar status
    const status = res.statusCode >= 400 ? 'ERROR' : 'SUCCESS';

    // Log apenas para ações importantes
    if (shouldLogAction(acao, status)) {
      await auditService.log({
        userId: req.user?.id,
        userName: req.user?.name,
        userRole: req.user?.role,
        acao,
        entidade,
        entidadeId: req.params.id || req.body?.id,
        ip,
        userAgent: req.headers['user-agent'],
        status,
        nivel: res.statusCode >= 500 ? 'CRITICAL' : 'INFO',
        detalhes: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          responseTime: res.locals.responseTime,
          ...(req.body && Object.keys(req.body).length > 0 ? { body: sanitizeBody(req.body) } : {})
        }
      });
    }
  });

  next();
};

// Determinar ação baseada no método e rota
function getActionFromRoute(method, path) {
  const routes = {
    'POST:/api/auth/login': 'LOGIN',
    'POST:/api/auth/logout': 'LOGOUT',
    'POST:/api/reservas': 'CRIAR_RESERVA',
    'PUT:/api/reservas': 'ATUALIZAR_RESERVA',
    'DELETE:/api/reservas': 'CANCELAR_RESERVA',
    'POST:/api/clientes': 'CRIAR_CLIENTE',
    'PUT:/api/clientes': 'ATUALIZAR_CLIENTE',
    'POST:/api/quartos': 'CRIAR_QUARTO',
    'PUT:/api/quartos': 'ATUALIZAR_QUARTO',
    'POST:/api/admin/utilizadores': 'CRIAR_UTILIZADOR',
    'PUT:/api/admin/utilizadores': 'ATUALIZAR_UTILIZADOR',
    'DELETE:/api/admin/utilizadores': 'ELIMINAR_UTILIZADOR'
  };

  const key = `${method}:${path}`;
  return routes[key] || null;
}

// Determinar entidade baseada na rota
function getEntityFromRoute(path) {
  if (path.includes('/reservas')) return 'Reserva';
  if (path.includes('/clientes')) return 'Cliente';
  if (path.includes('/quartos')) return 'Quarto';
  if (path.includes('/utilizadores')) return 'Utilizador';
  if (path.includes('/auth')) return 'Autenticacao';
  return 'Sistema';
}

// Verificar se deve logar a ação
function shouldLogAction(acao, status) {
  // Logar sempre ações críticas
  const acoesCriticas = ['LOGIN', 'CRIAR_RESERVA', 'CANCELAR_RESERVA', 'ELIMINAR_UTILIZADOR'];
  if (acoesCriticas.includes(acao)) return true;

  // Logar erros
  if (status === 'ERROR') return true;

  return false;
}

// Sanitizar body para não logar dados sensíveis
function sanitizeBody(body) {
  const sensitive = ['password', 'token', 'cardNumber', 'cvv'];
  const sanitized = { ...body };
  
  for (const field of sensitive) {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  }
  
  return sanitized;
}

module.exports = auditLogger;
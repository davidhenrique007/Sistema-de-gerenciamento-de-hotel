// Adicionar no quartoAdminController.js
const Log = require('../../models/Log');

async criarQuartoComLog(req, res) {
  // ... código existente
  
  await Log.registrar({
    usuarioId: req.user.id,
    usuarioNome: req.user.name,
    usuarioRole: req.user.role,
    acao: 'CREATE_ROOM',
    recurso: 'room',
    recursoId: result.id,
    dadosNovos: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
}

async editarQuartoComLog(req, res) {
  // ... código existente
  
  await Log.registrar({
    usuarioId: req.user.id,
    usuarioNome: req.user.name,
    usuarioRole: req.user.role,
    acao: 'UPDATE_ROOM',
    recurso: 'room',
    recursoId: id,
    dadosAntigos: oldData,
    dadosNovos: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
}

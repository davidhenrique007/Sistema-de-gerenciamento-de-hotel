const Log = require('../models/Log');

const registrarAcao = (acao, recurso = null) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const sucesso = data && data.success === true;
      
      Log.registrar({
        usuarioId: req.user?.id,
        usuarioNome: req.user?.name,
        usuarioRole: req.user?.role,
        acao: acao,
        recurso: recurso,
        recursoId: req.params.id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        sucesso: sucesso,
        dadosNovos: req.body
      }).catch(console.error);
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { registrarAcao };

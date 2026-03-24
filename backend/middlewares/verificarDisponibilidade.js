// backend/middlewares/verificarDisponibilidade.js
const pool = require('../config/database');
const Quarto = require('../models/Quarto');

const verificarDisponibilidade = async (req, res, next) => {
  const { quartoId, checkIn, checkOut } = req.body;
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');

    // Lock pessimista no quarto
    const quarto = await Quarto.buscarPorIdComLock(quartoId, client);
    
    if (!quarto) {
      throw new Error('QUARTO_NAO_ENCONTRADO');
    }

    if (quarto.status !== 'disponível') {
      throw new Error('QUARTO_INDISPONIVEL');
    }

    // Verificar conflitos de data
    const disponivel = await Quarto.verificarDisponibilidade(
      quartoId, 
      checkIn, 
      checkOut, 
      client
    );

    if (!disponivel) {
      throw new Error('QUARTO_RESERVADO');
    }

    // Armazenar dados no request para uso posterior
    req.quarto = quarto;
    req.dbClient = client;
    
    next();
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    
    // Mapeamento de erros para mensagens amigáveis
    const errorMap = {
      'QUARTO_NAO_ENCONTRADO': {
        status: 404,
        message: 'Quarto não encontrado',
        code: 'QUARTO_NAO_ENCONTRADO'
      },
      'QUARTO_INDISPONIVEL': {
        status: 409,
        message: 'Este quarto não está mais disponível. Por favor, selecione outro quarto.',
        code: 'QUARTO_INDISPONIVEL'
      },
      'QUARTO_RESERVADO': {
        status: 409,
        message: 'Este quarto acabou de ser reservado para este período. Por favor, escolha outro quarto ou altere as datas.',
        code: 'QUARTO_RESERVADO'
      }
    };

    const errorInfo = errorMap[error.message] || {
      status: 500,
      message: 'Erro ao verificar disponibilidade. Tente novamente.',
      code: 'ERRO_INTERNO'
    };

    res.status(errorInfo.status).json({
      error: true,
      message: errorInfo.message,
      code: errorInfo.code
    });
  }
};

module.exports = verificarDisponibilidade;
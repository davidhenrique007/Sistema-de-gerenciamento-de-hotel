// =====================================================
// CONTROLLER DE RESERVAS - ATUALIZADO
// =====================================================

const { criarReserva } = require('../services/filaReservas');
const lockManager = require('../utils/lockManager');
const pool = require('../config/database');

class ReservaController {
  async criarReserva(req, res) {
    const { quartoId, checkIn, checkOut, adults, children, valorTotal } = req.body;
    const userId = req.user?.id || 1;
    const guestId = req.guest?.id || userId;

    console.log('📝 Recebendo reserva:', { quartoId, checkIn, checkOut, adults, children, valorTotal });

    if (!quartoId || !checkIn || !checkOut) {
      return res.status(400).json({
        error: true,
        message: 'Campos obrigatórios: quartoId, checkIn, checkOut',
        code: 'CAMPOS_OBRIGATORIOS'
      });
    }

    try {
      const quartoCheck = await pool.query(
        'SELECT id, status, version, price_per_night FROM rooms WHERE id = $1',
        [quartoId]
      );
      
      if (quartoCheck.rows.length === 0) {
        return res.status(404).json({
          error: true,
          message: 'Quarto não encontrado',
          code: 'QUARTO_NAO_ENCONTRADO'
        });
      }

      const quarto = quartoCheck.rows[0];
      if (quarto.status !== 'available') {
        return res.status(409).json({
          error: true,
          message: 'Quarto não está disponível',
          code: 'QUARTO_INDISPONIVEL'
        });
      }

      const lock = await lockManager.adquirirLock(quartoId, userId);
      
      if (!lock.success) {
        return res.status(409).json({
          error: true,
          message: 'Quarto está sendo reservado por outro cliente. Aguarde e tente novamente.',
          code: 'CONFLITO_CONCORRENCIA'
        });
      }

      const resultado = await criarReserva({
        reservaData: { 
          quartoId, 
          checkIn, 
          checkOut, 
          adults: adults || 2,
          children: children || 0,
          valorTotal: valorTotal || (quarto.price_per_night || 5000) 
        },
        userId,
        guestId
      });
      
      await lock.liberar();

      if (resultado.status === 'processing') {
        return res.status(202).json({
          success: true,
          message: 'Reserva em processamento',
          jobId: resultado.jobId
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Reserva confirmada com sucesso',
        reserva: resultado.resultado?.reserva
      });

    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      return res.status(500).json({
        error: true,
        message: 'Erro interno ao processar reserva',
        code: 'ERRO_INTERNO',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async buscarQuartosDisponiveis(req, res) {
    try {
      const { checkIn, checkOut, tipo } = req.query;
      
      let query = `
        SELECT * FROM rooms 
        WHERE status = 'available'
      `;
      
      const params = [];
      
      if (tipo) {
        query += ` AND type = $${params.length + 1}`;
        params.push(tipo);
      }
      
      query += ` ORDER BY room_number`;
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Erro ao buscar quartos:', error);
      res.status(500).json({
        error: true,
        message: 'Erro ao buscar quartos disponíveis'
      });
    }
  }

  async verificarDisponibilidadeQuarto(req, res) {
    try {
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;
      
      const result = await pool.query(`
        SELECT * FROM rooms 
        WHERE id = $1 AND status = 'available'
      `, [id]);
      
      res.json({
        success: true,
        disponivel: result.rows.length > 0,
        quarto: result.rows[0] || null
      });
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({
        error: true,
        message: 'Erro ao verificar disponibilidade'
      });
    }
  }

  async verificarStatusReserva(req, res) {
    try {
      const { jobId } = req.params;
      res.json({
        success: true,
        status: 'processing',
        message: 'Processando reserva...'
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      res.status(500).json({
        error: true,
        message: 'Erro ao verificar status da reserva'
      });
    }
  }
}

module.exports = new ReservaController();

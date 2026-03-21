// =====================================================
// HOTEL PARADISE - QUARTO CONTROLLER
// =====================================================

const Quarto = require('../models/entities/Quarto');

// =====================================================
// LISTAR QUARTOS DISPONÍVEIS POR TIPO
// =====================================================
const listarDisponiveis = async (req, res) => {
  try {
    const { tipo } = req.query;

    if (!tipo) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "tipo" é obrigatório'
      });
    }

    console.log('🔍 Buscando quartos do tipo:', tipo.toLowerCase());

    // Buscar quartos do tipo específico com status 'available'
    const quartos = await Quarto.query()
      .where('type', tipo.toLowerCase())
      .where('status', 'available')
      .select('id', 'room_number as numero', 'type as tipo', 'status', 'price_per_night as preco')
      .orderBy('room_number');

    console.log(`✅ Encontrados ${quartos.length} quartos disponíveis`);

    // Mapear status para o formato do frontend
    const quartosFormatados = quartos.map(q => ({
      id: q.id,
      numero: q.numero,
      tipo: q.tipo,
      status: q.status === 'available' ? 'disponível' : 
              q.status === 'occupied' ? 'ocupado' : 'manutenção',
      preco: q.preco
    }));

    res.json({
      success: true,
      data: quartosFormatados
    });

  } catch (error) {
    console.error('Erro ao listar quartos disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// LISTAR TODOS OS QUARTOS
// =====================================================
const listarTodos = async (req, res) => {
  try {
    const quartos = await Quarto.query().select('*');
    res.json({
      success: true,
      data: quartos
    });
  } catch (error) {
    console.error('Erro ao listar quartos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// BUSCAR QUARTO POR ID
// =====================================================
const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const quarto = await Quarto.query().findById(id);
    
    if (!quarto) {
      return res.status(404).json({
        success: false,
        message: 'Quarto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: quarto
    });
  } catch (error) {
    console.error('Erro ao buscar quarto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// EXPORTAÇÕES
// =====================================================
module.exports = {
  listarDisponiveis,
  listarTodos,
  buscarPorId
};

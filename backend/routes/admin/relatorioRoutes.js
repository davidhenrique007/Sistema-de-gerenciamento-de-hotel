// backend/routes/admin/relatorioRoutes.js
const express = require('express');
const relatorioController = require('../../controllers/admin/relatorioController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarPermissao } = require('../../middlewares/permissaoMiddleware');
const exportacaoService = require('../../services/exportacaoService');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// ==================== ROTAS DE RELATÓRIOS ====================
router.get('/relatorios/receita', verificarPermissao('relatorios', 'visualizar'), relatorioController.getReceitaPeriodo);
router.get('/relatorios/comparativo', verificarPermissao('relatorios', 'visualizar'), relatorioController.getComparativo);
router.get('/relatorios/tendencia', verificarPermissao('relatorios', 'visualizar'), relatorioController.getTendenciaProjecao);
router.get('/relatorios/metricas', verificarPermissao('relatorios', 'visualizar'), relatorioController.getMetricasDashboard);

// ==================== ROTAS DE EXPORTAÇÃO ====================

// Rota para enviar relatório por email
router.post('/relatorios/enviar-email', verificarPermissao('relatorios', 'visualizar'), async (req, res) => {
  try {
    const { tipo, email, titulo, dados, formato } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-mail de destino é obrigatório' });
    }
    
    const result = await exportacaoService.enviarRelatorioEmail({
      email,
      titulo: titulo || `Relatório ${tipo}`,
      conteudo: dados,
      formato: formato || 'pdf'
    });
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail' });
  }
});

// Rota para listar histórico de exportações
router.get('/relatorios/historico', verificarPermissao('relatorios', 'visualizar'), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const historico = await exportacaoService.listarHistorico(parseInt(limit));
    res.json({ success: true, data: historico });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar histórico' });
  }
});

// Rota para agendar relatório
router.post('/relatorios/agendar', verificarPermissao('relatorios', 'visualizar'), async (req, res) => {
  try {
    const { tipo, titulo, frequencia, email, parametros } = req.body;
    const relatorioJob = require('../../services/jobs/relatorioJob');
    
    const result = await relatorioJob.agendarRelatorioPersonalizado({
      tipo,
      frequencia: frequencia || 'diario',
      email: email || req.user.email,
      parametros
    });
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao agendar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro ao agendar relatório' });
  }
});

// Rota para gerar PDF diretamente
router.post('/relatorios/gerar-pdf', verificarPermissao('relatorios', 'visualizar'), async (req, res) => {
  try {
    const { dados, titulo, colunas, linhas } = req.body;
    
    // Gerar PDF em memória
    const { jsPDF } = require('jspdf');
    require('jspdf-autotable');
    
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    doc.setFontSize(18);
    doc.setTextColor(26, 42, 79);
    doc.text(`🏨 Hotel Paradise - ${titulo}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 32);
    
    doc.autoTable({
      startY: 40,
      head: [colunas],
      body: linhas,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
    });
    
    const pdfBuffer = doc.output('arraybuffer');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar PDF' });
  }
});

// Rota para gerar Excel diretamente
router.post('/relatorios/gerar-excel', verificarPermissao('relatorios', 'visualizar'), async (req, res) => {
  try {
    const { dados, titulo, abas } = req.body;
    const XLSX = require('xlsx');
    
    const workbook = XLSX.utils.book_new();
    
    if (dados && dados.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(dados);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Principais');
    }
    
    if (abas && abas.length > 0) {
      abas.forEach(aba => {
        if (aba.dados && aba.dados.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(aba.dados);
          XLSX.utils.book_append_sheet(workbook, worksheet, aba.nome);
        }
      });
    }
    
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar Excel' });
  }
});

module.exports = router;
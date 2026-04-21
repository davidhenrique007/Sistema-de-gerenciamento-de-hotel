import * as XLSX from 'xlsx';

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 MTn';
  return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
};

export const exportarRelatorioExcel = (dados, titulo, abas = []) => {
  const workbook = XLSX.utils.book_new();
  
  // Aba principal
  if (dados && dados.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    
    // Ajustar largura das colunas
    const colunas = Object.keys(dados[0] || {});
    const colWidths = colunas.map(col => ({ wch: Math.max(col.length, 15) }));
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Principais');
  }
  
  // Abas adicionais
  if (abas && abas.length > 0) {
    abas.forEach(aba => {
      if (aba.dados && aba.dados.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(aba.dados);
        XLSX.utils.book_append_sheet(workbook, worksheet, aba.nome);
      }
    });
  }
  
  // Salvar arquivo
  XLSX.writeFile(workbook, `${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportarTabelaExcel = (elementId, titulo) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado');
    return;
  }
  
  const table = element.querySelector('table');
  if (!table) {
    console.error('Tabela não encontrada');
    return;
  }
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(workbook, worksheet, titulo);
  XLSX.writeFile(workbook, `${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportarDadosFinanceiros = (dados, titulo) => {
  const workbook = XLSX.utils.book_new();
  
  // Aba de resumo financeiro
  const resumoData = [
    { Métrica: 'Total de Reservas', Valor: dados.totalReservas || 0 },
    { Métrica: 'Receita Total', Valor: formatCurrency(dados.receitaTotal || 0) },
    { Métrica: 'Ticket Médio', Valor: formatCurrency(dados.ticketMedio || 0) },
    { Métrica: 'Taxa de Ocupação', Valor: `${dados.taxaOcupacao || 0}%` },
    { Métrica: 'Cancelamentos', Valor: dados.cancelamentos || 0 }
  ];
  
  const resumoSheet = XLSX.utils.json_to_sheet(resumoData);
  XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo Financeiro');
  
  // Aba de detalhes
  if (dados.detalhes && dados.detalhes.length > 0) {
    const detalhesSheet = XLSX.utils.json_to_sheet(dados.detalhes);
    XLSX.utils.book_append_sheet(workbook, detalhesSheet, 'Detalhes');
  }
  
  XLSX.writeFile(workbook, `${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

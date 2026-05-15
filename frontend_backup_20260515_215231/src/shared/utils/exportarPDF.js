import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 MTn';
  return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const exportarRelatorioPDF = async (dados, titulo, subtitulo, colunas, linhas) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(26, 42, 79);
      doc.text('🏨 Hotel Paradise', 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text(titulo, 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 40);
      
      if (subtitulo) {
        doc.setFontSize(9);
        doc.text(subtitulo, 14, 48);
      }

      // Linha separadora
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 52, 290, 52);

      // Tabela
      if (colunas && linhas && linhas.length > 0) {
        doc.autoTable({
          startY: 58,
          head: [colunas],
          body: linhas,
          theme: 'striped',
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [51, 65, 85]
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          margin: { left: 14, right: 14 }
        });
      }

      // Totais
      const finalY = doc.lastAutoTable?.finalY + 10 || 70;
      
      if (dados?.totais) {
        doc.setFontSize(10);
        doc.setTextColor(26, 42, 79);
        doc.text(`Total: ${formatCurrency(dados.totais.valor)}`, 14, finalY);
        doc.text(`Quantidade: ${dados.totais.quantidade}`, 14, finalY + 7);
      }

      // Rodapé
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Gerado automaticamente pelo Hotel Paradise - Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      resolve(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      reject(error);
    }
  });
};

export const exportarTabelaPDF = (elementId, titulo) => {
  return new Promise((resolve, reject) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        reject(new Error('Elemento não encontrado'));
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFontSize(18);
      doc.setTextColor(26, 42, 79);
      doc.text(`🏨 Hotel Paradise - ${titulo}`, 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 32);

      doc.autoTable({
        html: element,
        startY: 40,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        }
      });

      doc.save(`${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      resolve(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      reject(error);
    }
  });
};

import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Mail, Calendar, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './BotoesExportacao.css';

const BotoesExportacao = ({ 
  tipo, 
  dados, 
  titulo, 
  colunas, 
  linhas, 
  tabelaId,
  onEmailEnviado 
}) => {
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [formato, setFormato] = useState('pdf');

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

  const handleExportarPDF = async () => {
    setLoading(true);
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
      doc.text(titulo || 'Relatório', 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 40);

      // Linha separadora
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 48, 290, 48);

      // Tabela
      if (colunas && colunas.length > 0 && linhas && linhas.length > 0) {
        doc.autoTable({
          startY: 55,
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
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text('Nenhum dado disponível para exportar', 14, 65);
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

      doc.save(`${(titulo || 'relatorio').toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      alert('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = () => {
    setLoading(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Criar dados para exportar
      let exportData = [];
      
      if (linhas && linhas.length > 0 && colunas && colunas.length > 0) {
        // Converter linhas para objetos
        exportData = linhas.map(linha => {
          const obj = {};
          colunas.forEach((col, idx) => {
            obj[col] = linha[idx] || '-';
          });
          return obj;
        });
      } else if (dados && Array.isArray(dados)) {
        exportData = dados;
      } else if (dados && typeof dados === 'object') {
        // Converter objeto para array de arrays
        exportData = Object.entries(dados).map(([key, value]) => ({
          'Métrica': key,
          'Valor': typeof value === 'number' ? formatCurrency(value) : value
        }));
      }
      
      if (exportData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // Ajustar largura das colunas
        const colunasObj = Object.keys(exportData[0] || {});
        const colWidths = colunasObj.map(col => ({ wch: Math.max(col.length, 15) }));
        worksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
      } else {
        // Criar planilha com mensagem de dados vazios
        const emptySheet = XLSX.utils.json_to_sheet([{ 'Mensagem': 'Nenhum dado disponível para exportar' }]);
        XLSX.utils.book_append_sheet(workbook, emptySheet, 'Sem Dados');
      }
      
      XLSX.writeFile(workbook, `${(titulo || 'relatorio').toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert('Excel gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao gerar Excel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!emailDestino) {
      alert('Por favor, informe um e-mail de destino');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/admin/relatorios/enviar-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo: tipo || 'relatorio',
          email: emailDestino,
          titulo: titulo || 'Relatório Hotel Paradise',
          dados: { linhas, colunas },
          formato
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Relatório enviado por e-mail com sucesso!');
        setShowEmailModal(false);
        setEmailDestino('');
        if (onEmailEnviado) onEmailEnviado();
      } else {
        alert(data.message || 'Erro ao enviar e-mail');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      alert('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgendarRelatorio = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/admin/relatorios/agendar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo: tipo || 'relatorio',
          titulo: titulo || 'Relatório Hotel Paradise',
          frequencia: 'diario',
          email: emailDestino || 'admin@hotelparadise.com'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Relatório agendado com sucesso!');
      } else {
        alert(data.message || 'Erro ao agendar relatório');
      }
    } catch (error) {
      console.error('Erro ao agendar:', error);
      alert('Erro ao agendar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="botoesExportacao">
      <button onClick={handleExportarPDF} disabled={loading} className="btnPDF">
        {loading ? <Loader2 size={16} className="spinning" /> : <FileText size={16} />}
        PDF
      </button>
      
      <button onClick={handleExportarExcel} disabled={loading} className="btnExcel">
        {loading ? <Loader2 size={16} className="spinning" /> : <FileSpreadsheet size={16} />}
        Excel
      </button>
      
      <button onClick={() => setShowEmailModal(true)} disabled={loading} className="btnEmail">
        <Mail size={16} />
        Email
      </button>
      
      <button onClick={handleAgendarRelatorio} disabled={loading} className="btnAgendar">
        <Calendar size={16} />
        Agendar
      </button>

      {showEmailModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>Enviar Relatório por E-mail</h3>
            <div className="formGroup">
              <label>E-mail de destino</label>
              <input
                type="email"
                value={emailDestino}
                onChange={(e) => setEmailDestino(e.target.value)}
                placeholder="destinatario@exemplo.com"
                className="emailInput"
              />
            </div>
            <div className="formGroup">
              <label>Formato</label>
              <select value={formato} onChange={(e) => setFormato(e.target.value)} className="formatoSelect">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <div className="modalActions">
              <button onClick={() => setShowEmailModal(false)} className="btnCancelar">Cancelar</button>
              <button onClick={handleEnviarEmail} className="btnConfirmar">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotoesExportacao;

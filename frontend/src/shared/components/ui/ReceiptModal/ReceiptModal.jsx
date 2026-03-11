import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import html2canvas from 'html2canvas'; // REMOVIDO - não está sendo usado
import styles from './ReceiptModal.module.css';

const ReceiptModal = ({ isOpen, onClose, receiptData }) => {
  const receiptRef = useRef(null);

  if (!isOpen) return null;

  const {
    guestName = 'David Henrique António',
    document = '050705017355F',
    roomNumber = '40',
    checkIn = '07/03/2026',
    checkOut = '08/03/2026',
    nights = 1,
    pricePerNight = 7000,
    servicesTotal = 0,
    taxes = 350,
    total = 7350,
    selectedServices = [],
    // NOVOS CAMPOS PARA PROFISSIONALIZAR O RECIBO
    receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    paymentDate = new Date().toLocaleDateString('pt-BR'),
    paymentMethod = 'Cartão' // Idealmente, isso viria do receiptData
  } = receiptData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const roomSubtotal = pricePerNight * nights;

  // ==========================================================================
  // FUNÇÃO PARA GERAR PDF
  // ==========================================================================
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('HOTEL PARADISE', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Recibo de Checkout', 105, 30, { align: 'center' });
    
    // Número do recibo e data
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Recibo Nº: ${receiptNumber}`, 20, 40);
    doc.text(`Data: ${paymentDate}`, 190, 40, { align: 'right' });
    
    // Linha separadora
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    // Informações do hóspede
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Hóspede:', 20, 55);
    doc.setTextColor(0, 0, 0);
    doc.text(guestName, 60, 55);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Documento:', 20, 62);
    doc.setTextColor(0, 0, 0);
    doc.text(document, 60, 62);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Quarto:', 20, 69);
    doc.setTextColor(0, 0, 0);
    doc.text(roomNumber, 60, 69);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Período:', 20, 76);
    doc.setTextColor(0, 0, 0);
    doc.text(`${checkIn} a ${checkOut}`, 60, 76);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Noites:', 20, 83);
    doc.setTextColor(0, 0, 0);
    doc.text(nights.toString(), 60, 83);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Pagamento:', 20, 90);
    doc.setTextColor(0, 0, 0);
    doc.text(paymentMethod, 60, 90);
    
    // Tabela de valores
    const tableData = [];
    
    // Linha do quarto
    tableData.push(['Quarto', formatCurrency(roomSubtotal)]);
    
    // Serviços extras
    if (selectedServices && selectedServices.length > 0) {
      selectedServices.forEach(service => {
        tableData.push([service.name, formatCurrency(service.price)]);
      });
      
      // Linha de total de serviços
      tableData.push(['Total serviços', formatCurrency(servicesTotal)]);
    }
    
    // Taxas
    tableData.push(['Taxas', formatCurrency(taxes)]);
    
    autoTable(doc, {
      startY: 100,
      head: [['Descrição', 'Valor']],
      body: tableData,
      foot: [['TOTAL PAGO', formatCurrency(total)]],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: [37, 99, 235], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    
    // Rodapé
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Obrigado por escolher o Hotel Paradise.', 105, finalY, { align: 'center' });
    
    // Salvar PDF
    doc.save(`recibo_quarto_${roomNumber}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // ==========================================================================
  // FUNÇÃO PARA IMPRIMIR
  // ==========================================================================
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo - Hotel Paradise</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            h1 { color: #2563eb; text-align: center; }
            h2 { color: #333; text-align: center; margin-bottom: 30px; }
            .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
            .info { margin-bottom: 30px; }
            .info p { margin: 8px 0; }
            .label { color: #666; display: inline-block; width: 100px; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #2563eb; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total-row { font-weight: bold; background: #f0f0f0; }
            .total-value { color: #2563eb; font-size: 18px; }
            .footer { text-align: center; margin-top: 40px; color: #888; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>HOTEL PARADISE</h1>
          <h2>Recibo de Checkout</h2>
          
          <div class="receipt-info">
            <span>Recibo Nº: ${receiptNumber}</span>
            <span>Data: ${paymentDate}</span>
          </div>
          
          <div class="info">
            <p><span class="label">Hóspede:</span> ${guestName}</p>
            <p><span class="label">Documento:</span> ${document}</p>
            <p><span class="label">Quarto:</span> ${roomNumber}</p>
            <p><span class="label">Período:</span> ${checkIn} a ${checkOut}</p>
            <p><span class="label">Noites:</span> ${nights}</p>
            <p><span class="label">Pagamento:</span> ${paymentMethod}</p>
          </div>
          
          <table>
            <thead>
              <tr><th>Descrição</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td>Quarto (${nights} noite${nights !== 1 ? 's' : ''})</td><td>${formatCurrency(roomSubtotal)}</td></tr>
              ${selectedServices && selectedServices.length > 0 ? selectedServices.map(service => 
                `<tr><td>${service.name}</td><td>${formatCurrency(service.price)}</td></tr>`
              ).join('') : ''}
              ${selectedServices && selectedServices.length > 0 ? 
                `<tr><td><strong>Total serviços</strong></td><td><strong>${formatCurrency(servicesTotal)}</strong></td></tr>` : ''}
              <tr><td>Taxas</td><td>${formatCurrency(taxes)}</td></tr>
            </tbody>
            <tfoot>
              <tr class="total-row"><td>TOTAL PAGO</td><td class="total-value">${formatCurrency(total)}</td></tr>
            </tfoot>
          </table>
          
          <div class="footer">
            Obrigado por escolher o Hotel Paradise.
          </div>
          
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // ==========================================================================
  // FUNÇÃO PARA ENVIAR POR EMAIL
  // ==========================================================================
  const handleEmail = () => {
    // Criar corpo do email
    const subject = encodeURIComponent(`Recibo de Checkout - Quarto ${roomNumber}`);
    const body = encodeURIComponent(
      `Segue em anexo o recibo de checkout do Hotel Paradise.\n\n` +
      `Recibo Nº: ${receiptNumber}\n` +
      `Data: ${paymentDate}\n` +
      `Hóspede: ${guestName}\n` +
      `Documento: ${document}\n` +
      `Quarto: ${roomNumber}\n` +
      `Período: ${checkIn} a ${checkOut}\n` +
      `Forma de pagamento: ${paymentMethod}\n` +
      `Total pago: ${formatCurrency(total)}\n\n` +
      `Obrigado por escolher o Hotel Paradise.`
    );
    
    // Gerar PDF primeiro
    handleGeneratePDF();
    
    // Abrir cliente de email
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // ==========================================================================
  // FUNÇÃO PARA COMPARTILHAR
  // ==========================================================================
  const handleShare = async () => {
    if (navigator.share) {
      // Web Share API (funciona em dispositivos móveis)
      try {
        await navigator.share({
          title: 'Recibo Hotel Paradise',
          text: `Recibo Nº: ${receiptNumber}\nQuarto ${roomNumber}\nTotal: ${formatCurrency(total)}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado', error);
      }
    } else {
      // Fallback para desktop - copiar para área de transferência
      const shareText = 
        `HOTEL PARADISE - Recibo de Checkout\n` +
        `Recibo Nº: ${receiptNumber}\n` +
        `Data: ${paymentDate}\n` +
        `Hóspede: ${guestName}\n` +
        `Documento: ${document}\n` +
        `Quarto: ${roomNumber}\n` +
        `Período: ${checkIn} a ${checkOut}\n` +
        `Forma de pagamento: ${paymentMethod}\n` +
        `Total pago: ${formatCurrency(total)}`;
      
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Informações copiadas para a área de transferência!');
      }).catch(() => {
        alert('Clique em "Gerar PDF" para compartilhar');
      });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <div className={styles.header}>
          <h2 className={styles.title}>✅ PAGAMENTO CONCLUÍDO</h2>
          <p className={styles.subtitle}>Recibo e Comprovante</p>
        </div>

        {/* Recibo */}
        <div ref={receiptRef} className={styles.receipt}>
          <div className={styles.receiptHeader}>
            <strong>HOTEL PARADISE</strong>
            <span>Recibo de Checkout</span>
          </div>

          {/* Número do recibo e data */}
          <div className={styles.receiptMeta}>
            <span className={styles.metaItem}>Recibo Nº: {receiptNumber}</span>
            <span className={styles.metaItem}>Data: {paymentDate}</span>
          </div>

          <div className={styles.receiptBody}>
            <div className={styles.row}>
              <span>Hóspede:</span>
              <span className={styles.value}>{guestName}</span>
            </div>
            <div className={styles.row}>
              <span>Documento:</span>
              <span className={styles.value}>{document}</span>
            </div>
            <div className={styles.row}>
              <span>Quarto:</span>
              <span className={styles.value}>{roomNumber}</span>
            </div>
            <div className={styles.row}>
              <span>Período:</span>
              <span className={styles.value}>{checkIn} a {checkOut}</span>
            </div>
            <div className={styles.row}>
              <span>Noites:</span>
              <span className={styles.value}>{nights}</span>
            </div>
            <div className={styles.row}>
              <span>Pagamento:</span>
              <span className={styles.value}>{paymentMethod}</span>
            </div>
          </div>

          <div className={styles.receiptTable}>
            <div className={styles.tableHeader}>
              <span>Descrição</span>
              <span>Valor</span>
            </div>
            
            <div className={styles.tableRow}>
              <span>Quarto ({nights} noite{nights !== 1 ? 's' : ''})</span>
              <span>{formatCurrency(roomSubtotal)}</span>
            </div>

            {selectedServices && selectedServices.length > 0 && (
              <>
                {selectedServices.map((service, index) => (
                  <div key={index} className={styles.tableRow}>
                    <span className={styles.serviceName}>{service.name}</span>
                    <span>{formatCurrency(service.price)}</span>
                  </div>
                ))}
                
                <div className={styles.servicesDivider}></div>
                
                <div className={styles.tableRow}>
                  <span className={styles.servicesTotal}>Total serviços</span>
                  <span className={styles.servicesTotalValue}>{formatCurrency(servicesTotal)}</span>
                </div>
              </>
            )}

            <div className={styles.tableRow}>
              <span>Taxas</span>
              <span>{formatCurrency(taxes)}</span>
            </div>

            <div className={styles.tableTotal}>
              <span>Total Pago</span>
              <span className={styles.totalValue}>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className={styles.receiptFooter}>
            Obrigado por escolher o Hotel Paradise.
          </div>
        </div>

        {/* Ações */}
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={handleGeneratePDF}>
            <span className={styles.actionIcon}>📄</span>
            Gerar PDF
          </button>
          <button className={styles.actionButton} onClick={handlePrint}>
            <span className={styles.actionIcon}>🖨️</span>
            Imprimir
          </button>
          <button className={styles.actionButton} onClick={handleEmail}>
            <span className={styles.actionIcon}>📧</span>
            Enviar Email
          </button>
          <button className={styles.actionButton} onClick={handleShare}>
            <span className={styles.actionIcon}>📱</span>
            Compartilhar
          </button>
        </div>

        <button className={styles.closeButton2} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;
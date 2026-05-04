const pool = require('../config/database');
const { Parser } = require('json2csv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class ContabilidadeService {
  async gerarRelatorioFinanceiro(startDate, endDate, categoria = 'todos') {
    const client = await pool.connect();
    
    try {
      console.log(`📊 Gerando relatório financeiro: ${startDate} a ${endDate}`);
      
      let query = `
        SELECT 
          r.reservation_code,
          r.check_in,
          r.check_out,
          r.total_price as valor,
          r.payment_status,
          r.payment_method,
          r.created_at as data_criacao,
          rm.type as tipo_quarto,
          rm.room_number,
          g.name as guest_name,
          g.email as guest_email,
          (r.check_out - r.check_in) as noites_intervalo
        FROM reservations r
        INNER JOIN rooms rm ON r.room_id = rm.id
        INNER JOIN guests g ON r.guest_id = g.id
        WHERE r.status = 'confirmed'
        AND r.check_in BETWEEN $1 AND $2
      `;
      
      const params = [startDate, endDate];
      
      if (categoria !== 'todos') {
        query += ` AND rm.type = $3`;
        params.push(categoria);
      }
      
      query += ` ORDER BY r.check_in DESC`;
      
      const result = await client.query(query, params);
      const reservas = result.rows.map(r => {
        let noites = 1;
        if (r.noites_intervalo) {
          const dias = parseFloat(r.noites_intervalo);
          noites = Math.max(1, Math.round(dias));
        }
        return {
          ...r,
          noites
        };
      });
      
      const totalReceita = reservas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
      const totalPago = reservas
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + parseFloat(r.valor), 0);
      const totalPendente = reservas
        .filter(r => r.payment_status !== 'paid')
        .reduce((sum, r) => sum + parseFloat(r.valor), 0);
      
      const porTipoQuarto = {};
      reservas.forEach(r => {
        if (!porTipoQuarto[r.tipo_quarto]) {
          porTipoQuarto[r.tipo_quarto] = { quantidade: 0, valor: 0, noites: 0 };
        }
        porTipoQuarto[r.tipo_quarto].quantidade++;
        porTipoQuarto[r.tipo_quarto].valor += parseFloat(r.valor);
        porTipoQuarto[r.tipo_quarto].noites += parseInt(r.noites);
      });
      
      const porMetodoPagamento = {};
      reservas.forEach(r => {
        const metodo = r.payment_method || 'nao_informado';
        if (!porMetodoPagamento[metodo]) {
          porMetodoPagamento[metodo] = { quantidade: 0, valor: 0 };
        }
        porMetodoPagamento[metodo].quantidade++;
        porMetodoPagamento[metodo].valor += parseFloat(r.valor);
      });
      
      const porMes = {};
      reservas.forEach(r => {
        const mes = new Date(r.check_in).toLocaleString('pt', { month: 'long', year: 'numeric' });
        if (!porMes[mes]) {
          porMes[mes] = { quantidade: 0, valor: 0 };
        }
        porMes[mes].quantidade++;
        porMes[mes].valor += parseFloat(r.valor);
      });
      
      const taxaImposto = 0.05;
      const impostos = {
        base: totalReceita,
        taxa: taxaImposto * 100,
        valor: totalReceita * taxaImposto,
        total: totalReceita + (totalReceita * taxaImposto)
      };
      
      return {
        success: true,
        periodo: { startDate, endDate },
        resumo: {
          totalReservas: reservas.length,
          totalReceita,
          totalPago,
          totalPendente,
          taxaOcupacao: reservas.length > 0 ? (reservas.length / 43) * 100 : 0
        },
        detalhes: { porTipoQuarto, porMetodoPagamento, porMes },
        impostos,
        dados: reservas
      };
      
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async exportarCSV(relatorio) {
    try {
      const dados = relatorio.dados.map(r => ({
        'Código': r.reservation_code,
        'Cliente': r.guest_name,
        'Email': r.guest_email,
        'Check-in': new Date(r.check_in).toLocaleDateString('pt-BR'),
        'Check-out': new Date(r.check_out).toLocaleDateString('pt-BR'),
        'Noites': r.noites,
        'Quarto': `${r.room_number} - ${r.tipo_quarto}`,
        'Valor (MTn)': r.valor,
        'Status Pagamento': r.payment_status === 'paid' ? 'Pago' : 'Pendente',
        'Método': r.payment_method || '-',
        'Data Criação': new Date(r.data_criacao).toLocaleDateString('pt-BR')
      }));
      
      const parser = new Parser({
        fields: ['Código', 'Cliente', 'Email', 'Check-in', 'Check-out', 'Noites', 'Quarto', 'Valor (MTn)', 'Status Pagamento', 'Método', 'Data Criação']
      });
      
      const csv = parser.parse(dados);
      const resumoCSV = `\n\n"RESUMO","${relatorio.periodo.startDate} a ${relatorio.periodo.endDate}"\n"Total de Reservas",${relatorio.resumo.totalReservas}\n"Receita Total",${relatorio.resumo.totalReceita}\n"Total Pago",${relatorio.resumo.totalPago}\n"Total Pendente",${relatorio.resumo.totalPendente}\n"Taxa de Ocupação",${relatorio.resumo.taxaOcupacao.toFixed(2)}%\n"IVA (${relatorio.impostos.taxa}%)",${relatorio.impostos.valor}\n"Total com IVA",${relatorio.impostos.total}`;
      
      return csv + resumoCSV;
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw error;
    }
  }
  
  async exportarXML(relatorio) {
    const timestamp = new Date().toISOString();
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    let xml = `${xmlHeader}<relatorioFinanceiro xmlns="http://hotelparadise.com/financeiro" data="${timestamp}">\n`;
    xml += `  <periodo>\n    <inicio>${relatorio.periodo.startDate}</inicio>\n    <fim>${relatorio.periodo.endDate}</fim>\n  </periodo>\n`;
    xml += `  <resumo>\n    <totalReservas>${relatorio.resumo.totalReservas}</totalReservas>\n    <totalReceita>${relatorio.resumo.totalReceita}</totalReceita>\n    <totalPago>${relatorio.resumo.totalPago}</totalPago>\n    <totalPendente>${relatorio.resumo.totalPendente}</totalPendente>\n    <taxaOcupacao>${relatorio.resumo.taxaOcupacao.toFixed(2)}</taxaOcupacao>\n  </resumo>\n`;
    xml += `  <impostos>\n    <base>${relatorio.impostos.base}</base>\n    <taxa>${relatorio.impostos.taxa}</taxa>\n    <valor>${relatorio.impostos.valor}</valor>\n    <total>${relatorio.impostos.total}</total>\n  </impostos>\n`;
    xml += `  <detalhes>\n`;
    
    for (const reserva of relatorio.dados) {
      xml += `    <reserva>\n`;
      xml += `      <codigo>${this.escapeXml(reserva.reservation_code)}</codigo>\n`;
      xml += `      <cliente>${this.escapeXml(reserva.guest_name)}</cliente>\n`;
      xml += `      <email>${this.escapeXml(reserva.guest_email)}</email>\n`;
      xml += `      <checkin>${reserva.check_in}</checkin>\n`;
      xml += `      <checkout>${reserva.check_out}</checkout>\n`;
      xml += `      <noites>${reserva.noites}</noites>\n`;
      xml += `      <quarto numero="${reserva.room_number}" tipo="${reserva.tipo_quarto}"/>\n`;
      xml += `      <valor>${reserva.valor}</valor>\n`;
      xml += `      <statusPagamento>${reserva.payment_status}</statusPagamento>\n`;
      xml += `      <metodoPagamento>${reserva.payment_method || ''}</metodoPagamento>\n`;
      xml += `    </reserva>\n`;
    }
    xml += `  </detalhes>\n</relatorioFinanceiro>`;
    
    return xml;
  }
  
  escapeXml(str) {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, function(c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
  
  async gerarRelatorioContabil(startDate, endDate) {
    const relatorio = await this.gerarRelatorioFinanceiro(startDate, endDate);
    const contabil = {
      ...relatorio,
      contabilidade: {
        lancamentos: relatorio.dados.map(r => ({
          data: r.data_criacao || r.check_in,
          conta: '4110 - Clientes',
          historico: `Reserva ${r.reservation_code} - ${r.guest_name}`,
          debito: r.payment_status === 'paid' ? r.valor : 0,
          credito: r.payment_status !== 'paid' ? r.valor : 0
        })),
        resumoContabil: {
          totalDebito: relatorio.dados.filter(r => r.payment_status === 'paid').reduce((s, r) => s + r.valor, 0),
          totalCredito: relatorio.dados.filter(r => r.payment_status !== 'paid').reduce((s, r) => s + r.valor, 0),
          saldo: relatorio.resumo.totalPago - relatorio.resumo.totalPendente
        }
      }
    };
    return contabil;
  }
  
  async salvarRelatorio(relatorio, formato) {
    const id = uuidv4();
    const filename = `relatorio_${new Date().toISOString().split('T')[0]}_${id}.${formato}`;
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    const filepath = path.join(exportsDir, filename);
    
    let conteudo;
    if (formato === 'csv') {
      conteudo = await this.exportarCSV(relatorio);
    } else if (formato === 'xml') {
      conteudo = await this.exportarXML(relatorio);
    } else {
      throw new Error(`Formato ${formato} não suportado`);
    }
    
    fs.writeFileSync(filepath, conteudo, 'utf8');
    return { id, filename, filepath, formato, data: new Date().toISOString() };
  }
}

module.exports = new ContabilidadeService();

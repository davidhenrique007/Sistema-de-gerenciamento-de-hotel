// backend/services/jobs/relatorioJob.js
const cron = require('node-cron');
const db = require('../../config/database');
const exportacaoService = require('../exportacaoService');

class RelatorioJob {
  constructor() {
    this.jobs = [];
    this.inicializarJobs();
  }

  inicializarJobs() {
    // Job diário - 08:00
    this.jobs.push(
      cron.schedule('0 8 * * *', async () => {
        console.log('📊 Executando relatório diário...');
        await this.gerarRelatorioDiario();
      })
    );

    // Job semanal - Segunda-feira 09:00
    this.jobs.push(
      cron.schedule('0 9 * * 1', async () => {
        console.log('📊 Executando relatório semanal...');
        await this.gerarRelatorioSemanal();
      })
    );

    // Job mensal - Dia 1 às 10:00
    this.jobs.push(
      cron.schedule('0 10 1 * *', async () => {
        console.log('📊 Executando relatório mensal...');
        await this.gerarRelatorioMensal();
      })
    );

    console.log('✅ Jobs de relatórios agendados iniciados');
  }

  async gerarRelatorioDiario() {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const reservas = await db.query(`
        SELECT COUNT(*) as total, COALESCE(SUM(total_price), 0) as receita
        FROM reservations
        WHERE check_in::date = $1 AND status = 'confirmed'
      `, [hoje]);

      const ocupacao = await db.query(`
        SELECT COUNT(*) as ocupados FROM rooms WHERE status = 'occupied'
      `);

      const destinatarios = await db.query(`
        SELECT email FROM users WHERE role = 'admin' OR role = 'financial'
      `);

      const relatorioData = {
        titulo: 'Relatório Diário',
        data: hoje,
        reservas: reservas.rows[0].total,
        receita: reservas.rows[0].receita,
        ocupacao: ocupacao.rows[0].ocupados
      };

      for (const dest of destinatarios.rows) {
        await exportacaoService.enviarRelatorioEmail({
          email: dest.email,
          titulo: `Relatório Diário - ${hoje}`,
          conteudo: relatorioData,
          formato: 'pdf'
        });
      }

      console.log('✅ Relatório diário enviado com sucesso');
    } catch (error) {
      console.error('Erro no relatório diário:', error);
    }
  }

  async gerarRelatorioSemanal() {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 7);
      
      const reservas = await db.query(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(total_price), 0) as receita,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pendentes
        FROM reservations
        WHERE check_in >= $1 AND status = 'confirmed'
      `, [dataInicio]);

      const destinatarios = await db.query(`
        SELECT email FROM users WHERE role = 'admin'
      `);

      for (const dest of destinatarios.rows) {
        await exportacaoService.enviarRelatorioEmail({
          email: dest.email,
          titulo: 'Relatório Semanal',
          conteudo: reservas.rows[0],
          formato: 'excel'
        });
      }

      console.log('✅ Relatório semanal enviado com sucesso');
    } catch (error) {
      console.error('Erro no relatório semanal:', error);
    }
  }

  async gerarRelatorioMensal() {
    try {
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 1);
      
      const reservas = await db.query(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(total_price), 0) as receita,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelamentos
        FROM reservations
        WHERE check_in >= $1
      `, [dataInicio]);

      const destinatarios = await db.query(`
        SELECT email FROM users WHERE role = 'admin'
      `);

      for (const dest of destinatarios.rows) {
        await exportacaoService.enviarRelatorioEmail({
          email: dest.email,
          titulo: 'Relatório Mensal',
          conteudo: reservas.rows[0],
          formato: 'pdf'
        });
      }

      console.log('✅ Relatório mensal enviado com sucesso');
    } catch (error) {
      console.error('Erro no relatório mensal:', error);
    }
  }

  async agendarRelatorioPersonalizado({ tipo, frequencia, email, parametros }) {
    const jobId = uuidv4();
    let schedulePattern = '';
    
    switch(frequencia) {
      case 'diario':
        schedulePattern = '0 8 * * *';
        break;
      case 'semanal':
        schedulePattern = '0 9 * * 1';
        break;
      case 'mensal':
        schedulePattern = '0 10 1 * *';
        break;
      default:
        return { success: false, error: 'Frequência inválida' };
    }
    
    const job = cron.schedule(schedulePattern, async () => {
      console.log(`📊 Executando relatório agendado: ${tipo}`);
      await this.gerarRelatorioPersonalizado({ tipo, email, parametros });
    });
    
    this.jobs.push(job);
    
    // Salvar no banco
    await db.query(`
      INSERT INTO relatorios_agendados (id, tipo, frequencia, email, parametros, criado_em)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [jobId, tipo, frequencia, email, JSON.stringify(parametros)]);
    
    return { success: true, jobId };
  }

  async gerarRelatorioPersonalizado({ tipo, email, parametros }) {
    try {
      let dados = {};
      
      if (tipo === 'financeiro') {
        const result = await db.query(`
          SELECT 
            COUNT(*) as total_reservas,
            COALESCE(SUM(total_price), 0) as receita_total
          FROM reservations
          WHERE status = 'confirmed'
          AND check_in >= $1
        `, [parametros.dataInicio || new Date()]);
        dados = result.rows[0];
      }
      
      await exportacaoService.enviarRelatorioEmail({
        email,
        titulo: `Relatório ${tipo}`,
        conteudo: dados,
        formato: 'pdf'
      });
      
      console.log(`✅ Relatório personalizado ${tipo} enviado`);
    } catch (error) {
      console.error('Erro no relatório personalizado:', error);
    }
  }
}

module.exports = new RelatorioJob();
// backend/services/jobs/liberarQuartosJob.js
const cron = require('node-cron');
const reconciliacaoService = require('../reconciliacaoService');

class LiberarQuartosJob {
    constructor() {
        this.isRunning = false;
        this.job = null;
    }
    
    start(schedule = '*/30 * * * *') {
        if (this.job) {
            console.log('⚠️ Job já está em execução');
            return;
        }
        
        console.log(`⏰ Iniciando job de liberação de quartos (${schedule})`);
        
        this.job = cron.schedule(schedule, async () => {
            await this.execute();
        });
        
        // Executar uma vez ao iniciar
        setTimeout(() => this.execute(), 5000);
    }
    
    stop() {
        if (this.job) {
            this.job.stop();
            this.job = null;
            console.log('⏹️ Job de liberação de quartos parado');
        }
    }
    
    async execute() {
        if (this.isRunning) {
            console.log('⚠️ Job já está em execução, ignorando...');
            return;
        }
        
        this.isRunning = true;
        
        try {
            console.log('\n🔄 =========================================');
            console.log('🚀 Executando job de liberação de quartos');
            console.log('=========================================');
            
            // Verificar status atual
            const status = await reconciliacaoService.verificarReservasPendentes();
            console.log(`📈 Status atual: ${status.total} pendentes, ${status.proximas_12h} expiram em 12h, ${status.expiradas} expiradas`);
            
            // Liberar reservas expiradas (24h)
            if (status.expiradas > 0) {
                console.log(`🗑️ Liberando ${status.expiradas} reservas expiradas...`);
                const resultado = await reconciliacaoService.liberarReservasPendentes(24);
                console.log(`✅ ${resultado.canceladas} reservas canceladas, ${resultado.erros} erros`);
            } else {
                console.log('✅ Nenhuma reserva expirada encontrada');
            }
            
            console.log('✅ Job concluído com sucesso');
            console.log('=========================================\n');
            
        } catch (error) {
            console.error('❌ Erro ao executar job:', error);
        } finally {
            this.isRunning = false;
        }
    }
}

module.exports = new LiberarQuartosJob();

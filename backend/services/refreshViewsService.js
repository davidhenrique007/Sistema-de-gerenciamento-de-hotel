// backend/services/refreshViewsService.js
const { Pool } = require('pg');
const pool = require('../config/database');

class RefreshViewsService {
    constructor() {
        this.isRefreshing = false;
        this.lastRefresh = null;
        this.refreshInterval = null;
    }

    async refreshMaterializedView(viewName, concurrent = true) {
        const client = await pool.connect();
        try {
            console.log(`🔄 Atualizando view: ${viewName}`);
            const startTime = Date.now();
            
            const sql = concurrent 
                ? `REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`
                : `REFRESH MATERIALIZED VIEW ${viewName}`;
            
            await client.query(sql);
            
            const duration = Date.now() - startTime;
            console.log(`✅ View ${viewName} atualizada em ${duration}ms`);
            
            return { success: true, viewName, duration };
        } catch (error) {
            console.error(`❌ Erro ao atualizar ${viewName}:`, error.message);
            return { success: false, viewName, error: error.message };
        } finally {
            client.release();
        }
    }

    async refreshAllViews() {
        if (this.isRefreshing) {
            console.log('⚠️ Refresh já em andamento...');
            return;
        }

        this.isRefreshing = true;
        console.log('🔄 Iniciando refresh de todas as materialized views...');
        
        const views = [
            'receita_por_periodo_mv',
            'ocupacao_por_periodo_mv',
            'pagamentos_resumo_mv',
            'fluxo_caixa_projetado_mv',
            'cancelamentos_resumo_mv',
            'dashboard_metrics_mv'
        ];
        
        const results = [];
        for (const view of views) {
            const result = await this.refreshMaterializedView(view, true);
            results.push(result);
            // Pequena pausa entre views
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.lastRefresh = new Date();
        this.isRefreshing = false;
        
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Refresh concluído: ${successCount}/${views.length} views atualizadas`);
        
        return { results, lastRefresh: this.lastRefresh };
    }

    startAutoRefresh(intervalMinutes = 60) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        console.log(`⏰ Agendando refresh automático a cada ${intervalMinutes} minutos`);
        
        // Primeiro refresh imediato
        this.refreshAllViews();
        
        // Agendar refreshes periódicos
        this.refreshInterval = setInterval(() => {
            this.refreshAllViews();
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('⏹️ Refresh automático parado');
        }
    }

    async getViewStatus() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    schemaname,
                    matviewname as view_name,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
                    (SELECT COUNT(*) FROM receita_por_periodo_mv) as total_records
                FROM pg_matviews
                WHERE schemaname = 'public'
                ORDER BY matviewname
            `);
            return {
                lastRefresh: this.lastRefresh,
                views: result.rows
            };
        } finally {
            client.release();
        }
    }
}

module.exports = new RefreshViewsService();
// backend/controllers/admin/relatorioOtimizadoController.js
const pool = require('../../config/database');
const refreshViewsService = require('../../services/refreshViewsService');

class RelatorioOtimizadoController {
    async getReceitaRapida(req, res) {
        try {
            const { periodo = 'mes', metodo = null } = req.query;
            
            let query = `
                SELECT 
                    CASE 
                        WHEN $1 = 'dia' THEN dia::date
                        WHEN $1 = 'mes' THEN mes::date
                        ELSE ano::date
                    END as periodo,
                    SUM(receita_total) as receita_total,
                    SUM(total_reservas) as total_reservas,
                    AVG(ticket_medio) as ticket_medio
                FROM receita_por_periodo_mv
                WHERE 1=1
            `;
            
            const params = [periodo];
            
            if (metodo && metodo !== 'todos') {
                query += ` AND payment_method = $2`;
                params.push(metodo);
            }
            
            query += ` GROUP BY periodo ORDER BY periodo DESC LIMIT 12`;
            
            const result = await pool.query(query, params);
            
            res.json({
                success: true,
                data: result.rows,
                cache: 'materialized_view',
                ultima_atualizacao: refreshViewsService.lastRefresh
            });
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async getOcupacaoRapida(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    mes::date as mes,
                    tipo_quarto,
                    SUM(reservas) as total_reservas,
                    AVG(taxa_ocupacao) as taxa_ocupacao_media,
                    SUM(receita_gerada) as receita
                FROM ocupacao_por_periodo_mv
                WHERE mes >= DATE_TRUNC('month', NOW() - INTERVAL '6 months')
                GROUP BY mes, tipo_quarto
                ORDER BY mes DESC, tipo_quarto
            `);
            
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async getPagamentosRapidos(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    mes::date as mes,
                    metodo,
                    SUM(quantidade) as total_transacoes,
                    SUM(valor_total) as valor_total,
                    SUM(inadimplentes) as inadimplentes,
                    SUM(valor_inadimplente) as valor_inadimplente
                FROM pagamentos_resumo_mv
                WHERE mes >= DATE_TRUNC('month', NOW() - INTERVAL '6 months')
                GROUP BY mes, metodo
                ORDER BY mes DESC, metodo
            `);
            
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async getDashboardRapido(req, res) {
        try {
            const result = await pool.query(`
                SELECT * FROM dashboard_metrics_mv
                WHERE data = CURRENT_DATE
            `);
            
            res.json({ 
                success: true, 
                data: result.rows[0] || {},
                cache: 'materialized_view',
                atualizado_em: refreshViewsService.lastRefresh
            });
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async refreshViews(req, res) {
        // Verificar permissão de admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
        
        const result = await refreshViewsService.refreshAllViews();
        res.json({ success: true, data: result });
    }
    
    async getPerformanceMetrics(req, res) {
        try {
            // Analisar performance das queries
            const explainResult = await pool.query(`
                EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
                SELECT * FROM receita_por_periodo_mv LIMIT 100
            `);
            
            const viewStatus = await refreshViewsService.getViewStatus();
            
            res.json({
                success: true,
                data: {
                    explain: explainResult.rows[0],
                    views: viewStatus,
                    lastRefresh: refreshViewsService.lastRefresh
                }
            });
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new RelatorioOtimizadoController();
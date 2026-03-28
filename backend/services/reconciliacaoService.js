// backend/services/reconciliacaoService.js
const pool = require('../config/database');

class ReconciliacaoService {
    async liberarReservasPendentes(horasLimite = 24) {
        const client = await pool.connect();
        
        try {
            console.log(`🔄 Iniciando liberação de reservas pendentes (${horasLimite}h)`);
            
            await client.query('BEGIN');
            
            // Buscar reservas pendentes expiradas
            const reservasExpiradas = await client.query(`
                SELECT 
                    r.id,
                    r.reservation_code,
                    r.check_in,
                    r.check_out,
                    r.total_price,
                    r.created_at,
                    r.room_id,
                    rm.room_number,
                    g.name as guest_name,
                    g.email
                FROM reservations r
                INNER JOIN rooms rm ON r.room_id = rm.id
                INNER JOIN guests g ON r.guest_id = g.id
                WHERE r.status = 'pending'
                    AND r.payment_status = 'pending'
                    AND r.created_at <= NOW() - INTERVAL '${horasLimite} hours'
            `);
            
            console.log(`📊 Encontradas ${reservasExpiradas.rows.length} reservas expiradas`);
            
            const resultados = {
                total: reservasExpiradas.rows.length,
                canceladas: 0,
                erros: 0,
                detalhes: []
            };
            
            for (const reserva of reservasExpiradas.rows) {
                try {
                    // Atualizar reserva para status CANCELADO
                    // Usar apenas valores permitidos pela constraint
                    await client.query(`
                        UPDATE reservations 
                        SET status = 'cancelled',
                            payment_status = 'pending',
                            cancellation_reason = $1,
                            cancellation_date = NOW(),
                            updated_at = NOW()
                        WHERE id = $2
                    `, [`Pagamento não confirmado em até ${horasLimite}h`, reserva.id]);
                    
                    // Liberar quarto
                    await client.query(`
                        UPDATE rooms 
                        SET status = 'available', 
                            updated_at = NOW()
                        WHERE id = $1
                    `, [reserva.room_id]);
                    
                    resultados.canceladas++;
                    resultados.detalhes.push({
                        codigo: reserva.reservation_code,
                        quarto: reserva.room_number,
                        status: 'cancelada'
                    });
                    
                    console.log(`✅ Reserva ${reserva.reservation_code} (Quarto ${reserva.room_number}) cancelada`);
                    
                } catch (error) {
                    console.error(`❌ Erro ao processar reserva ${reserva.reservation_code}:`, error.message);
                    resultados.erros++;
                }
            }
            
            await client.query('COMMIT');
            
            console.log(`📊 Resumo: ${resultados.canceladas} canceladas, ${resultados.erros} erros`);
            
            return resultados;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Erro ao liberar reservas:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    
    async verificarReservasPendentes() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN created_at <= NOW() - INTERVAL '12 hours' THEN 1 END) as proximas_12h,
                COUNT(CASE WHEN created_at <= NOW() - INTERVAL '24 hours' THEN 1 END) as expiradas
            FROM reservations
            WHERE status = 'pending' 
                AND payment_status = 'pending'
        `);
        
        return result.rows[0];
    }
}

module.exports = new ReconciliacaoService();

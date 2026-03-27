// backend/controllers/pagamentoController.js
const pool = require('../config/database');
const { startPaymentTimeout } = require('../utils/paymentTimeout');

class PagamentoController {
    async iniciarPagamentoMpesa(req, res) {
        const { reservaId, telefone, valor } = req.body;

        try {
            console.log(`💰 Iniciando pagamento para reserva: ${reservaId}`);
            console.log(`📞 Telefone: ${telefone}, Valor: ${valor} MZN`);

            let reservaRealId = null;
            
            // Tentar encontrar a reserva por ID (UUID) ou reservation_code
            try {
                // Tentar como UUID primeiro
                const reserva = await pool.query(
                    `SELECT id, status, total_price, payment_status 
                     FROM reservations 
                     WHERE id = $1`,
                    [reservaId]
                );
                
                if (reserva.rows.length > 0) {
                    reservaRealId = reserva.rows[0].id;
                    console.log(`✅ Reserva encontrada por ID: ${reservaRealId}`);
                }
            } catch (uuidError) {
                console.log('⚠️ Não é UUID, tentando por reservation_code...');
                // Se não for UUID, tentar por reservation_code
                const reserva = await pool.query(
                    `SELECT id, status, total_price, payment_status 
                     FROM reservations 
                     WHERE reservation_code = $1`,
                    [reservaId]
                );
                
                if (reserva.rows.length > 0) {
                    reservaRealId = reserva.rows[0].id;
                    console.log(`✅ Reserva encontrada por código: ${reservaRealId}`);
                }
            }
            
            // Se não encontrou reserva, criar uma nova
            if (!reservaRealId) {
                console.log('⚠️ Reserva não encontrada, criando reserva temporária...');
                
                // Buscar um quarto disponível
                const quarto = await pool.query(
                    `SELECT id FROM rooms WHERE status = 'available' LIMIT 1`
                );
                
                if (quarto.rows.length === 0) {
                    return res.status(404).json({
                        error: true,
                        message: 'Nenhum quarto disponível'
                    });
                }
                
                // Buscar um guest
                const guest = await pool.query(
                    `SELECT id FROM guests LIMIT 1`
                );
                
                let guestId = null;
                if (guest.rows.length === 0) {
                    // Criar guest temporário
                    const newGuest = await pool.query(
                        `INSERT INTO guests (first_name, last_name, phone, email)
                         VALUES ($1, $2, $3, $4)
                         RETURNING id`,
                        ['Cliente', 'Teste', '841234567', 'cliente@teste.com']
                    );
                    guestId = newGuest.rows[0].id;
                } else {
                    guestId = guest.rows[0].id;
                }
                
                // Buscar um usuário
                const user = await pool.query(
                    `SELECT id FROM users LIMIT 1`
                );
                
                let userId = null;
                if (user.rows.length === 0) {
                    // Criar usuário temporário
                    const bcrypt = require('bcryptjs');
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash('123456', salt);
                    const newUser = await pool.query(
                        `INSERT INTO users (name, email, password_hash, role, is_active)
                         VALUES ($1, $2, $3, $4, $5)
                         RETURNING id`,
                        ['Cliente Teste', 'cliente@teste.com', hash, 'client', true]
                    );
                    userId = newUser.rows[0].id;
                } else {
                    userId = user.rows[0].id;
                }
                
                // Criar reserva
                const checkIn = new Date();
                const checkOut = new Date();
                checkOut.setDate(checkOut.getDate() + 1);
                
                const novaReserva = await pool.query(
                    `INSERT INTO reservations (
                        reservation_code, guest_id, room_id, user_id,
                        check_in, check_out, adults_count, children_count,
                        base_price, total_price, status, payment_status, source
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, 2, 0, $7, $7, 'pending', 'pending', 'website'
                    ) RETURNING id`,
                    [`TEMP_${Date.now()}`, guestId, quarto.rows[0].id, userId, checkIn, checkOut, valor]
                );
                
                reservaRealId = novaReserva.rows[0].id;
                console.log(`✅ Reserva temporária criada: ${reservaRealId}`);
            }

            // Verificar status do pagamento
            const reservaStatus = await pool.query(
                `SELECT payment_status FROM reservations WHERE id = $1`,
                [reservaRealId]
            );
            
            if (reservaStatus.rows[0]?.payment_status === 'paid') {
                return res.status(400).json({
                    error: true,
                    message: 'Pagamento já foi realizado'
                });
            }

            // Gerar referência única
            const transactionId = `SIM_${Date.now()}`;

            // Atualizar status da reserva
            await pool.query(
                `UPDATE reservations 
                 SET payment_status = 'pending',
                     status = 'pending',
                     updated_at = NOW()
                 WHERE id = $1`,
                [reservaRealId]
            );

            // Iniciar timeout
            startPaymentTimeout(reservaRealId, transactionId);

            return res.status(200).json({
                success: true,
                transactionId: transactionId,
                status: 'pending',
                message: 'Pagamento iniciado. Aguarde confirmação.',
                reservaId: reservaRealId
            });

        } catch (error) {
            console.error('❌ Erro detalhado ao iniciar pagamento:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao processar pagamento',
                details: error.message
            });
        }
    }

    async consultarPagamento(req, res) {
        const { reservaId } = req.params;

        try {
            let reservaRealId = null;
            
            // Tentar encontrar a reserva
            try {
                const reserva = await pool.query(
                    `SELECT payment_status FROM reservations WHERE id = $1`,
                    [reservaId]
                );
                if (reserva.rows.length > 0) {
                    reservaRealId = reserva.rows[0];
                }
            } catch {
                const reserva = await pool.query(
                    `SELECT payment_status FROM reservations WHERE reservation_code = $1`,
                    [reservaId]
                );
                if (reserva.rows.length > 0) {
                    reservaRealId = reserva.rows[0];
                }
            }

            if (!reservaRealId) {
                return res.json({
                    success: true,
                    status: 'pending',
                    message: 'Processando pagamento...'
                });
            }

            return res.json({
                success: true,
                status: reservaRealId.payment_status,
                message: this.getStatusMessage(reservaRealId.payment_status)
            });

        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao consultar pagamento'
            });
        }
    }

    getStatusMessage(status) {
        const messages = {
            'pending': 'pendente de confirmação',
            'paid': 'confirmado',
            'failed': 'falhou',
            'cancelled': 'cancelado',
            'expired': 'expirado'
        };
        return messages[status] || status;
    }
}

module.exports = new PagamentoController();

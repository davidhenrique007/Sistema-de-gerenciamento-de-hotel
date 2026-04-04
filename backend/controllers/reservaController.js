const pool = require('../config/database');

const SERVICOS_CATALOGO = {
    cafe_manha: { nome: 'Café da manhã', preco: 300, tipo: 'por_noite' },
    spa: { nome: 'Spa & Bem-estar', preco: 2000, tipo: 'por_noite' },
    piscina: { nome: 'Piscina aquecida', preco: 1000, tipo: 'por_noite' },
    academia: { nome: 'Academia moderna', preco: 1500, tipo: 'por_noite' },
    translado: { nome: 'Translado aeroporto', preco: 1000, tipo: 'unico' },
    wifi_premium: { nome: 'Wi-Fi Premium', preco: 500, tipo: 'por_noite' }
};

const criarReserva = async (req, res) => {
    try {
        const { 
            room_id, room_ids, check_in, check_out, adults_count, children_count,
            guest_name, guest_phone, guest_document, guest_email,
            payment_method, servicos 
        } = req.body;

        console.log('📝 Criando reserva:', { room_id, check_in, check_out, guest_name, servicos });

        const quartoId = room_id || (room_ids && room_ids[0]);

        if (!quartoId) {
            return res.status(400).json({ success: false, message: 'Quarto não selecionado' });
        }

        // Verificar se cliente existe
        let cliente = await pool.query('SELECT id FROM guests WHERE phone = $1', [guest_phone]);
        let guestId;

        if (cliente.rows.length === 0) {
            const newCliente = await pool.query(
                'INSERT INTO guests (name, phone, email, document) VALUES ($1, $2, $3, $4) RETURNING id',
                [guest_name, guest_phone, guest_email || null, guest_document || null]
            );
            guestId = newCliente.rows[0].id;
        } else {
            guestId = cliente.rows[0].id;
        }

        // Buscar admin
        const admin = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const userId = admin.rows[0]?.id || 'a663cbb8-556b-4b0a-a2c8-065fe24e515a';

        // Calcular noites
        const noites = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));

        // Buscar preço do quarto
        const quarto = await pool.query('SELECT price_per_night, room_number, type FROM rooms WHERE id = $1', [quartoId]);
        const pricePerNight = parseFloat(quarto.rows[0]?.price_per_night) || 3000;
        const totalQuartos = pricePerNight * noites;

        // Calcular serviços
        const servicosIds = Array.isArray(servicos) ? servicos : [];
        let totalServicos = 0;
        const servicosParaGuardar = [];

        for (const sid of servicosIds) {
            const cat = SERVICOS_CATALOGO[sid];
            if (cat) {
                const precoTotal = cat.tipo === 'por_noite' ? cat.preco * noites : cat.preco;
                totalServicos += precoTotal;
                servicosParaGuardar.push({
                    nome: cat.nome,
                    tipo: cat.tipo,
                    preco: cat.preco,
                    precoTotal,
                    noites: cat.tipo === 'por_noite' ? noites : 1
                });
            }
        }

        // Calcular total
        const basePrice = totalQuartos + totalServicos;
        const taxAmount = basePrice * 0.05;
        const totalPrice = basePrice + taxAmount;

        console.log(`💰 Quartos: ${totalQuartos} | Serviços: ${totalServicos} | Base: ${basePrice} | Taxa: ${taxAmount} | TOTAL: ${totalPrice}`);

        // Criar reserva
        const result = await pool.query(
            `INSERT INTO reservations (
                guest_id, room_id, user_id, check_in, check_out, 
                adults_count, children_count, rooms_count, 
                base_price, tax_amount, total_price, 
                payment_method, status, payment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', 'pending') 
            RETURNING *`,
            [guestId, quartoId, userId, check_in, check_out, adults_count || 1, children_count || 0, 1, basePrice, taxAmount, totalPrice, payment_method || 'dinheiro']
        );

        const reserva = result.rows[0];

        // Guardar serviços
        for (const s of servicosParaGuardar) {
            await pool.query(
                `INSERT INTO reservation_services (
                    reservation_id, service_name, service_type, price_per_unit, nights, total_price
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [reserva.id, s.nome, s.tipo, s.preco, s.noites, s.precoTotal]
            );
        }

        // Marcar quarto como ocupado
        await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['occupied', quartoId]);

        res.status(201).json({
            success: true,
            data: {
                ...reserva,
                noites,
                servicos: servicosParaGuardar
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar reserva:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar reserva' });
    }
};

const buscarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT r.*, g.name as guest_name, g.email as guest_email, g.phone as guest_phone,
                   rm.room_number, rm.type as room_type, rm.price_per_night
            FROM reservations r
            JOIN guests g ON r.guest_id = g.id
            JOIN rooms rm ON r.room_id = rm.id
            WHERE r.reservation_code = $1 OR r.id::text = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
        }

        const reserva = result.rows[0];
        
        const servicos = await pool.query(
            `SELECT service_name, service_type, price_per_unit, nights, total_price
             FROM reservation_services WHERE reservation_id = $1`,
            [reserva.id]
        );
        
        reserva.servicos = servicos.rows;

        res.json({ success: true, data: reserva });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar reserva' });
    }
};

const confirmarPagamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method } = req.body;
        
        const result = await pool.query(
            `UPDATE reservations 
             SET payment_status = 'paid', status = 'confirmed', 
                 payment_method = $2, payment_confirmed_at = NOW() 
             WHERE reservation_code = $1 OR id::text = $1 
             RETURNING *`,
            [id, payment_method || 'mpesa']
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
        }
        
        res.json({ success: true, message: 'Pagamento confirmado', data: result.rows[0] });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, message: 'Erro ao confirmar pagamento' });
    }
};

const listarReservasCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const result = await pool.query(
            `SELECT r.*, rm.room_number, rm.type as room_type
             FROM reservations r
             JOIN rooms rm ON r.room_id = rm.id
             WHERE r.guest_id = $1 
             ORDER BY r.created_at DESC`,
            [clienteId]
        );
        res.json({ success: true, data: result.rows, total: result.rows.length });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar reservas' });
    }
};

const buscarQuartosDisponiveis = async (req, res) => {
    try {
        const { tipo } = req.query;
        let query = 'SELECT * FROM rooms WHERE status = $1';
        const params = ['available'];
        if (tipo) { query += ' AND type = $2'; params.push(tipo); }
        query += ' ORDER BY room_number';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows, total: result.rows.length });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar quartos' });
    }
};

const cancelarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        
        console.log('🔍 Cancelando reserva:', id);
        
        // Primeiro buscar a reserva para pegar o room_id
        const reserva = await pool.query(
            'SELECT id, room_id, reservation_code FROM reservations WHERE id::text = $1 OR reservation_code = $1',
            [id]
        );
        
        if (reserva.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
        }
        
        const reservaData = reserva.rows[0];
        
        // Atualizar status da reserva
        await pool.query(
            `UPDATE reservations SET status = 'cancelled', cancellation_reason = $2, cancellation_date = NOW(), updated_at = NOW() 
             WHERE id = $1`,
            [reservaData.id, motivo || 'Cancelado pelo cliente']
        );
        
        // Liberar o quarto
        await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['available', reservaData.room_id]);
        
        console.log('✅ Reserva cancelada:', reservaData.reservation_code);
        
        res.json({ success: true, message: 'Reserva cancelada com sucesso' });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ success: false, message: 'Erro ao cancelar reserva' });
    }
};

const alterarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { check_in, check_out, room_id, total_price } = req.body;
        
        console.log('📅 Alterando reserva:', id, { check_in, check_out, room_id, total_price });
        
        // Primeiro buscar a reserva
        const reserva = await pool.query(
            'SELECT id, room_id, reservation_code FROM reservations WHERE id::text = $1 OR reservation_code = $1',
            [id]
        );
        
        if (reserva.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
        }
        
        const reservaData = reserva.rows[0];
        
        const updates = [];
        const values = [];
        let idx = 1;
        
        if (check_in) { updates.push(`check_in = $${idx++}`); values.push(check_in); }
        if (check_out) { updates.push(`check_out = $${idx++}`); values.push(check_out); }
        if (room_id) { 
            updates.push(`room_id = $${idx++}`); 
            values.push(room_id);
            // Se trocar de quarto, atualizar o status
            await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['available', reservaData.room_id]);
            await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['occupied', room_id]);
        }
        if (total_price) { updates.push(`total_price = $${idx++}`); values.push(total_price); }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'Nenhuma alteração' });
        }
        
        values.push(reservaData.id);
        await pool.query(
            `UPDATE reservations SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
            values
        );
        
        console.log('✅ Reserva alterada:', reservaData.reservation_code);
        
        res.json({ success: true, message: 'Reserva alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar reserva:', error);
        res.status(500).json({ success: false, message: 'Erro ao alterar reserva' });
    }
};

module.exports = {
    criarReserva,
    buscarReserva,
    confirmarPagamento,
    listarReservasCliente,
    buscarQuartosDisponiveis,
    cancelarReserva,
    alterarReserva
};

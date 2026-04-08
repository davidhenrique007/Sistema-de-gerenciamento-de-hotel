// backend/services/pdfService.js
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const pool = require('../config/database');

class PDFService {
    async gerarRecibo(reservaId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Buscar TODOS os dados da reserva directamente do banco
                const query = `
                    SELECT 
                        r.id,
                        r.reservation_code,
                        r.check_in,
                        r.check_out,
                        r.adults_count,
                        r.children_count,
                        r.base_price,
                        r.tax_amount,
                        r.total_price,
                        r.payment_method,
                        r.status,
                        r.payment_status,
                        r.created_at,
                        g.id as guest_id,
                        g.name as guest_name,
                        g.email as guest_email,
                        g.phone as guest_phone,
                        rm.id as room_id,
                        rm.room_number,
                        rm.type as room_type,
                        rm.price_per_night,
                        rm.capacity_adults
                    FROM reservations r
                    INNER JOIN guests g ON r.guest_id = g.id
                    INNER JOIN rooms rm ON r.room_id = rm.id
                    WHERE r.reservation_code = $1 OR r.id::text = $1
                `;

                const result = await pool.query(query, [reservaId]);

                if (result.rows.length === 0) {
                    console.error(`❌ Reserva não encontrada: ${reservaId}`);
                    reject(new Error('Reserva não encontrada'));
                    return;
                }

                const reserva = result.rows[0];

                console.log(`📊 Gerando PDF para reserva: ${reserva.reservation_code}`);
                console.log(`   Quarto: ${reserva.room_number} - ${reserva.room_type}`);
                console.log(`   Check-in: ${reserva.check_in}`);
                console.log(`   Check-out: ${reserva.check_out}`);
                console.log(`   Total: ${reserva.total_price}`);
                console.log(`   Hóspede: ${reserva.guest_name}`);
                console.log(`   Método: ${reserva.payment_method}`);

                // Calcular noites com base nas datas REAIS do banco
                const checkIn = new Date(reserva.check_in);
                const checkOut = new Date(reserva.check_out);
                const noites = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

                // Usar os valores calculados do banco — NUNCA valores fixos
                const subtotal = parseFloat(reserva.base_price) || 0;
                const taxas = parseFloat(reserva.tax_amount) || 0;
                const total = parseFloat(reserva.total_price) || 0;
                const pricePerNight = parseFloat(reserva.price_per_night) || 0;

                const formatMZN = (valor) =>
                    new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor);

                const formatData = (data) =>
                    new Date(data).toLocaleDateString('pt-BR');

                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // ─── CABEÇALHO ───────────────────────────────────────────────
                doc.fontSize(24)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('HOTEL PARADISE', { align: 'center' });

                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor('#7f8c8d')
                   .text('O paraíso perfeito para as suas férias', { align: 'center' });

                doc.moveDown(0.5);
                doc.strokeColor('#e9ecef').lineWidth(1)
                   .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);

                // ─── TÍTULO ───────────────────────────────────────────────────
                doc.fontSize(18)
                   .font('Helvetica-Bold')
                   .fillColor('#28a745')
                   .text('RECIBO DE RESERVA', { align: 'center' });

                doc.moveDown(0.5);

                // Código e Data de emissão
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#2c3e50')
                   .text(`Código da Reserva: `, { continued: true })
                   .font('Helvetica-Bold')
                   .text(reserva.reservation_code, { continued: true })
                   .font('Helvetica')
                   .fillColor('#6c757d')
                   .text(`   |   Emitido em: ${new Date().toLocaleDateString('pt-BR')}`);

                doc.moveDown(1.5);

                // ─── DADOS DO CLIENTE ─────────────────────────────────────────
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('▸ DADOS DO CLIENTE');

                doc.moveTo(50, doc.y).lineTo(550, doc.y)
                   .strokeColor('#dee2e6').lineWidth(0.5).stroke();
                doc.moveDown(0.3);

                doc.fontSize(10).font('Helvetica').fillColor('#495057')
                   .text(`Nome:      ${reserva.guest_name || 'Não informado'}`)
                   .text(`Telefone:  ${reserva.guest_phone || 'Não informado'}`)
                   .text(`Email:     ${reserva.guest_email || 'Não informado'}`);

                doc.moveDown();

                // ─── DADOS DO QUARTO ──────────────────────────────────────────
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('▸ DADOS DO QUARTO');

                doc.moveTo(50, doc.y).lineTo(550, doc.y)
                   .strokeColor('#dee2e6').lineWidth(0.5).stroke();
                doc.moveDown(0.3);

                const tipoQuartoFormatado = reserva.room_type
                    ? reserva.room_type.charAt(0).toUpperCase() + reserva.room_type.slice(1).toLowerCase()
                    : 'Não informado';

                doc.fontSize(10).font('Helvetica').fillColor('#495057')
                   .text(`Número do Quarto: ${reserva.room_number}`)
                   .text(`Tipo:             ${tipoQuartoFormatado}`)
                   .text(`Capacidade:       ${reserva.capacity_adults || 0} adulto(s)`)
                   .text(`Adultos:          ${reserva.adults_count || 1}`)
                   .text(`Crianças:         ${reserva.children_count || 0}`);

                doc.moveDown();

                // ─── DATAS ────────────────────────────────────────────────────
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('▸ PERÍODO DA ESTADIA');

                doc.moveTo(50, doc.y).lineTo(550, doc.y)
                   .strokeColor('#dee2e6').lineWidth(0.5).stroke();
                doc.moveDown(0.3);

                doc.fontSize(10).font('Helvetica').fillColor('#495057')
                   .text(`Check-in:           ${formatData(reserva.check_in)}`)
                   .text(`Check-out:          ${formatData(reserva.check_out)}`)
                   .text(`Total de noites:    ${noites} noite${noites > 1 ? 's' : ''}`)
                   .text(`Preço por noite:    ${formatMZN(pricePerNight)}`);

                doc.moveDown(1.5);

                // ─── RESUMO FINANCEIRO ────────────────────────────────────────
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('▸ RESUMO DE VALORES', { align: 'center' });

                doc.moveDown(0.5);

                // Linha de subtotal
                const ySubtotal = doc.y;
                doc.fontSize(10).font('Helvetica').fillColor('#495057')
                   .text(`Subtotal (${noites} noite${noites > 1 ? 's' : ''} × ${formatMZN(pricePerNight)})`, 50, ySubtotal)
                   .text(formatMZN(subtotal), 50, ySubtotal, { align: 'right', width: 500 });

                // Linha de taxas
                const yTaxas = ySubtotal + 20;
                doc.text('Taxas e impostos (5%)', 50, yTaxas)
                   .text(formatMZN(taxas), 50, yTaxas, { align: 'right', width: 500 });

                // Separador
                doc.moveDown(3);
                doc.strokeColor('#adb5bd').lineWidth(1)
                   .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);

                // TOTAL
                const yTotal = doc.y;
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#28a745')
                   .text('TOTAL PAGO', 50, yTotal)
                   .fontSize(15)
                   .text(formatMZN(total), 50, yTotal, { align: 'right', width: 500 });

                doc.moveDown(2);

                // ─── MÉTODO DE PAGAMENTO ──────────────────────────────────────
                const metodosMap = {
                    mpesa:    'M-Pesa',
                    emola:    'E-mola',
                    mkesh:    'mKesh',
                    cartao:   'Cartão de Crédito',
                    dinheiro: 'Dinheiro (na chegada)'
                };
                const metodoPagamento = metodosMap[reserva.payment_method] || reserva.payment_method || 'Não informado';

                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('Método de pagamento: ', { continued: true })
                   .font('Helvetica')
                   .fillColor('#495057')
                   .text(metodoPagamento);

                doc.moveDown(0.5);

                // Status do pagamento
                const statusMap = { confirmed: 'Confirmado ✓', pending: 'Pendente', cancelled: 'Cancelado' };
                const statusPagamento = statusMap[reserva.payment_status] || reserva.payment_status || 'Não informado';

                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('Status do pagamento: ', { continued: true })
                   .font('Helvetica')
                   .fillColor(reserva.payment_status === 'confirmed' ? '#28a745' : '#dc3545')
                   .text(statusPagamento);

                // ─── QR CODE ──────────────────────────────────────────────────
                const qrCodeData = await QRCode.toDataURL(reserva.reservation_code);
                const qrImage = Buffer.from(qrCodeData.split(',')[1], 'base64');
                const qrY = doc.y - 40;
                doc.image(qrImage, 450, qrY, { width: 80, height: 80 });
                doc.fontSize(7)
                   .fillColor('#6c757d')
                   .text('Escaneie para validar', 440, qrY + 83, { width: 100, align: 'center' });

                doc.moveDown(5);

                // ─── RODAPÉ ───────────────────────────────────────────────────
                doc.strokeColor('#e9ecef').lineWidth(1)
                   .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);

                doc.fontSize(8)
                   .fillColor('#6c757d')
                   .text('Rua das Flores, 123 - Maputo, Moçambique', { align: 'center' })
                   .text('Tel: +258 84 123 4567 | Email: reservas@hotelparadise.com', { align: 'center' })
                   .text('Este documento é válido como comprovante de reserva.', { align: 'center' });

                doc.end();

            } catch (error) {
                console.error('❌ Erro ao gerar PDF:', error);
                reject(error);
            }
        });
    }
}

module.exports = new PDFService();

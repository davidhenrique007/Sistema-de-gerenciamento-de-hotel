// backend/controllers/reciboController.js
const pdfService = require('../services/pdfService');
const pool = require('../config/database');

class ReciboController {

    async downloadPDF(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: true, message: 'Código da reserva não informado' });
        }

        try {
            console.log(`📄 Gerando PDF para reserva: ${id}`);

            // O pdfService já busca TODOS os dados actualizados do banco
            const pdfBuffer = await pdfService.gerarRecibo(id);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Recibo_${id}.pdf`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);

            if (error.message === 'Reserva não encontrada') {
                return res.status(404).json({ error: true, message: 'Reserva não encontrada' });
            }

            res.status(500).json({
                error: true,
                message: 'Erro ao gerar PDF',
                details: error.message
            });
        }
    }

    async enviarPorEmail(req, res) {
        const { id } = req.params;
        const { email } = req.body;

        if (!id) {
            return res.status(400).json({ error: true, message: 'Código da reserva não informado' });
        }

        try {
            console.log(`📧 Enviando recibo por e-mail para reserva: ${id}`);

            // Buscar dados da reserva para obter o e-mail do hóspede
            const reserva = await pool.query(`
                SELECT r.*, g.email as guest_email, g.name as guest_name
                FROM reservations r
                LEFT JOIN guests g ON r.guest_id = g.id
                WHERE r.reservation_code = $1 OR r.id::text = $1
            `, [id]);

            if (reserva.rows.length === 0) {
                return res.status(404).json({ error: true, message: 'Reserva não encontrada' });
            }

            const data = reserva.rows[0];
            const destinatario = email || data.guest_email;

            if (!destinatario) {
                return res.status(400).json({
                    error: true,
                    message: 'E-mail do hóspede não encontrado. Por favor informe um e-mail.'
                });
            }

            // Gerar PDF com dados actualizados do banco
            const pdfBuffer = await pdfService.gerarRecibo(id);

            // TODO: integrar com serviço de e-mail real (nodemailer, SendGrid, etc.)
            console.log(`📧 PDF gerado (${pdfBuffer.length} bytes) — a enviar para: ${destinatario}`);

            res.json({
                success: true,
                message: 'E-mail enviado com sucesso',
                email: destinatario
            });

        } catch (error) {
            console.error('❌ Erro ao enviar e-mail:', error);
            res.status(500).json({
                error: true,
                message: 'Erro ao enviar e-mail',
                details: error.message
            });
        }
    }
}

module.exports = new ReciboController();

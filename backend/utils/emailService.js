// backend/utils/emailService.js - Versão simulada (sem envio real)
class EmailService {
    async enviarEmail({ to, subject, html, text }) {
        console.log(`📧 [SIMULADO] Email seria enviado para: ${to}`);
        console.log(`   Assunto: ${subject}`);
        console.log(`   Corpo: ${text || html?.substring(0, 100)}...`);
        return { success: true, messageId: `SIM_${Date.now()}` };
    }

    async enviarNotificacaoExpiracao(reserva, cliente) {
        console.log(`⚠️ [SIMULADO] Notificação de expiração para ${cliente.name} (${cliente.email})`);
        console.log(`   Reserva: ${reserva.reservation_code} - Quarto ${reserva.room_number}`);
        return { success: true, messageId: `SIM_${Date.now()}` };
    }

    async enviarConfirmacaoPagamento(reserva, cliente) {
        console.log(`✅ [SIMULADO] Confirmação de pagamento para ${cliente.name} (${cliente.email})`);
        console.log(`   Reserva: ${reserva.reservation_code} - Quarto ${reserva.room_number}`);
        return { success: true, messageId: `SIM_${Date.now()}` };
    }

    async enviarNotificacaoCancelamento(reserva, cliente) {
        console.log(`❌ [SIMULADO] Cancelamento de reserva para ${cliente.name} (${cliente.email})`);
        console.log(`   Reserva: ${reserva.reservation_code} - Quarto ${reserva.room_number}`);
        return { success: true, messageId: `SIM_${Date.now()}` };
    }
}

module.exports = new EmailService();

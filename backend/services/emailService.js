// backend/services/emailService.js
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        
        // Carregar template HTML
        this.template = null;
        this.loadTemplate();
    }
    
    loadTemplate() {
        try {
            const templatePath = path.join(__dirname, '../templates/email/recibo.html');
            if (fs.existsSync(templatePath)) {
                this.template = fs.readFileSync(templatePath, 'utf8');
                console.log('✅ Template de e-mail carregado');
            } else {
                console.log('⚠️ Template de e-mail não encontrado, usando fallback');
                this.template = this.getFallbackTemplate();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar template:', error);
            this.template = this.getFallbackTemplate();
        }
    }
    
    getFallbackTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Recibo de Reserva</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
                    <h1>Hotel Paradise</h1>
                    <p>O paraíso perfeito para suas férias</p>
                </div>
                <div style="padding: 20px;">
                    <h2 style="color: #28a745;">Reserva Confirmada!</h2>
                    <p>Olá {{nome}},</p>
                    <p>Sua reserva foi confirmada com sucesso.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Código:</strong> {{codigo}}</p>
                        <p><strong>Quarto:</strong> {{quarto}}</p>
                        <p><strong>Check-in:</strong> {{checkIn}}</p>
                        <p><strong>Check-out:</strong> {{checkOut}}</p>
                        <p><strong>Total pago:</strong> {{total}}</p>
                    </div>
                    <p>Em anexo, o PDF com o recibo completo.</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">Hotel Paradise - O paraíso perfeito para suas férias dos sonhos</p>
                </div>
            </body>
            </html>
        `;
    }
    
    async enviarRecibo(to, data, pdfBuffer) {
        try {
            const compiledTemplate = handlebars.compile(this.template);
            const html = compiledTemplate({
                nome: data.nome,
                codigo: data.codigo,
                quarto: data.quarto,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                total: data.total,
                metodo: data.metodo
            });
            
            const info = await this.transporter.sendMail({
                from: `"Hotel Paradise" <${process.env.SMTP_USER}>`,
                to,
                subject: `Recibo de Reserva - ${data.codigo}`,
                html,
                attachments: [
                    {
                        filename: `Recibo_${data.codigo}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            });
            
            console.log(`✅ E-mail enviado para ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
            
        } catch (error) {
            console.error('❌ Erro ao enviar e-mail:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();

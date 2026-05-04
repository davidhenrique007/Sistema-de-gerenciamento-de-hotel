// backend/services/exportacaoService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ExportacaoService {
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
  }

  async enviarRelatorioEmail({ email, titulo, conteudo, formato, anexoPath }) {
    try {
      const mailOptions = {
        from: `"Hotel Paradise" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `📊 Relatório: ${titulo} - ${new Date().toLocaleDateString('pt-BR')}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🏨 Hotel Paradise</h1>
            </div>
            <div style="padding: 20px;">
              <h2 style="color: #1e293b;">${titulo}</h2>
              <p>Prezado(a),</p>
              <p>Segue em anexo o relatório solicitado.</p>
              <p><strong>Data de geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Formato:</strong> ${formato.toUpperCase()}</p>
              <hr style="border: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 12px;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </div>
            <div style="background: #f8fafc; padding: 10px; text-align: center; font-size: 11px; color: #94a3b8;">
              Hotel Paradise - Gestão Hoteleira
            </div>
          </div>
        `,
        attachments: anexoPath ? [{
          filename: `${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.${formato}`,
          path: anexoPath
        }] : []
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ E-mail enviado: ${info.messageId}`);
      
      // Registrar no histórico
      await this.registrarHistorico({
        tipo: titulo,
        formato,
        destinatario: email,
        status: 'enviado'
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      
      await this.registrarHistorico({
        tipo: titulo,
        formato,
        destinatario: email,
        status: 'falhou',
        erro: error.message
      });
      
      return { success: false, error: error.message };
    }
  }

  async registrarHistorico({ tipo, formato, destinatario, status, erro }) {
    const db = require('../config/database');
    const query = `
      INSERT INTO historico_exportacoes (
        id, tipo, formato, destinatario, status, erro, data_exportacao
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    
    await db.query(query, [uuidv4(), tipo, formato, destinatario, status, erro]);
  }

  async listarHistorico(limit = 50) {
    const db = require('../config/database');
    const query = `
      SELECT * FROM historico_exportacoes
      ORDER BY data_exportacao DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }
}

module.exports = new ExportacaoService();
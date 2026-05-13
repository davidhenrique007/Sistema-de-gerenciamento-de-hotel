import React, { useState } from 'react';
import { useI18n } from '../../../../../../contexts/I18nContext';
import styles from './BotoesRecibo.module.css';
import api from '@services/api';

const BotoesRecibo = ({ reservaId, reservaCodigo, emailCliente }) => {
    const { t, language } = useI18n();
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState(null);

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    const showMessage = (type, text) => {
        setMensagem({ type, text });
        setTimeout(() => setMensagem(null), 5000);
    };

    const handleImprimir = () => {
        window.print();
        showMessage('success', getTranslation('receipt.printing', 'Enviando para impressão...'));
    };

    const handleBaixarPDF = () => {
        if (!reservaCodigo) {
            showMessage('error', getTranslation('receipt.no_code', 'Código da reserva não disponível'));
            return;
        }
        window.open(`http://localhost:5000/api/recibos/${reservaCodigo}/pdf`, '_blank');
        showMessage('success', getTranslation('receipt.pdf_opened', 'PDF aberto em nova aba!'));
    };

    const handleCompartilharWhatsApp = () => {
        if (!reservaCodigo) {
            showMessage('error', getTranslation('receipt.no_code', 'Código da reserva não disponível'));
            return;
        }

        const shareText = language === 'en' 
            ? `Hotel Paradise - Booking Confirmed!\n\nCode: ${reservaCodigo}\nDate: ${new Date().toLocaleDateString('en-US')}\n\nPresent this code at check-in.\n\nHotel Paradise - The perfect paradise for your vacation`
            : `Hotel Paradise - Reserva Confirmada!\n\nCódigo: ${reservaCodigo}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nApresente este código no check-in.\n\nHotel Paradise - O paraíso perfeito para suas férias`;

        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        showMessage('success', getTranslation('receipt.whatsapp_shared', 'Compartilhado via WhatsApp!'));
    };

    const handleEnviarEmail = async () => {
        if (!reservaCodigo) {
            showMessage('error', getTranslation('receipt.no_code', 'Código da reserva não disponível'));
            return;
        }
        if (!emailCliente) {
            showMessage('error', getTranslation('receipt.no_email', 'E-mail do cliente não disponível'));
            return;
        }

        setEnviando(true);
        try {
            const response = await api.post(`/recibos/${reservaCodigo}/enviar-email`, {
                email: emailCliente
            });

            if (response.data.success) {
                showMessage('success', getTranslation('receipt.email_sent', 'Recibo enviado por e-mail! Verifique sua caixa de entrada.'));
            } else {
                showMessage('error', response.data.message || getTranslation('receipt.email_error', 'Erro ao enviar e-mail'));
            }
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            showMessage('error', error.response?.data?.message || getTranslation('receipt.email_error', 'Erro ao enviar e-mail'));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button onClick={handleImprimir} className={styles.btnPrint} title={getTranslation('common.print', 'Imprimir recibo')}>
                    {getTranslation('common.print', 'Imprimir')}
                </button>
                <button onClick={handleBaixarPDF} className={styles.btnDownload} title={getTranslation('receipt.download_pdf', 'Baixar PDF do recibo')} disabled={!reservaCodigo}>
                    {getTranslation('receipt.download_pdf', 'Baixar PDF')}
                </button>
                <button onClick={handleCompartilharWhatsApp} className={styles.btnWhatsApp} title={getTranslation('receipt.share_whatsapp', 'Compartilhar via WhatsApp')} disabled={!reservaCodigo}>
                    {getTranslation('receipt.share_whatsapp', 'Compartilhar WhatsApp')}
                </button>
                <button onClick={handleEnviarEmail} disabled={enviando || !reservaCodigo || !emailCliente} className={styles.btnEmail} title={getTranslation('receipt.email_receipt', 'Enviar recibo por e-mail')}>
                    {enviando ? getTranslation('common.sending', 'Enviando...') : getTranslation('receipt.email_receipt', 'Enviar por E-mail')}
                </button>
            </div>
            {mensagem && (
                <div className={`${styles.message} ${styles[mensagem.type]}`}>
                    <span className={styles.messageIcon}>{mensagem.type === 'success' ? '?' : '?'}</span>
                    <span className={styles.messageText}>{mensagem.text}</span>
                </div>
            )}
        </div>
    );
};

export default BotoesRecibo;

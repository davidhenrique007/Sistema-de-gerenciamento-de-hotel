import React, { useState } from 'react';
import styles from './BotoesRecibo.module.css';
import api from '@services/api';

const BotoesRecibo = ({ reservaId, reservaCodigo, emailCliente }) => {
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState(null);

    const showMessage = (type, text) => {
        setMensagem({ type, text });
        setTimeout(() => setMensagem(null), 5000);
    };

    const handleImprimir = () => {
        window.print();
    };

    const handleBaixarPDF = () => {
        if (!reservaCodigo) {
            showMessage('error', 'Codigo da reserva nao disponivel');
            return;
        }
        // window.open evita CORS completamente para ficheiros binarios
        window.open(`http://localhost:5000/api/recibos/${reservaCodigo}/pdf`, '_blank');
        showMessage('success', 'PDF aberto em nova aba!');
    };

    const handleCompartilharWhatsApp = () => {
        if (!reservaCodigo) {
            showMessage('error', 'Codigo da reserva nao disponivel');
            return;
        }

        const texto = `Hotel Paradise - Reserva Confirmada!\n\nCodigo: ${reservaCodigo}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nApresente este codigo no check-in.\n\nHotel Paradise - O paraiso perfeito para suas ferias`;
        const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
    };

    const handleEnviarEmail = async () => {
        if (!reservaCodigo) {
            showMessage('error', 'Codigo da reserva nao disponivel');
            return;
        }
        if (!emailCliente) {
            showMessage('error', 'E-mail do cliente nao disponivel');
            return;
        }

        setEnviando(true);
        try {
            const response = await api.post(`/recibos/${reservaCodigo}/enviar-email`, {
                email: emailCliente
            });

            if (response.data.success) {
                showMessage('success', 'Recibo enviado por e-mail! Verifique sua caixa de entrada.');
            } else {
                showMessage('error', response.data.message || 'Erro ao enviar e-mail');
            }
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            showMessage('error', error.response?.data?.message || 'Erro ao enviar e-mail');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button
                    onClick={handleImprimir}
                    className={styles.btnPrint}
                    title="Imprimir recibo"
                >
                    Imprimir
                </button>
                <button
                    onClick={handleBaixarPDF}
                    className={styles.btnDownload}
                    title="Baixar PDF do recibo"
                    disabled={!reservaCodigo}
                >
                    Baixar PDF
                </button>
                <button
                    onClick={handleCompartilharWhatsApp}
                    className={styles.btnWhatsApp}
                    title="Compartilhar via WhatsApp"
                    disabled={!reservaCodigo}
                >
                    Compartilhar WhatsApp
                </button>
                <button
                    onClick={handleEnviarEmail}
                    disabled={enviando || !reservaCodigo || !emailCliente}
                    className={styles.btnEmail}
                    title="Enviar recibo por e-mail"
                >
                    {enviando ? 'Enviando...' : 'Enviar por E-mail'}
                </button>
            </div>
            {mensagem && (
                <div className={`${styles.message} ${styles[mensagem.type]}`}>
                    <span className={styles.messageIcon}>
                        {mensagem.type === 'success' ? 'OK' : 'ERRO'}
                    </span>
                    <span className={styles.messageText}>{mensagem.text}</span>
                </div>
            )}
        </div>
    );
};

export default BotoesRecibo;

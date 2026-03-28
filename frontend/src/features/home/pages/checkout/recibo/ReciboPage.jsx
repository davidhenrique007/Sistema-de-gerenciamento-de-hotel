import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCodeGenerator from './components/QRCodeGenerator';
import styles from './ReciboPage.module.css';

// Logo do hotel (ajuste o caminho conforme sua logo)
const hotelLogo = '/assets/images/logo-hotel.png'; // Altere para o caminho da sua logo

const ReciboPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    
    useEffect(() => {
        const dados = location.state?.reserva || JSON.parse(localStorage.getItem('ultima_reserva') || '{}');
        setReserva(dados);
        localStorage.removeItem('carrinho');
        localStorage.removeItem('ultima_reserva');
    }, [location]);
    
    const formatarMetodoPagamento = (metodo) => {
        const metodos = {
            'mpesa': 'M-Pesa',
            'emola': 'E-mola',
            'mkesh': 'mKesh',
            'cartao': 'Cartão de Crédito',
            'dinheiro': 'Dinheiro (na chegada)'
        };
        return metodos[metodo] || metodo || 'Não informado';
    };
    
    if (!reserva || Object.keys(reserva).length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.spinner}></div>
                <h2>Processando reserva...</h2>
                <p>Aguarde, estamos confirmando seus dados.</p>
            </div>
        );
    }
    
    return (
        <div className={styles.container} id="recibo-print">
            {/* Cabeçalho com logo */}
            <div className={styles.header}>
                {hotelLogo && (
                    <img 
                        src={hotelLogo} 
                        alt="Hotel Paradise" 
                        className={styles.logo}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Hotel Paradise</h1>
                    <p className={styles.subtitle}>O paraíso perfeito para suas férias</p>
                </div>
            </div>
            
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.confirmationTitle}>Reserva Confirmada!</h2>
            <p className={styles.confirmationText}>Sua reserva foi realizada com sucesso.</p>
            
            {/* QR Code */}
            <QRCodeGenerator value={reserva.codigo || `RES-${Date.now()}`} size={140} />
            
            <div className={styles.card}>
                <h3>📋 Detalhes da Reserva</h3>
                <div className={styles.detailsGrid}>
                    <div>
                        <p><strong>Código:</strong> {reserva.codigo || 'RES-' + Date.now()}</p>
                        <p><strong>Quartos:</strong> {reserva.quantidadeQuartos || 1} quarto(s)</p>
                        <p><strong>Hóspede:</strong> {reserva.hospedes || reserva.nome || 'Cliente'}</p>
                    </div>
                    <div>
                        <p><strong>Check-in:</strong> {reserva.checkIn ? new Date(reserva.checkIn).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        <p><strong>Check-out:</strong> {reserva.checkOut ? new Date(reserva.checkOut).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        <p><strong>Noites:</strong> {reserva.noites || 1} noite(s)</p>
                    </div>
                </div>
                
                <div className={styles.paymentInfo}>
                    <p><strong>Método de pagamento:</strong> {formatarMetodoPagamento(reserva.metodoPagamento)}</p>
                    <p><strong>Total pago:</strong> <span className={styles.totalValue}>{new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(reserva.total || 0)}</span></p>
                </div>
            </div>
            
            <div className={styles.infoBox}>
                <p>📧 Um e-mail com os detalhes da reserva foi enviado para: <strong>{reserva.email || 'seu e-mail'}</strong></p>
                <p>📞 Em caso de dúvidas, entre em contato conosco: +258 84 123 4567</p>
                <p>📍 Rua das Flores, 123 - Maputo, Moçambique</p>
            </div>
            
            <div className={styles.buttons}>
                <button onClick={() => window.print()} className={styles.printButton}>
                    🖨️ Imprimir Recibo
                </button>
                <button onClick={() => navigate('/')} className={styles.button}>
                    Voltar para Home
                </button>
            </div>
        </div>
    );
};

export default ReciboPage;

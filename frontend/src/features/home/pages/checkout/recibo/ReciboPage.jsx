import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ReciboPage.module.css';

const ReciboPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    
    useEffect(() => {
        // Recuperar dados da reserva
        const dados = location.state?.reserva || JSON.parse(localStorage.getItem('ultima_reserva') || '{}');
        setReserva(dados);
        
        // Limpar dados do carrinho após confirmação
        localStorage.removeItem('carrinho');
        localStorage.removeItem('ultima_reserva');
    }, [location]);
    
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
        <div className={styles.container}>
            <div className={styles.successIcon}>✅</div>
            <h1>Reserva Confirmada!</h1>
            <p>Sua reserva foi realizada com sucesso.</p>
            
            <div className={styles.card}>
                <h3>📋 Detalhes da Reserva</h3>
                <p><strong>Código:</strong> {reserva.codigo || 'RES-' + Date.now()}</p>
                <p><strong>Quartos:</strong> {reserva.quantidadeQuartos || 1} quarto(s)</p>
                <p><strong>Hóspedes:</strong> {reserva.hospedes || 2} pessoa(s)</p>
                <p><strong>Check-in:</strong> {reserva.checkIn ? new Date(reserva.checkIn).toLocaleDateString('pt-BR') : 'N/A'}</p>
                <p><strong>Check-out:</strong> {reserva.checkOut ? new Date(reserva.checkOut).toLocaleDateString('pt-BR') : 'N/A'}</p>
                <p><strong>Noites:</strong> {reserva.noites || 1} noite(s)</p>
                <p><strong>Total pago:</strong> <span className={styles.totalValue}>{new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(reserva.total || 0)}</span></p>
            </div>
            
            <div className={styles.infoBox}>
                <p>📧 Um e-mail com os detalhes da reserva foi enviado para: <strong>{reserva.email || 'seu e-mail'}</strong></p>
                <p>📞 Em caso de dúvidas, entre em contato conosco: +258 84 123 4567</p>
            </div>
            
            <button onClick={() => navigate('/')} className={styles.button}>
                Voltar para Home
            </button>
        </div>
    );
};

export default ReciboPage;

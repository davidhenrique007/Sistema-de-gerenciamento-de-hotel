import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ReciboPage.module.css';

const ReciboPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    
    useEffect(() => {
        // Recuperar dados da reserva do localStorage ou location.state
        const dados = location.state?.reserva || JSON.parse(localStorage.getItem('ultima_reserva') || '{}');
        setReserva(dados);
        
        // Limpar dados do carrinho
        localStorage.removeItem('carrinho');
    }, [location]);
    
    if (!reserva) {
        return (
            <div className={styles.container}>
                <h2>Reserva Confirmada!</h2>
                <p>Redirecionando...</p>
            </div>
        );
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.successIcon}>✅</div>
            <h1>Reserva Confirmada!</h1>
            <p>Sua reserva foi realizada com sucesso.</p>
            
            <div className={styles.card}>
                <h3>Detalhes da Reserva</h3>
                <p><strong>Código:</strong> {reserva.codigo || 'RES-' + Date.now()}</p>
                <p><strong>Quartos:</strong> {reserva.quantidadeQuartos} quarto(s)</p>
                <p><strong>Check-in:</strong> {new Date(reserva.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(reserva.checkOut).toLocaleDateString()}</p>
                <p><strong>Total pago:</strong> {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(reserva.total)}</p>
            </div>
            
            <button onClick={() => navigate('/')} className={styles.button}>
                Voltar para Home
            </button>
        </div>
    );
};

export default ReciboPage;

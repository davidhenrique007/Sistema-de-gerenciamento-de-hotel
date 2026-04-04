import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ReciboPage.module.css';

const ReciboPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [reserva, setReserva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const reservationCode = location.state?.reservation_code || 
                               JSON.parse(localStorage.getItem('ultima_reserva') || '{}')?.reservation_code;
        
        if (!reservationCode) {
            setError('Nenhuma reserva encontrada');
            setLoading(false);
            return;
        }
        
        carregarReserva(reservationCode);
    }, [location]);

    const carregarReserva = async (codigo) => {
        try {
            const response = await fetch(`http://localhost:5000/api/recibos/${codigo}`);
            const data = await response.json();
            
            if (data.success) {
                setReserva(data.data);
            } else {
                setError(data.message || 'Erro ao carregar reserva');
            }
        } catch (err) {
            console.error('Erro:', err);
            setError('Não foi possível carregar os dados da reserva');
        } finally {
            setLoading(false);
        }
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-MZ', { 
            style: 'currency', 
            currency: 'MZN' 
        }).format(valor);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.spinner}></div>
                <p>Carregando recibo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Voltar para Home</button>
                </div>
            </div>
        );
    }

    if (!reserva) return null;

    const noites = Math.ceil((new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24));

    return (
        <div className={styles.container}>
            <div className={styles.recibo}>
                <h1>Hotel Paradise</h1>
                <h2>Recibo de Reserva</h2>

                <div className={styles.section}>
                    <h3>Reserva</h3>
                    <p><strong>Código:</strong> {reserva.reservation_code}</p>
                    <p><strong>Status:</strong> Confirmada</p>
                    <p><strong>Data:</strong> {formatarData(reserva.created_at)}</p>
                </div>

                <div className={styles.section}>
                    <h3>Hóspede</h3>
                    <p><strong>Nome:</strong> {reserva.guest_name}</p>
                    <p><strong>Telefone:</strong> {reserva.guest_phone}</p>
                    <p><strong>Email:</strong> {reserva.guest_email || '-'}</p>
                </div>

                <div className={styles.section}>
                    <h3>Estadia</h3>
                    <p><strong>Quarto:</strong> {reserva.room_number}</p>
                    <p><strong>Tipo:</strong> {reserva.room_type}</p>
                    <p><strong>Check-in:</strong> {formatarData(reserva.check_in)}</p>
                    <p><strong>Check-out:</strong> {formatarData(reserva.check_out)}</p>
                    <p><strong>Noites:</strong> {noites}</p>
                </div>

                <div className={styles.section}>
                    <h3>Pagamento</h3>
                    <p><strong>Método:</strong> {reserva.payment_method === 'mpesa' ? 'M-Pesa' : reserva.payment_method}</p>
                    <p><strong>Total:</strong> {formatarMoeda(reserva.total_price)}</p>
                </div>

                <div className={styles.buttons}>
                    <button onClick={() => navigate('/minhas-reservas')}>Minhas Reservas</button>
                    <button onClick={() => window.print()}>Imprimir Recibo</button>
                    <button onClick={() => navigate('/')}>Voltar para Home</button>
                </div>
            </div>
        </div>
    );
};

export default ReciboPage;

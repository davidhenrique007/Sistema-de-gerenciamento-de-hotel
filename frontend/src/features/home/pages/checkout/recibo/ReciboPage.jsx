import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCodeGenerator from './components/QRCodeGenerator';
import BotoesRecibo from './components/BotoesRecibo';
import styles from './ReciboPage.module.css';
import api from '@services/api';

const ReciboPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        const carregarReserva = async () => {
            setLoading(true);
            setErro(null);

            // 1. Obter o código da reserva — do state ou do localStorage
            let codigoReserva = location.state?.reservation_code;

            if (!codigoReserva) {
                try {
                    const saved = localStorage.getItem('ultima_reserva');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        codigoReserva = parsed.reservation_code;
                    }
                } catch (e) {
                    console.error('Erro ao ler localStorage:', e);
                }
            }

            if (!codigoReserva) {
                setErro('Código da reserva não encontrado. Por favor volte ao checkout.');
                setLoading(false);
                return;
            }

            try {
                // 2. Buscar dados REAIS e ACTUALIZADOS do banco
                console.log('🔍 Buscando reserva do banco:', codigoReserva);
                const resposta = await api.get(`/reservas/${codigoReserva}`);

                if (!resposta.data.success) {
                    throw new Error(resposta.data.message || 'Reserva não encontrada');
                }

                const dados = resposta.data.data;
                console.log('✅ Dados da reserva carregados:', dados);
                setReserva(dados);

            } catch (error) {
                console.error('❌ Erro ao carregar reserva:', error);
                setErro('Não foi possível carregar os dados da reserva. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        carregarReserva();
    }, [location]);

    // ─── LOADING ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.spinner}></div>
                <h2>A carregar recibo...</h2>
            </div>
        );
    }

    // ─── ERRO ─────────────────────────────────────────────────────────────────
    if (erro) {
        return (
            <div className={styles.container}>
                <div className={styles.errorIcon}>❌</div>
                <h2>Erro ao carregar recibo</h2>
                <p>{erro}</p>
                <button onClick={() => navigate('/')} className={styles.button}>
                    Voltar para Home
                </button>
            </div>
        );
    }

    if (!reserva) return null;

    // ─── Formatar dados vindos do banco ───────────────────────────────────────
    const codigoReserva     = reserva.reservation_code;
    const nomeHospede       = reserva.guest_name       || 'Cliente';
    const emailHospede      = reserva.guest_email      || '';
    const checkIn           = reserva.check_in;
    const checkOut          = reserva.check_out;
    const quantidadeQuartos = reserva.rooms_count      || 1;
    const totalPago         = parseFloat(reserva.total_price) || 0;

    const metodosMap = {
        mpesa:    'M-Pesa',
        emola:    'E-mola',
        mkesh:    'mKesh',
        cartao:   'Cartão de Crédito',
        dinheiro: 'Dinheiro (na chegada)'
    };
    const metodoPagamento = metodosMap[reserva.payment_method] || reserva.payment_method || 'Não informado';

    const noites = checkIn && checkOut
        ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
        : 1;

    const formatData = (data) =>
        data ? new Date(data).toLocaleDateString('pt-BR') : 'N/A';

    const formatMZN = (valor) =>
        new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Hotel Paradise</h1>
                <p className={styles.subtitle}>O paraíso perfeito para suas férias</p>
            </div>

            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.confirmationTitle}>Reserva Confirmada!</h2>
            <p className={styles.confirmationText}>Sua reserva foi realizada com sucesso.</p>

            <QRCodeGenerator value={codigoReserva} size={140} />

            <div className={styles.card}>
                <h3>📋 Detalhes da Reserva</h3>
                <div className={styles.detailsGrid}>
                    <div>
                        <p><strong>Código:</strong> {codigoReserva}</p>
                        <p><strong>Quartos:</strong> {quantidadeQuartos} quarto(s)</p>
                        <p><strong>Hóspede:</strong> {nomeHospede}</p>
                    </div>
                    <div>
                        <p><strong>Check-in:</strong> {formatData(checkIn)}</p>
                        <p><strong>Check-out:</strong> {formatData(checkOut)}</p>
                        <p><strong>Noites:</strong> {noites} noite(s)</p>
                    </div>
                </div>

                <div className={styles.paymentInfo}>
                    <p><strong>Método de pagamento:</strong> {metodoPagamento}</p>
                    <p>
                        <strong>Total pago:</strong>{' '}
                        <span className={styles.totalValue}>{formatMZN(totalPago)}</span>
                    </p>
                </div>
            </div>

            <div className={styles.infoBox}>
                {emailHospede && (
                    <p>📧 Um e-mail com os detalhes da reserva foi enviado para: <strong>{emailHospede}</strong></p>
                )}
                <p>📞 Em caso de dúvidas, entre em contato conosco: +258 84 123 4567</p>
                <p>📍 Rua das Flores, 123 - Maputo, Moçambique</p>
            </div>

            <BotoesRecibo
                reservaId={reserva.id}
                reservaCodigo={codigoReserva}
                emailCliente={emailHospede}
            />

            <button onClick={() => navigate('/')} className={styles.button}>
                Voltar para Home
            </button>
        </div>
    );
};

export default ReciboPage;

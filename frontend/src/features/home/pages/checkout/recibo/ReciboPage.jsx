import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../../services/api';
import styles from './ReciboPage.module.css';
import logo from '../../../../../assets/images/login/logo.png';

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
            const response = await api.get(`/recibos/${codigo}`);
            if (response.data.success) {
                setReserva(response.data.data);
            } else {
                setError(response.data.message || 'Erro ao carregar reserva');
            }
        } catch (err) {
            console.error('Erro ao carregar reserva:', err);
            setError('Não foi possível carregar os dados da reserva');
        } finally {
            setLoading(false);
        }
    };

    const formatarMoeda = (valor) =>
        new Intl.NumberFormat('pt-MZ', {
            style: 'currency', currency: 'MZN',
            minimumFractionDigits: 2, maximumFractionDigits: 2
        }).format(valor);

    const formatarData = (data) =>
        new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

    const getTipoQuartoLabel = (tipo) => ({
        standard: 'Standard', deluxe: 'Suíte Deluxe',
        suite: 'Suíte Presidencial', family: 'Família'
    }[tipo] || tipo);

    const getPaymentLabel = (method) => ({
        mpesa: 'M-Pesa', cartao: 'Cartão', dinheiro: 'Dinheiro'
    }[method] || method);

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.center}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>A carregar recibo...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <div className={styles.errorBox}>
                <span className={styles.errorIcon}>⚠</span>
                <p>{error}</p>
                <button onClick={() => navigate('/')} className={styles.btnSecondary}>Voltar ao início</button>
            </div>
        </div>
    );

    if (!reserva) return null;

    const noites = Math.max(1, Math.ceil(
        (new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24)
    ));

    return (
        <div className={styles.container}>
            <div className={styles.recibo}>

                {/* CABEÇALHO */}
                <div className={styles.header}>
                    <div className={styles.hotelBrand}>
                        <img src={logo} alt="Hotel Paradise" className={styles.hotelIcon} />
                        <div>
                            <h1 className={styles.hotelName}>Hotel Paradise</h1>
                            <p className={styles.hotelMeta}>Maputo, Moçambique · +258 84 123 4567</p>
                        </div>
                    </div>
                    <div className={styles.badge}>✅ Confirmada</div>
                </div>

                <div className={styles.divider}></div>

                {/* CÓDIGO DA RESERVA */}
                <div className={styles.codeSection}>
                    <span className={styles.codeLabel}>RESERVA</span>
                    <span className={styles.codeValue}>#{reserva.reservation_code}</span>
                    <span className={styles.codeDate}>{formatarData(reserva.created_at)}</span>
                </div>

                <div className={styles.divider}></div>

                {/* HÓSPEDE */}
                <div className={styles.row}>
                    <div className={styles.block}>
                        <span className={styles.blockLabel}>Hóspede</span>
                        <span className={styles.blockValue}>{reserva.guest_name}</span>
                        <span className={styles.blockSub}>{reserva.guest_phone}</span>
                        {reserva.guest_email && <span className={styles.blockSub}>{reserva.guest_email}</span>}
                    </div>

                    {/* ESTADIA */}
                    <div className={styles.block}>
                        <span className={styles.blockLabel}>Estadia</span>
                        <span className={styles.blockValue}>
                            {formatarData(reserva.check_in)} → {formatarData(reserva.check_out)}
                        </span>
                        <span className={styles.blockSub}>
                            {noites} noite{noites > 1 ? 's' : ''} · {getTipoQuartoLabel(reserva.room_type)} · Qto {reserva.room_number}
                        </span>
                        <span className={styles.blockSub}>{reserva.adults_count} adulto{reserva.adults_count > 1 ? 's' : ''}{reserva.children_count > 0 ? ` · ${reserva.children_count} criança(s)` : ''}</span>
                    </div>
                </div>

                <div className={styles.divider}></div>

                {/* PAGAMENTO */}
                <div className={styles.row}>
                    <div className={styles.block}>
                        <span className={styles.blockLabel}>Pagamento</span>
                        <span className={styles.blockValue}>{getPaymentLabel(reserva.payment_method)}</span>
                        <span className={styles.paidTag}>✔ Pago</span>
                    </div>

                    {/* VALORES */}
                    <div className={styles.block}>
                        <span className={styles.blockLabel}>Resumo</span>
                        <div className={styles.priceLines}>
                            <div className={styles.priceLine}>
                                <span>Diária × {noites}</span>
                                <span>{formatarMoeda(reserva.price_per_night * noites)}</span>
                            </div>
                            {reserva.servicos?.map((s, i) => (
                                <div key={i} className={styles.priceLine}>
                                    <span>{s.service_name}</span>
                                    <span>{formatarMoeda(s.total_price)}</span>
                                </div>
                            ))}
                            <div className={styles.priceLine}>
                                <span>Taxas (5%)</span>
                                <span>{formatarMoeda(reserva.tax_amount || (reserva.total_price - reserva.total_price / 1.05))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.divider}></div>

                {/* TOTAL */}
                <div className={styles.totalSection}>
                    <span className={styles.totalLabel}>TOTAL PAGO</span>
                    <span className={styles.totalValue}>{formatarMoeda(reserva.total_price)}</span>
                </div>

                <div className={styles.divider}></div>

                {/* RODAPÉ */}
                <div className={styles.footer}>
                    <p className={styles.thankYou}>
                        Obrigado por escolher o Hotel Paradise.<br />
                        <span>Este documento é o seu comprovativo de reserva.</span>
                    </p>
                    <div className={styles.actions}>
                        <button onClick={() => navigate('/minhas-reservas')} className={styles.btnSecondary}>
                            Minhas Reservas
                        </button>
                        <button onClick={() => window.print()} className={styles.btnPrint}>
                            🖨 Imprimir
                        </button>
                        <button onClick={() => navigate('/')} className={styles.btnPrimary}>
                            Voltar ao Início
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReciboPage;
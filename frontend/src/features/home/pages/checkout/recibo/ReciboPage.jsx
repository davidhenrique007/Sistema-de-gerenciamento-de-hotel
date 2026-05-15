import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { formatDate, calculateNights } from '@/core/utils/dateFormatter';
import api from '@/services/api';
import styles from './ReciboPage.module.css';


const ReciboPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language } = useI18n();
    const [reserva, setReserva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    useEffect(() => {
        const reservationCode = location.state?.reservation_code ||
            JSON.parse(localStorage.getItem('ultima_reserva') || '{}')?.reservation_code;

        if (!reservationCode) {
            setError(getTranslation('receipt.no_reservation', 'Nenhuma reserva encontrada'));
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
                setError(response.data.message || getTranslation('receipt.load_error', 'Erro ao carregar reserva'));
            }
        } catch (err) {
            console.error('Erro ao carregar reserva:', err);
            setError(getTranslation('receipt.load_error', 'Não foi possível carregar os dados da reserva'));
        } finally {
            setLoading(false);
        }
    };

    const formatarMoeda = (valor) =>
        new Intl.NumberFormat('pt-MZ', {
            style: 'currency', currency: 'MZN',
            minimumFractionDigits: 2, maFecharimumFractionDigits: 2
        }).format(valor);

    const getTipoQuartoLabel = (tipo) => {
        const tipos = {
            standard: t('rooms.types.standard') || 'Standard',
            deluFechare: t('rooms.types.deluFechare') || 'DeluFechare',
            suite: t('rooms.types.suite') || 'Suite',
            family: t('rooms.types.family') || 'Family'
        };
        return tipos[tipo] || tipo;
    };

    const getPaymentLabel = (method) => {
        const methods = {
            mpesa: 'M-Pesa',
            cartao: t('payment.credit_card') || 'Cartão',
            dinheiro: t('payment.cash') || 'Dinheiro'
        };
        return methods[method] || method;
    };

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.center}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingTexportt}>{getTranslation('receipt.loading', 'A carregar recibo...')}</p>
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <div className={styles.errorBoFechar}>
                <span className={styles.errorIcon}>⚠️</span>
                <p>{error}</p>
                <button onClick={() => navigate('/')} className={styles.btnSecondary}>
                    {getTranslation('common.back_home', 'Voltar ao início')}
                </button>
            </div>
        </div>
    );

    if (!reserva) return null;

    const noites = calculateNights(reserva.check_in, reserva.check_out);

    return (
        <div className={styles.container}>
            <div className={styles.recibo}>
                <div className={styles.header}>
                    <div className={styles.hotelBrand}>
                        <img src="/logo.png" alt="Hotel Paradise" className={styles.hotelIcon} />
                        <div>
                            <h1 className={styles.hotelName}>Hotel Paradise</h1>
                            <p className={styles.hotelMeta}>Maputo, Moçambique · +258 84 123 4567</p>
                        </div>
                    </div>
                    <div className={styles.badge}>✅ {getTranslation('receipt.confirmed', 'Confirmada')}</div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.codeSection}>
                    <span className={styles.codeLabel}>{getTranslation('receipt.reservation', 'RESERVA')}</span>
                    <span className={styles.codeValue}>#{reserva.reservation_code}</span>
                    <span className={styles.codeDate}>{formatDate(reserva.created_at, language)}</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.row}>
                    <div className={styles.block}>
                        <span className={styles.blockLabel}>{getTranslation('receipt.guest', 'Hóspede')}</span>
                        <span className={styles.blockValue}>{reserva.guest_name}</span>
                        <span className={styles.blockSub}>{reserva.guest_phone}</span>
                        {reserva.guest_email && <span className={styles.blockSub}>{reserva.guest_email}</span>}
                    </div>

                    <div className={styles.block}>
                        <span className={styles.blockLabel}>{getTranslation('receipt.stay', 'Estadia')}</span>
                        <span className={styles.blockValue}>
                            {formatDate(reserva.check_in, language)} - {formatDate(reserva.check_out, language)}
                        </span>
                        <span className={styles.blockSub}>
                            {noites} {noites > 1 ? t('reservation.nights') : t('reservation.night')} · {getTipoQuartoLabel(reserva.room_type)} · {getTranslation('rooms.room', 'Quarto')} {reserva.room_number}
                        </span>
                        <span className={styles.blockSub}>
                            {reserva.adults_count} {reserva.adults_count > 1 ? t('reservation.adults') : t('reservation.adult')}
                            {reserva.children_count > 0 ? ` · ${reserva.children_count} ${reserva.children_count > 1 ? t('reservation.children') : t('reservation.child')}` : ''}
                        </span>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.row}>
                    <div className={styles.block}>
                        <span className={styles.blockLabel}>{getTranslation('receipt.payment', 'Pagamento')}</span>
                        <span className={styles.blockValue}>{getPaymentLabel(reserva.payment_method)}</span>
                        <span className={styles.paidTag}>✔ {getTranslation('receipt.paid', 'Pago')}</span>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.blockLabel}>{getTranslation('receipt.summary', 'Resumo')}</span>
                        <div className={styles.priceLines}>
                            <div className={styles.priceLine}>
                                <span>{getTranslation('receipt.daily_rate', 'Diária')} Fechar {noites}</span>
                                <span>{formatarMoeda(reserva.price_per_night * noites)}</span>
                            </div>
                            {reserva.servicos?.map((s, i) => (
                                <div key={i} className={styles.priceLine}>
                                    <span>{s.service_name}</span>
                                    <span>{formatarMoeda(s.total_price)}</span>
                                </div>
                            ))}
                            <div className={styles.priceLine}>
                                <span>{getTranslation('receipt.taFechares', 'TaFecharas')} (5%)</span>
                                <span>{formatarMoeda(reserva.taFechar_amount || (reserva.total_price - reserva.total_price / 1.05))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.totalSection}>
                    <span className={styles.totalLabel}>{getTranslation('receipt.total_paid', 'TOTAL PAGO')}</span>
                    <span className={styles.totalValue}>{formatarMoeda(reserva.total_price)}</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.footer}>
                    <p className={styles.thankYou}>
                        {getTranslation('receipt.thank_you', 'Obrigado por escolher o Hotel Paradise.')}<br />
                        <span>{getTranslation('receipt.document_proof', 'Este documento é o seu comprovativo de reserva.')}</span>
                    </p>
                    <div className={styles.actions}>
                        <button onClick={() => navigate('/minhas-reservas')} className={styles.btnSecondary}>
                            {getTranslation('nav.reservations', 'Minhas Reservas')}
                        </button>
                        <button onClick={() => window.print()} className={styles.btnPrint}>
                            🖨 {getTranslation('common.print', 'Imprimir')}
                        </button>
                        <button onClick={() => navigate('/')} className={styles.btnPrimary}>
                            {getTranslation('common.back_home', 'Voltar ao Início')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReciboPage;



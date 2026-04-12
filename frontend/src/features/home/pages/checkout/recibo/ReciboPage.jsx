import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../../services/api';
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

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-MZ', { 
            style: 'currency', 
            currency: 'MZN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatarDataExtenso = (data) => {
        return new Date(data).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const getTipoQuartoLabel = (tipo) => {
        const tipos = {
            standard: 'Quarto Standard',
            deluxe: 'Suíte Deluxe',
            suite: 'Suíte Presidencial',
            family: 'Quarto Família'
        };
        return tipos[tipo] || tipo;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Carregando recibo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <h2>Erro ao carregar recibo</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className={styles.backButton}>
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    if (!reserva) {
        return null;
    }

    const noites = Math.ceil((new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24));
    const checkIn = new Date(reserva.check_in);
    const checkOut = new Date(reserva.check_out);
    const bookingDate = new Date(reserva.created_at);

    return (
        <div className={styles.container}>
            <div className={styles.recibo}>
                {/* Header com logo e informações do hotel */}
                <div className={styles.header}>
                    <div className={styles.hotelInfo}>
                        <div className={styles.logo}>🏨</div>
                        <h1 className={styles.hotelName}>Hotel Paradise</h1>
                        <p className={styles.hotelDetails}>
                            Avenida da Praia, 1234 - Maputo, Moçambique
                        </p>
                        <p className={styles.hotelContact}>
                            Tel: +258 84 123 4567 | Email: reservas@hotelparadise.com
                        </p>
                        <p className={styles.hotelWebsite}>www.hotelparadise.co.mz</p>
                    </div>
                </div>

                {/* Título do Recibo */}
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>Recibo de Reserva</h2>
                    <div className={styles.titleUnderline}></div>
                </div>

                {/* Informações da Reserva - Layout em grid */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>📋</div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Número da Reserva</span>
                            <span className={styles.infoValue}>{reserva.reservation_code}</span>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>📅</div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Data da Reserva</span>
                            <span className={styles.infoValue}>{formatarData(bookingDate)}</span>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>✅</div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Status</span>
                            <span className={`${styles.infoValue} ${styles.statusConfirmed}`}>Confirmada</span>
                        </div>
                    </div>
                </div>

                {/* Dados do Hóspede */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>👤</span>
                        Dados do Hóspede
                    </h3>
                    <div className={styles.twoColumns}>
                        <div className={styles.column}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Nome:</span>
                                <span className={styles.detailValue}>{reserva.guest_name}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Telefone:</span>
                                <span className={styles.detailValue}>{reserva.guest_phone}</span>
                            </div>
                        </div>
                        <div className={styles.column}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Email:</span>
                                <span className={styles.detailValue}>{reserva.guest_email || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalhes da Estadia */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🏨</span>
                        Detalhes da Estadia
                    </h3>
                    <div className={styles.datesGrid}>
                        <div className={styles.dateCard}>
                            <div className={styles.dateIcon}>📥</div>
                            <div className={styles.dateContent}>
                                <span className={styles.dateLabel}>Check-in</span>
                                <span className={styles.dateValue}>{formatarDataExtenso(checkIn)}</span>
                                <span className={styles.dateTime}>A partir das 14:00</span>
                            </div>
                        </div>
                        <div className={styles.dateArrow}>→</div>
                        <div className={styles.dateCard}>
                            <div className={styles.dateIcon}>📤</div>
                            <div className={styles.dateContent}>
                                <span className={styles.dateLabel}>Check-out</span>
                                <span className={styles.dateValue}>{formatarDataExtenso(checkOut)}</span>
                                <span className={styles.dateTime}>Até às 12:00</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.stayDetails}>
                        <div className={styles.stayItem}>
                            <span className={styles.stayLabel}>Acomodação:</span>
                            <span className={styles.stayValue}>{getTipoQuartoLabel(reserva.room_type)}</span>
                        </div>
                        <div className={styles.stayItem}>
                            <span className={styles.stayLabel}>Quarto:</span>
                            <span className={styles.stayValue}>{reserva.room_number}</span>
                        </div>
                        <div className={styles.stayItem}>
                            <span className={styles.stayLabel}>Noites:</span>
                            <span className={styles.stayValue}>{noites} noite(s)</span>
                        </div>
                        <div className={styles.stayItem}>
                            <span className={styles.stayLabel}>Hóspedes:</span>
                            <span className={styles.stayValue}>{reserva.adults_count} adulto(s)</span>
                        </div>
                    </div>
                </div>

                {/* Tabela de Valores */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>💰</span>
                        Resumo Financeiro
                    </h3>
                    <table className={styles.priceTable}>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Quantidade</th>
                                <th>Valor Unitário</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Diária - {getTipoQuartoLabel(reserva.room_type)}</td>
                                <td>{noites} noite(s)</td>
                                <td>{formatarMoeda(reserva.price_per_night)}</td>
                                <td>{formatarMoeda(reserva.price_per_night * noites)}</td>
                            </tr>
                            {reserva.servicos && reserva.servicos.map((servico, index) => (
                                <tr key={index}>
                                    <td>{servico.service_name}</td>
                                    <td>{servico.nights || 1}</td>
                                    <td>{formatarMoeda(servico.price_per_unit)}</td>
                                    <td>{formatarMoeda(servico.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className={styles.totalRow}>
                                <td colSpan="3" className={styles.totalLabel}>Subtotal</td>
                                <td className={styles.totalValue}>{formatarMoeda(reserva.total_price / 1.05)}</td>
                            </tr>
                            <tr className={styles.taxRow}>
                                <td colSpan="3" className={styles.taxLabel}>Taxas (5%)</td>
                                <td className={styles.taxValue}>{formatarMoeda(reserva.total_price - (reserva.total_price / 1.05))}</td>
                            </tr>
                            <tr className={styles.grandTotalRow}>
                                <td colSpan="3" className={styles.grandTotalLabel}>TOTAL</td>
                                <td className={styles.grandTotalValue}>{formatarMoeda(reserva.total_price)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Informações do Pagamento */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>💳</span>
                        Informações de Pagamento
                    </h3>
                    <div className={styles.paymentInfo}>
                        <div className={styles.paymentMethod}>
                            <span className={styles.paymentLabel}>Método de Pagamento:</span>
                            <span className={styles.paymentValue}>
                                {reserva.payment_method === 'mpesa' ? 'M-Pesa' : 
                                 reserva.payment_method === 'cartao' ? 'Cartão de Crédito' : 
                                 reserva.payment_method === 'dinheiro' ? 'Dinheiro' : reserva.payment_method}
                            </span>
                        </div>
                        <div className={styles.paymentStatus}>
                            <span className={styles.paymentLabel}>Status:</span>
                            <span className={`${styles.paymentValue} ${styles.paidStatus}`}>Pago</span>
                        </div>
                        {reserva.payment_confirmed_at && (
                            <div className={styles.paymentDate}>
                                <span className={styles.paymentLabel}>Data do Pagamento:</span>
                                <span className={styles.paymentValue}>{formatarData(reserva.payment_confirmed_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Informações Adicionais */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>ℹ️</span>
                        Informações Adicionais
                    </h3>
                    <ul className={styles.additionalInfo}>
                        <li>Check-in a partir das 14:00 | Check-out até às 12:00</li>
                        <li>Estacionamento gratuito no local</li>
                        <li>Wi-Fi gratuito disponível em todas as áreas</li>
                        <li>Para cancelamentos, entre em contato com 24h de antecedência</li>
                    </ul>
                </div>

                {/* Rodapé com Ações */}
                <div className={styles.footer}>
                    <button onClick={() => navigate('/minhas-reservas')} className={styles.minhasReservasButton}>
                        📋 Minhas Reservas
                    </button>
                    <button onClick={() => window.print()} className={styles.printButton}>
                        🖨️ Imprimir Recibo
                    </button>
                    <button onClick={() => navigate('/')} className={styles.homeButton}>
                        🏠 Voltar para Home
                    </button>
                </div>

                {/* Copyright */}
                <div className={styles.copyright}>
                    <p>© {new Date().getFullYear()} Hotel Paradise. Todos os direitos reservados.</p>
                    <p>Este documento é um comprovante eletrônico de reserva.</p>
                </div>
            </div>
        </div>
    );
};

export default ReciboPage;

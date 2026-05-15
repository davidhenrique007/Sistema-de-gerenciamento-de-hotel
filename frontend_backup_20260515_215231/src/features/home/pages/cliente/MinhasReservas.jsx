import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCliente } from '@hooks/useCliente';
import { useI18n } from '@/contexts/I18nContext'; // ✅ CORRIGIDO
import api from '@services/api';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ReservaCard from './components/ReservaCard/ReservaCard';
import HistoricoTable from './components/HistoricoTable/HistoricoTable';
import PolicySection from './components/PolicySection/PolicySection';
import AlterarDatasModal from './components/modals/AlterarDatasModal';
import TrocarQuartoModal from './components/modals/TrocarQuartoModal';
import CancelarReservaModal from './components/modals/CancelarReservaModal';
import styles from './styles/MinhasReservas.module.css';

const MinhasReservas = () => {
    const { cliente, isIdentificado, loading: authLoading } = useCliente();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ open: false, type: null, reserva: null });
    const [cancelModal, setCancelModal] = useState({ open: false, reserva: null });

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    const showMessage = (message, isError = false) => {
        const msg = getTranslation(message, message);
        if (isError) {
            alert(`❌ ${msg}`);
        } else {
            alert(`✅ ${msg}`);
        }
    };

    const carregarReservas = useCallback(async () => {
        if (!isIdentificado || !cliente?.id) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.get(`/reservas/cliente/${cliente.id}`);
            const todasReservas = response.data.data || [];
            
            const hoje = new Date();
            const ativas = todasReservas.filter(r => 
                r.status === 'confirmed' && new Date(r.check_out) >= hoje
            );
            const historicoList = todasReservas.filter(r => 
                r.status === 'cancelled' || r.status === 'finalized' || new Date(r.check_out) < hoje
            );
            
            setReservas(ativas);
            setHistorico(historicoList);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar reservas:', err);
            setError(getTranslation('errors.load_reservations', 'Não foi possível carregar suas reservas'));
        } finally {
            setLoading(false);
        }
    }, [isIdentificado, cliente?.id, t]);

    useEffect(() => {
        if (!authLoading && !isIdentificado) {
            navigate('/login-cliente');
            return;
        }
        
        if (isIdentificado && cliente?.id) {
            carregarReservas();
        }
    }, [isIdentificado, cliente?.id, authLoading, navigate, carregarReservas]);

    const totalGasto = reservas.reduce((acc, r) => acc + parseFloat(r.total_price), 0);

    const handleAlterar = (reserva) => {
        setModalState({ open: true, type: 'alterar', reserva });
    };

    const handleTrocarQuarto = (reserva) => {
        setModalState({ open: true, type: 'trocar', reserva });
    };

    const handleCancelarClick = (reserva) => {
        setCancelModal({ open: true, reserva });
    };

    const handleConfirmarTroca = async (novoQuartoId, novoTotal) => {
        try {
            const response = await api.put(`/reservas/${modalState.reserva.id}/alterar`, {
                room_id: novoQuartoId,
                total_price: novoTotal
            });
            
            if (response.data.success) {
                showMessage('success.room_changed', false);
                setModalState({ open: false, type: null, reserva: null });
                await carregarReservas();
            } else {
                throw new Error(response.data.message || getTranslation('errors.change_room', 'Erro ao trocar de quarto'));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || getTranslation('errors.change_room', 'Erro ao trocar de quarto');
            showMessage(errorMsg, true);
            throw new Error(errorMsg);
        }
    };

    const handleConfirmarCancelamento = async (motivo) => {
        try {
            const response = await api.put(`/reservas/${cancelModal.reserva.id}/cancelar`, { 
                motivo: motivo || 'Cancelado pelo cliente' 
            });
            
            if (response.data.success) {
                showMessage('success.reservation_cancelled', false);
                setCancelModal({ open: false, reserva: null });
                await carregarReservas();
            } else {
                throw new Error(response.data.message || getTranslation('errors.cancel_reservation', 'Erro ao cancelar reserva'));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || getTranslation('errors.cancel_reservation', 'Erro ao cancelar reserva');
            showMessage(errorMsg, true);
        }
    };

    const handleConfirmarAlteracao = async (checkIn, checkOut) => {
        try {
            const response = await api.put(`/reservas/${modalState.reserva.id}/alterar`, { 
                check_in: checkIn, 
                check_out: checkOut 
            });
            
            if (response.data.success) {
                showMessage('success.reservation_changed', false);
                setModalState({ open: false, type: null, reserva: null });
                await carregarReservas();
            } else {
                throw new Error(response.data.message || getTranslation('errors.change_reservation', 'Erro ao alterar reserva'));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || getTranslation('errors.change_reservation', 'Erro ao alterar reserva');
            showMessage(errorMsg, true);
            throw new Error(errorMsg);
        }
    };

    const handleRecibo = (reserva) => {
        window.open(`/recibo/${reserva.reservation_code}`, '_blank');
    };

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{getTranslation('common.loading', 'Carregando suas reservas...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header 
                nomeCliente={cliente?.name}
                totalReservas={reservas.length}
                totalGasto={totalGasto}
            />

            {error && (
                <div className={styles.errorMessage}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{getTranslation('guest_area.active_reservations', 'Reservas Ativas')}</h2>
                {reservas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{getTranslation('guest_area.no_active_reservations', 'Você não possui reservas ativas.')}</p>
                        <button onClick={() => navigate('/')} className={styles.reservarButton}>
                            {getTranslation('guest_area.make_reservation', 'Fazer uma reserva')}
                        </button>
                    </div>
                ) : (
                    reservas.map(reserva => (
                        <ReservaCard
                            key={reserva.id}
                            reserva={reserva}
                            onAlterar={handleAlterar}
                            onTrocarQuarto={handleTrocarQuarto}
                            onCancelar={handleCancelarClick}
                            onRecibo={handleRecibo}
                            t={t}
                        />
                    ))
                )}
            </section>

            {historico.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{getTranslation('guest_area.history', 'Histórico de Reservas')}</h2>
                    <HistoricoTable historico={historico} />
                </section>
            )}

            <PolicySection />

            <Footer voltarParaCheckout={true} />

            {modalState.open && modalState.type === 'alterar' && (
                <AlterarDatasModal
                    reserva={modalState.reserva}
                    onConfirm={handleConfirmarAlteracao}
                    onClose={() => setModalState({ open: false, type: null, reserva: null })}
                />
            )}

            {modalState.open && modalState.type === 'trocar' && (
                <TrocarQuartoModal
                    reserva={modalState.reserva}
                    onConfirm={handleConfirmarTroca}
                    onClose={() => setModalState({ open: false, type: null, reserva: null })}
                />
            )}

            {cancelModal.open && (
                <CancelarReservaModal
                    reserva={cancelModal.reserva}
                    onConfirm={handleConfirmarCancelamento}
                    onClose={() => setCancelModal({ open: false, reserva: null })}
                    loading={false}
                />
            )}
        </div>
    );
};

export default MinhasReservas;
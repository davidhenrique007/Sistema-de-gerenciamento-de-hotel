import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCliente } from '@hooks/useCliente';
import api from '@services/api';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ReservaCard from './components/ReservaCard/ReservaCard';
import HistoricoTable from './components/HistoricoTable/HistoricoTable';
import PolicySection from './components/PolicySection/PolicySection';
import AlterarDatasModal from './components/modals/AlterarDatasModal';
import TrocarQuartoModal from './components/modals/TrocarQuartoModal';
import styles from './styles/MinhasReservas.module.css';

const MinhasReservas = () => {
    const { cliente, isIdentificado, loading: authLoading } = useCliente();
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ open: false, type: null, reserva: null });

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
            setError('Não foi possível carregar suas reservas');
        } finally {
            setLoading(false);
        }
    }, [isIdentificado, cliente?.id]);

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

    const handleConfirmarTroca = async (novoQuartoId, novoTotal) => {
        try {
            const response = await api.put(`/reservas/${modalState.reserva.id}/alterar`, {
                room_id: novoQuartoId,
                total_price: novoTotal
            });
            
            if (response.data.success) {
                alert(response.data.message || 'Quarto alterado com sucesso!');
                setModalState({ open: false, type: null, reserva: null });
                // Recarregar reservas sem recarregar a página
                await carregarReservas();
            } else {
                throw new Error(response.data.message || 'Erro ao trocar de quarto');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Erro ao trocar de quarto';
            alert(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const handleCancelar = async (reserva) => {
        const checkIn = new Date(reserva.check_in);
        const hoje = new Date();
        const diffHoras = (checkIn - hoje) / (1000 * 60 * 60);
        
        let mensagem = `Tem certeza que deseja cancelar a reserva ${reserva.reservation_code}?`;
        
        if (diffHoras < 24) {
            mensagem += `\n\n⚠️ ATENÇÃO: O check-in é em menos de 24h. O cancelamento pode estar sujeito a multa.`;
        } else {
            mensagem += `\n\n✓ Cancelamento grátis (até 24h antes do check-in).`;
        }
        
        if (window.confirm(mensagem)) {
            try {
                await api.put(`/reservas/${reserva.id}/cancelar`, { motivo: 'Cancelado pelo cliente' });
                alert('Reserva cancelada com sucesso!');
                // Recarregar reservas sem recarregar a página
                await carregarReservas();
            } catch (err) {
                alert('Erro ao cancelar reserva: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleConfirmarAlteracao = async (checkIn, checkOut) => {
        try {
            const response = await api.put(`/reservas/${modalState.reserva.id}/alterar`, { 
                check_in: checkIn, 
                check_out: checkOut 
            });
            
            if (response.data.success) {
                alert('Reserva alterada com sucesso!');
                setModalState({ open: false, type: null, reserva: null });
                // Recarregar reservas sem recarregar a página
                await carregarReservas();
            } else {
                throw new Error(response.data.message || 'Erro ao alterar reserva');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Erro ao alterar reserva';
            alert(errorMsg);
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
                    <p>Carregando suas reservas...</p>
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
                <h2 className={styles.sectionTitle}>Reservas Ativas</h2>
                {reservas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Você não possui reservas ativas.</p>
                        <button onClick={() => navigate('/')} className={styles.reservarButton}>
                            Fazer uma reserva
                        </button>
                    </div>
                ) : (
                    reservas.map(reserva => (
                        <ReservaCard
                            key={reserva.id}
                            reserva={reserva}
                            onAlterar={handleAlterar}
                            onTrocarQuarto={handleTrocarQuarto}
                            onCancelar={handleCancelar}
                            onRecibo={handleRecibo}
                        />
                    ))
                )}
            </section>

            {historico.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Histórico de Reservas</h2>
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
        </div>
    );
};

export default MinhasReservas;

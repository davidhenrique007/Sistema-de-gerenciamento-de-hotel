import React, { useState, useEffect } from 'react';
import api from '@services/api';
import styles from './Modal.module.css';

const TrocarQuartoModal = ({ reserva, onConfirm, onClose }) => {
    const [quartos, setQuartos] = useState([]);
    const [quartoSelecionado, setQuartoSelecionado] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        carregarQuartosDisponiveis();
    }, []);

    const carregarQuartosDisponiveis = async () => {
        try {
            const response = await api.get('/reservas/quartos/disponiveis');
            // Filtrar o quarto atual
            const quartosFiltrados = response.data.data.filter(q => q.id !== reserva.room_id);
            setQuartos(quartosFiltrados);
        } catch (err) {
            setError('Erro ao carregar quartos disponíveis');
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

    const calcularNovoTotal = (quarto) => {
        const noites = Math.ceil((new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24));
        const baseTotal = quarto.price_per_night * noites;
        const totalComTaxa = baseTotal * 1.05;
        return totalComTaxa.toFixed(2);
    };

    const handleConfirm = async () => {
        if (!quartoSelecionado) {
            setError('Selecione um quarto');
            return;
        }

        const quartoEscolhido = quartos.find(q => q.id === quartoSelecionado);
        const novoTotal = calcularNovoTotal(quartoEscolhido);

        setLoading(true);
        setError(null);
        
        try {
            await onConfirm(quartoSelecionado, novoTotal);
        } catch (err) {
            setError(err.message || 'Erro ao trocar de quarto');
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Trocar de Quarto</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.reservaInfo}>
                        <strong>{reserva?.reservation_code}</strong>
                        <span className={`${styles.statusBadge} ${styles.confirmed}`}>✓ Confirmada</span>
                    </div>
                    
                    <div className={styles.currentRoom}>
                        <p>Quarto atual: <strong>{reserva?.room_number} - {reserva?.room_type}</strong></p>
                        <p>Valor atual: <strong>{formatarMoeda(reserva?.total_price)}</strong></p>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Escolha um novo quarto:</label>
                        <select 
                            value={quartoSelecionado}
                            onChange={(e) => setQuartoSelecionado(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="">Selecione um quarto</option>
                            {quartos.map(q => {
                                const novoTotal = calcularNovoTotal(q);
                                return (
                                    <option key={q.id} value={q.id}>
                                        Quarto {q.room_number} - {q.type} - {formatarMoeda(q.price_per_night)}/noite → Total: {formatarMoeda(novoTotal)}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    
                    {quartos.length === 0 && !loading && (
                        <div className={styles.warning}>Nenhum quarto disponível no momento</div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton} disabled={loading}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !quartoSelecionado}
                        className={styles.confirmButton}
                    >
                        {loading ? 'Processando...' : 'Confirmar troca'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrocarQuartoModal;

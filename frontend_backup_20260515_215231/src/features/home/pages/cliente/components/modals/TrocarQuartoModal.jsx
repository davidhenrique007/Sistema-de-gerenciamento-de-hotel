import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { calculateNights } from '@/core/utils/dateFormatter';
import api from '@services/api';
import styles from './Modal.module.css';

const TrocarQuartoModal = ({ reserva, onConfirm, onClose }) => {
    const { t } = useI18n();
    const [quartos, setQuartos] = useState([]);
    const [quartoSelecionado, setQuartoSelecionado] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    useEffect(() => {
        carregarQuartosDisponiveis();
    }, []);

    const carregarQuartosDisponiveis = async () => {
        try {
            const response = await api.get('/reservas/quartos/disponiveis');
            const quartosFiltrados = response.data.data.filter(q => q.id !== reserva.room_id);
            setQuartos(quartosFiltrados);
        } catch (err) {
            setError(getTranslation('errors.load_rooms', 'Erro ao carregar quartos disponiveis'));
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

    const noites = calculateNights(reserva.check_in, reserva.check_out);

    const calcularNovoTotal = (quarto) => {
        const baseTotal = parseFloat(quarto.price_per_night) * noites;
        const totalComTaxa = baseTotal * 1.05;
        return totalComTaxa.toFixed(2);
    };

    const handleConfirm = async () => {
        if (!quartoSelecionado) {
            setError(getTranslation('errors.select_room', 'Selecione um quarto'));
            return;
        }

        const quartoEscolhido = quartos.find(q => q.id === quartoSelecionado);
        const novoTotal = calcularNovoTotal(quartoEscolhido);

        setLoading(true);
        setError(null);
        
        try {
            await onConfirm(quartoSelecionado, novoTotal);
        } catch (err) {
            setError(err.message || getTranslation('errors.change_room', 'Erro ao trocar de quarto'));
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{getTranslation('reservation.change_room', 'Trocar de Quarto')}</h2>
                    <button onClick={onClose} className={styles.closeButton}>X</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.reservaInfo}>
                        <strong>{reserva?.reservation_code}</strong>
                        <span className={`${styles.statusBadge} ${styles.confirmed}`}>
                            [OK] {getTranslation('reservation.confirmed', 'Confirmada')}
                        </span>
                    </div>
                    
                    <div className={styles.currentRoom}>
                        <p>{getTranslation('reservation.current_room', 'Quarto atual')}: <strong>{reserva?.room_number} - {reserva?.room_type}</strong></p>
                        <p>{getTranslation('reservation.current_value', 'Valor atual')}: <strong>{formatarMoeda(reserva?.total_price)}</strong></p>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{getTranslation('reservation.choose_new_room', 'Escolha um novo quarto')}:</label>
                        <select 
                            value={quartoSelecionado}
                            onChange={(e) => setQuartoSelecionado(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="">{getTranslation('reservation.select_room', 'Selecione um quarto')}</option>
                            {quartos.map(q => {
                                const novoTotal = calcularNovoTotal(q);
                                return (
                                    <option key={q.id} value={q.id}>
                                        {getTranslation('rooms.room', 'Quarto')} {q.room_number} - {q.type} - {formatarMoeda(q.price_per_night)}/noite | {getTranslation('common.total', 'Total')}: {formatarMoeda(novoTotal)}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    
                    {quartos.length === 0 && !loading && (
                        <div className={styles.warning}>{getTranslation('errors.no_rooms_available', 'Nenhum quarto disponivel no momento')}</div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton} disabled={loading}>
                        {getTranslation('common.cancel', 'Cancelar')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !quartoSelecionado}
                        className={styles.confirmButton}
                    >
                        {loading ? getTranslation('common.processing', 'Processando...') : getTranslation('common.confirm', 'Confirmar troca')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrocarQuartoModal;
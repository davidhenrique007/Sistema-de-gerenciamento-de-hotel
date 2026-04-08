// src/features/home/pages/cliente/hooks/useMinhasReservas.js
import { useState, useEffect, useCallback } from 'react';
import { reservaService } from '../services/reservaService';

export const useMinhasReservas = (clienteId, isIdentificado) => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({
        open: false,
        type: null,
        reserva: null
    });

    const carregarReservas = useCallback(async () => {
        if (!clienteId || !isIdentificado) return;
        
        setLoading(true);
        const result = await reservaService.listarPorCliente(clienteId);
        
        if (result.success) {
            // Filtrar apenas reservas ativas e futuras
            const reservasFuturas = result.data.filter(r => 
                new Date(r.check_out) >= new Date()
            );
            setReservas(reservasFuturas);
            setError(null);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, [clienteId, isIdentificado]);

    const handleCancelarReserva = async (reserva, motivo) => {
        const result = await reservaService.cancelar(reserva.id, motivo);
        if (result.success) {
            await carregarReservas();
            fecharModal();
        }
        return result;
    };

    const handleAlterarDatas = async (reserva, checkIn, checkOut) => {
        const result = await reservaService.alterarDatas(reserva.id, checkIn, checkOut);
        if (result.success) {
            await carregarReservas();
            fecharModal();
        }
        return result;
    };

    const handleReenviarRecibo = async (reserva) => {
        const result = await reservaService.reenviarRecibo(reserva.reservation_code);
        return result;
    };

    const abrirModal = (type, reserva) => {
        setModalState({
            open: true,
            type,
            reserva
        });
    };

    const fecharModal = () => {
        setModalState({
            open: false,
            type: null,
            reserva: null
        });
    };

    useEffect(() => {
        carregarReservas();
    }, [carregarReservas]);

    return {
        reservas,
        loading,
        error,
        modalState,
        abrirModal,
        fecharModal,
        handleCancelarReserva,
        handleAlterarDatas,
        handleReenviarRecibo,
        recarregar: carregarReservas
    };
};
// src/features/home/pages/cliente/services/reservaService.js
import api from '@services/api';

export const reservaService = {
    // Listar reservas do cliente
    listarPorCliente: async (clienteId) => {
        try {
            const response = await api.get(`/reservas/cliente/${clienteId}`);
            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total || 0
            };
        } catch (error) {
            console.error('Erro ao listar reservas:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao carregar reservas',
                data: []
            };
        }
    },

    // Cancelar reserva
    cancelar: async (reservaId, motivo) => {
        try {
            const response = await api.put(`/reservas/${reservaId}/cancelar`, { motivo });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao cancelar reserva'
            };
        }
    },

    // Alterar datas da reserva
    alterarDatas: async (reservaId, checkIn, checkOut) => {
        try {
            const response = await api.put(`/reservas/${reservaId}/alterar`, { check_in: checkIn, check_out: checkOut });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao alterar reserva'
            };
        }
    },

    // Reenviar recibo
    reenviarRecibo: async (reservaCode) => {
        try {
            const response = await api.post(`/reservas/${reservaCode}/reenviar-recibo`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao reenviar recibo'
            };
        }
    }
};
export const getStatusInfo = (status) => {
    const statusMap = {
        confirmed: { 
            label: 'Confirmada', 
            icon: '✔', 
            color: '#10b981', 
            bg: '#d1fae5',
            badgeClass: 'confirmed'
        },
        pending: { 
            label: 'Pendente', 
            icon: '⏳', 
            color: '#f59e0b', 
            bg: '#fef3c7',
            badgeClass: 'pending'
        },
        cancelled: { 
            label: 'Cancelada', 
            icon: '✖', 
            color: '#ef4444', 
            bg: '#fee2e2',
            badgeClass: 'cancelled'
        },
        finalized: { 
            label: 'Concluída', 
            icon: '✓', 
            color: '#6b7280', 
            bg: '#f3f4f6',
            badgeClass: 'finalized'
        }
    };
    return statusMap[status] || statusMap.pending;
};

export const getTipoQuartoNome = (tipo) => {
    const tipos = {
        standard: 'Quarto Standard',
        deluxe: 'Suite Deluxe',
        suite: 'Suite Presidencial',
        family: 'Quarto Família',
        superior: 'Quarto Superior'
    };
    return tipos[tipo] || tipo;
};

export const getMetodoPagamentoNome = (metodo) => {
    const metodos = {
        mpesa: 'M-Pesa',
        cartao: 'Cartão',
        dinheiro: 'Dinheiro',
        transferencia: 'Transferência'
    };
    return metodos[metodo] || metodo;
};

export const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-MZ', { 
        style: 'currency', 
        currency: 'MZN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
};

export const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace('.', '');
};

export const calcularNoites = (checkIn, checkOut) => {
    const diff = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return diff;
};

import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit2, FiXCircle, FiDollarSign, FiMail, FiLogIn, FiLogOut } from 'react-icons/fi';
import ModalEditarReserva from './ModalEditarReserva';
import ModalCancelamento from './ModalCancelamento';
import styles from './AcoesReserva.module.css';

const AcoesReserva = ({ reserva, onAcaoRealizada, permissoes }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    };
    
    if (menuAberto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAberto]);

  const pode = (acao) => {
    const permissoesMap = {
      editar: ['admin', 'supervisor', 'receptionist'],
      cancelar: ['admin', 'supervisor'],
      confirmarPagamento: ['admin', 'supervisor', 'financial'],
      reenviarRecibo: ['admin', 'supervisor', 'receptionist', 'financial'],
      checkin: ['admin', 'supervisor', 'receptionist'],
      checkout: ['admin', 'supervisor', 'receptionist']
    };
    return permissoesMap[acao]?.includes(permissoes.role) || false;
  };

  const getIconColor = (acao) => {
    const cores = {
      editar: styles.iconBlue,
      cancelar: styles.iconRed,
      confirmarPagamento: styles.iconGreen,
      reenviarRecibo: styles.iconPurple,
      checkin: styles.iconGreen,
      checkout: styles.iconOrange
    };
    return cores[acao] || styles.iconGray;
  };

  const acoesDisponiveis = () => {
    const status = reserva.status_reserva || reserva.status;
    const pagamento = reserva.status_pagamento || reserva.payment_status;
    const acoes = [];

    if (pode('editar') && ['PENDENTE', 'CONFIRMADA', 'pending', 'confirmed'].includes(status)) {
      acoes.push({ key: 'editar', label: 'Editar', icon: FiEdit2 });
    }
    if (pode('cancelar') && ['PENDENTE', 'CONFIRMADA', 'pending', 'confirmed'].includes(status)) {
      acoes.push({ key: 'cancelar', label: 'Cancelar', icon: FiXCircle });
    }
    if (pode('confirmarPagamento') && status === 'confirmed' && pagamento !== 'paid') {
      acoes.push({ key: 'confirmarPagamento', label: 'Confirmar Pagamento', icon: FiDollarSign });
    }
    if (pode('reenviarRecibo') && ['confirmed', 'occupied', 'finished'].includes(status)) {
      acoes.push({ key: 'reenviarRecibo', label: 'Reenviar Recibo', icon: FiMail });
    }
    if (pode('checkin') && status === 'confirmed') {
      acoes.push({ key: 'checkin', label: 'Check-in', icon: FiLogIn });
    }
    if (pode('checkout') && status === 'occupied') {
      acoes.push({ key: 'checkout', label: 'Check-out', icon: FiLogOut });
    }

    return acoes;
  };

  const executarAcao = async (acao) => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    const reservaId = reserva.id || reserva.reservation_code;

    try {
      let response;
      switch (acao) {
        case 'confirmarPagamento':
          response = await fetch(`http://localhost:5000/api/admin/reservas/${reservaId}/confirmar-pagamento`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor_pago: reserva.valor_total || reserva.total_price })
          });
          break;
        case 'reenviarRecibo':
          response = await fetch(`http://localhost:5000/api/admin/reservas/${reservaId}/reenviar-recibo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          break;
        case 'checkin':
          response = await fetch(`http://localhost:5000/api/admin/reservas/${reservaId}/checkin`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          break;
        case 'checkout':
          response = await fetch(`http://localhost:5000/api/admin/reservas/${reservaId}/checkout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          break;
        default:
          return;
      }

      const data = await response.json();
      if (data.success) {
        onAcaoRealizada();
        setMenuAberto(false);
      } else {
        alert(data.message || 'Erro ao executar ação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.actionsContainer} ref={menuRef}>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className={styles.actionsButton}
          disabled={loading}
        >
          <FiMoreVertical size={18} />
        </button>

        {menuAberto && (
          <div className={styles.dropdownMenu}>
            {acoesDisponiveis().map((acao) => (
              <button
                key={acao.key}
                onClick={() => {
                  setMenuAberto(false);
                  if (acao.key === 'editar') setModalEditarAberto(true);
                  else if (acao.key === 'cancelar') setModalCancelarAberto(true);
                  else executarAcao(acao.key);
                }}
                className={styles.dropdownItem}
              >
                <acao.icon size={18} className={getIconColor(acao.key)} />
                <span className={styles.itemLabel}>{acao.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ModalEditarReserva
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        reserva={reserva}
        onSuccess={onAcaoRealizada}
      />

      <ModalCancelamento
        isOpen={modalCancelarAberto}
        onClose={() => setModalCancelarAberto(false)}
        reserva={reserva}
        onSuccess={onAcaoRealizada}
      />
    </>
  );
};

export default AcoesReserva;

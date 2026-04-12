import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiHome, FiCreditCard, FiFileText, FiSave, FiAlertCircle } from 'react-icons/fi';
import styles from './ModalEditarReserva.module.css';

const ModalEditarReserva = ({ isOpen, onClose, reserva, onSuccess }) => {
  const [formData, setFormData] = useState({
    quarto_id: '',
    data_checkin: '',
    data_checkout: '',
    metodo_pagamento: '',
    observacoes: ''
  });
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoQuartos, setCarregandoQuartos] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && reserva) {
      setFormData({
        quarto_id: reserva.quarto_id || reserva.room_id || '',
        data_checkin: reserva.data_checkin?.split('T')[0] || reserva.check_in?.split('T')[0] || '',
        data_checkout: reserva.data_checkout?.split('T')[0] || reserva.check_out?.split('T')[0] || '',
        metodo_pagamento: reserva.metodo_pagamento || reserva.payment_method || '',
        observacoes: reserva.observacoes || reserva.special_requests || ''
      });
      carregarQuartosDisponiveis();
    }
  }, [isOpen, reserva]);

  const carregarQuartosDisponiveis = async () => {
    setCarregandoQuartos(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/quartos/disponiveis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📋 Resposta da API de quartos:', data);
      
      if (data.success && data.data) {
        setQuartos(data.data);
        console.log('✅ Quartos carregados:', data.data.length);
        console.log('📊 Primeiro quarto:', data.data[0]);
      } else {
        console.error('Erro na resposta:', data);
      }
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setCarregandoQuartos(false);
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    if (!formData.data_checkin) novosErros.data_checkin = 'Data de check-in é obrigatória';
    if (!formData.data_checkout) novosErros.data_checkout = 'Data de check-out é obrigatória';
    if (formData.data_checkin && formData.data_checkout && formData.data_checkin > formData.data_checkout) {
      novosErros.data_checkout = 'Check-out deve ser após check-in';
    }
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    const reservaId = reserva.id || reserva.reservation_code;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/reservas/${reservaId}/editar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Erro ao editar reserva');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao editar reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Editar Reserva</h2>
            <p className={styles.modalSubtitle}>Reserva #{reserva?.codigo_reserva || reserva?.reservation_code}</p>
          </div>
          <button onClick={onClose} className={styles.modalClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>
                <FiAlertCircle /> Informações Atuais
              </h3>
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.infoLabel}>Cliente:</div>
                  <div className={styles.infoValue}>{reserva?.cliente_nome || reserva?.guest_name}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Telefone:</div>
                  <div className={styles.infoValue}>{reserva?.cliente_telefone || reserva?.guest_phone}</div>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiHome /> Quarto
              </label>
              <select
                value={formData.quarto_id}
                onChange={(e) => setFormData({ ...formData, quarto_id: e.target.value })}
                className={styles.formInput}
                disabled={carregandoQuartos}
              >
                <option value="">Selecione um quarto</option>
                {quartos.length > 0 ? (
                  quartos.map(quarto => (
                    <option key={quarto.id} value={quarto.id}>
                      #{quarto.room_number} - {quarto.type} - {parseFloat(quarto.price_per_night).toLocaleString('pt-MZ')} MTn/dia
                    </option>
                  ))
                ) : (
                  <option disabled>Nenhum quarto disponível</option>
                )}
              </select>
              {carregandoQuartos && <div className={styles.loadingText}>Carregando quartos...</div>}
              {!carregandoQuartos && quartos.length === 0 && (
                <div className={styles.errorMessage}>Nenhum quarto disponível encontrado</div>
              )}
            </div>

            <div className={styles.grid2Cols}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiCalendar /> Check-in
                </label>
                <input
                  type="date"
                  value={formData.data_checkin}
                  onChange={(e) => setFormData({ ...formData, data_checkin: e.target.value })}
                  className={`${styles.formInput} ${errors.data_checkin ? styles.formInputError : ''}`}
                />
                {errors.data_checkin && <div className={styles.errorMessage}>{errors.data_checkin}</div>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiCalendar /> Check-out
                </label>
                <input
                  type="date"
                  value={formData.data_checkout}
                  onChange={(e) => setFormData({ ...formData, data_checkout: e.target.value })}
                  className={`${styles.formInput} ${errors.data_checkout ? styles.formInputError : ''}`}
                />
                {errors.data_checkout && <div className={styles.errorMessage}>{errors.data_checkout}</div>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiCreditCard /> Método de Pagamento
              </label>
              <select
                value={formData.metodo_pagamento}
                onChange={(e) => setFormData({ ...formData, metodo_pagamento: e.target.value })}
                className={styles.formInput}
              >
                <option value="">Selecione</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FiFileText /> Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows="3"
                className={styles.formInput}
                placeholder="Observações adicionais sobre a reserva..."
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.btnSave}>
              <FiSave size={18} />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarReserva;

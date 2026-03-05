import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './ReservationForm.module.css';

const ReservationForm = ({ selectedRoom, onSubmit }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState({
    adults: 2,
    children: 1,
    babies: 0
  });

  if (!selectedRoom) {
    return (
      <div className={styles.emptyState}>
        <p>Selecione um quarto para fazer sua reserva</p>
      </div>
    );
  }

  const handleGuestChange = (type, operation) => {
    setGuests(prev => {
      const newValue = operation === 'increment' ? prev[type] + 1 : prev[type] - 1;
      
      if (type === 'adults' && newValue < 1) return prev;
      if (type === 'children' && newValue < 0) return prev;
      if (type === 'babies' && newValue < 0) return prev;
      
      return {
        ...prev,
        [type]: newValue
      };
    });
  };

  const totalGuests = guests.adults + guests.children + guests.babies;
  
  // Cálculo das noites
  const nights = checkIn && checkOut 
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 0;
  
  // Cálculo dos valores
  const pricePerNight = selectedRoom.price.amount;
  const subtotal = nights * pricePerNight;
  const taxes = Math.round(subtotal * 0.05); // 5% de taxas
  const total = subtotal + taxes;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'dd MMM', { locale: ptBR });
  };

  return (
    <div className={styles.container}>
      {/* Título */}
      <h1 className={styles.mainTitle}>Faça sua Reserva</h1>

      {/* Card do quarto */}
      <div className={styles.roomCard}>
        <div className={styles.roomHeader}>
          <span className={styles.roomNumber}>Quarto {selectedRoom.number}</span>
          <span className={styles.roomType}>{selectedRoom.typeLabel}</span>
        </div>
        <div className={styles.roomDetails}>
          <span>até {selectedRoom.capacity} hóspedes</span>
          <span className={styles.roomPrice}>
            {formatCurrency(pricePerNight)} <span className={styles.perNight}>/ noite</span>
          </span>
        </div>
      </div>

      {/* ============================================
          LINHA PRINCIPAL: CHECK-IN/OUT (ESQUERDA) + HÓSPEDES (DIREITA)
          ============================================ */}
      <div className={styles.mainRow}>
        {/* Coluna Esquerda: CHECK-IN e CHECK-OUT */}
        <div className={styles.datesColumn}>
          {/* CHECK-IN */}
          <div className={styles.dateBox}>
            <label className={styles.dateLabel}>CHECK-IN</label>
            <input
              type="date"
              className={styles.dateInput}
              value={checkIn}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value > checkOut) {
                  setCheckOut('');
                }
              }}
            />
            {checkIn && (
              <div className={styles.dateDisplay}>
                <span className={styles.dateFull}>{formatDate(checkIn)}</span>
                <span className={styles.dateShort}>{formatDateShort(checkIn)}</span>
              </div>
            )}
          </div>

          {/* CHECK-OUT */}
          <div className={styles.dateBox}>
            <label className={styles.dateLabel}>CHECK-OUT</label>
            <input
              type="date"
              className={styles.dateInput}
              value={checkOut}
              min={checkIn || format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setCheckOut(e.target.value)}
              disabled={!checkIn}
            />
            {checkOut && (
              <div className={styles.dateDisplay}>
                <span className={styles.dateFull}>{formatDate(checkOut)}</span>
                <span className={styles.dateShort}>{formatDateShort(checkOut)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: HÓSPEDES */}
        <div className={styles.guestsColumn}>
          <h3 className={styles.guestsTitle}>HÓSPEDES</h3>
          
          {/* Adultos */}
          <div className={styles.guestRow}>
            <span className={styles.guestLabel}>Adultos</span>
            <div className={styles.guestControls}>
              <button 
                className={styles.guestBtn}
                onClick={() => handleGuestChange('adults', 'decrement')}
                disabled={guests.adults <= 1}
              >−</button>
              <span className={styles.guestCount}>{guests.adults}</span>
              <button 
                className={styles.guestBtn}
                onClick={() => handleGuestChange('adults', 'increment')}
              >+</button>
            </div>
          </div>

          {/* Crianças */}
          <div className={styles.guestRow}>
            <span className={styles.guestLabel}>Crianças (2 a 12 anos)</span>
            <div className={styles.guestControls}>
              <button 
                className={styles.guestBtn}
                onClick={() => handleGuestChange('children', 'decrement')}
                disabled={guests.children <= 0}
              >−</button>
              <span className={styles.guestCount}>{guests.children}</span>
              <button 
                className={styles.guestBtn}
                onClick={() => handleGuestChange('children', 'increment')}
              >+</button>
            </div>
          </div>

          {/* Bebês */}
          <div className={styles.guestRow}>
            <span className={styles.guestLabel}>Bebês (abaixo de 2 anos)</span>
            <div className={styles.guestControls}>
              <button 
                className={styles.guestBtn}
                onClick={() => handleGuestChange('babies', 'decrement')}
                disabled={guests.babies <= 0}
              >−</button>
              <span className={styles.guestCount}>{guests.babies}</span>
              <button 
                className={styles.guestBtn}
                onClick={() => handleGuestChange('babies', 'increment')}
              >+</button>
            </div>
          </div>

          {/* Total de hóspedes */}
          <div className={styles.totalGuests}>
            <span>Total de hóspedes:</span>
            <strong>{totalGuests}</strong>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className={styles.benefitsSection}>
        <h3 className={styles.sectionTitle}>Benefícios da Estadia</h3>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>✅ Wi-Fi grátis</div>
          <div className={styles.benefitItem}>✅ Café da manhã incluído</div>
          <div className={styles.benefitItem}>✅ Cancelamento gratuito</div>
          <div className={styles.benefitItem}>✅ Estacionamento</div>
          <div className={styles.benefitItem}>✅ Recepção 24h</div>
        </div>
      </div>

      {/* RESUMO DA RESERVA */}
      {checkIn && checkOut && (
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>Resumo da Reserva</h3>
          
          <div className={styles.summaryRow}>
            <span>Estadia</span>
            <span className={styles.summaryValue}>
              {formatDateShort(checkIn)} – {formatDateShort(checkOut)}
            </span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Hóspedes</span>
            <span className={styles.summaryValue}>{totalGuests}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Noites</span>
            <span className={styles.summaryValue}>{nights}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Preço por noite</span>
            <span className={styles.summaryValue}>{formatCurrency(pricePerNight)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span className={styles.summaryValue}>{formatCurrency(subtotal)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Taxas (5%)</span>
            <span className={styles.summaryValue}>{formatCurrency(taxes)}</span>
          </div>
          
          <div className={styles.summaryTotal}>
            <span>TOTAL</span>
            <span className={styles.totalValue}>{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Botão Confirmar */}
      <button 
        className={styles.confirmButton}
        onClick={() => onSubmit && onSubmit({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guests,
          nights,
          subtotal,
          taxes,
          total
        })}
        disabled={!checkIn || !checkOut}
      >
        Confirmar Reserva
      </button>
    </div>
  );
};

ReservationForm.propTypes = {
  selectedRoom: PropTypes.shape({
    id: PropTypes.string,
    number: PropTypes.string,
    typeLabel: PropTypes.string,
    capacity: PropTypes.number,
    price: PropTypes.shape({
      amount: PropTypes.number,
      currency: PropTypes.string,
    }),
  }),
  onSubmit: PropTypes.func,
};

export default ReservationForm;
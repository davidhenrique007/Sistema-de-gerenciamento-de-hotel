import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import useReservationForm from '../../hooks/useReservationForm';
import GuestSelector from './GuestSelector';
import DatePicker from './DatePicker';
import PriceSummary from './PriceSummary';
import Button from '../../../../shared/components/ui/Button';
import styles from './ReservationForm.module.css';

/**
 * ReservationForm Component - Formulário completo de reserva
 * 
 * @component
 * @example
 * <ReservationForm
 *   selectedRoom={room}
 *   onSubmit={handleSubmit}
 * />
 */
const ReservationForm = ({ selectedRoom, onSubmit, className = '' }) => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const {
    isFormValid,
    validationErrors,
    guestCounter,
    datePicker,
    priceCalculation,
    handleSubmit,
    formTouched,
    isSubmitting,
  } = useReservationForm({ selectedRoom });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await handleSubmit();
      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      console.error('Erro ao submeter reserva:', error);
    }
  };

  // ==========================================================================
  // RENDER: SEM QUARTO SELECIONADO
  // ==========================================================================

  if (!selectedRoom) {
    return (
      <div className={`${styles.container} ${styles.empty} ${className}`}>
        <p className={styles.emptyMessage}>
          Selecione um quarto para fazer sua reserva
        </p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: FORMULÁRIO
  // ==========================================================================

  return (
    <form 
      className={`${styles.container} ${className}`}
      onSubmit={handleFormSubmit}
      noValidate
    >
      <h2 className={styles.title}>
        Reservar Quarto {selectedRoom.number}
      </h2>

      {/* Seleção de datas */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Data de check-in / check-out *
        </label>
        <DatePicker
          value={{ checkIn: datePicker.checkIn, checkOut: datePicker.checkOut }}
          onChange={({ checkIn, checkOut }) => {
            if (checkIn) datePicker.selectDate(checkIn);
            if (checkOut) datePicker.selectDate(checkOut);
          }}
          minDate={new Date()}
          placeholder="Selecionar datas"
        />
        
        {datePicker.checkIn && datePicker.checkOut && (
          <p className={styles.fieldHint}>
            {datePicker.nights} {datePicker.nights === 1 ? 'noite' : 'noites'}
          </p>
        )}
      </div>

      {/* Seleção de hóspedes */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Número de hóspedes *
        </label>
        <GuestSelector
          guests={guestCounter.guests}
          onIncrement={guestCounter.incrementGuest}
          onDecrement={guestCounter.decrementGuest}
          hasReachedMin={guestCounter.hasReachedMin}
          hasReachedMax={guestCounter.hasReachedMax}
        />
        {guestCounter.totalGuests > selectedRoom.capacity && (
          <p className={styles.fieldError}>
            Capacidade máxima do quarto: {selectedRoom.capacity} hóspedes
          </p>
        )}
      </div>

      {/* Resumo de preços */}
      {datePicker.checkIn && datePicker.checkOut && (
        <div className={styles.fieldGroup}>
          <PriceSummary
            breakdown={priceCalculation}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Botão de submit */}
      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Processando...' : 'Reservar Agora'}
        </Button>
      </div>

      {/* Erros de validação */}
      {formTouched && validationErrors.length > 0 && (
        <div className={styles.errors}>
          <p className={styles.errorsTitle}>
            Por favor, corrija os seguintes erros:
          </p>
          <ul className={styles.errorsList}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

ReservationForm.propTypes = {
  /** Quarto selecionado */
  selectedRoom: PropTypes.shape({
    id: PropTypes.string,
    number: PropTypes.string,
    capacity: PropTypes.number,
    price: PropTypes.shape({
      amount: PropTypes.number,
      currency: PropTypes.string,
    }),
  }),
  /** Função chamada ao submeter */
  onSubmit: PropTypes.func,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

ReservationForm.defaultProps = {
  selectedRoom: null,
  onSubmit: undefined,
  className: '',
};

export default memo(ReservationForm);
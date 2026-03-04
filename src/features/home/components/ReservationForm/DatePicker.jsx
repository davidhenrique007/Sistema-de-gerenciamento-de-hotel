import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Calendar from './Calendar';
import useDatePicker from '../../hooks/useDatePicker';
import styles from './DatePicker.module.css';

/**
 * DatePicker Component - Seletor de datas com calendário
 * 
 * @component
 * @example
 * <DatePicker
 *   value={dateRange}
 *   onChange={handleDateChange}
 *   minDate={new Date()}
 * />
 */
const DatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  blockedDates,
  placeholder = 'Selecionar data',
  className = '',
}) => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const {
    checkIn,
    checkOut,
    currentMonth,
    isOpen,
    selectDate,
    openPicker,
    closePicker,
    togglePicker,
    goToPreviousMonth,
    goToNextMonth,
    isDateDisabled,
    displayValue,
  } = useDatePicker({
    minDate,
    maxDate,
    blockedDates,
  });

  // ==========================================================================
  // REFS
  // ==========================================================================

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Sincronizar com value externo
  useEffect(() => {
    if (value && typeof value === 'object') {
      // Implementar sincronização se necessário
    }
  }, [value]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closePicker();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closePicker]);

  // Notificar mudanças
  useEffect(() => {
    if (onChange) {
      onChange({ checkIn, checkOut });
    }
  }, [checkIn, checkOut, onChange]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      {/* Input Field */}
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={displayValue}
          placeholder={placeholder}
          readOnly
          onClick={togglePicker}
          onFocus={openPicker}
          aria-label="Selecionar datas de check-in e check-out"
          aria-expanded={isOpen}
        />
        <span className={styles.icon} aria-hidden="true">
          📅
        </span>
      </div>

      {/* Calendário */}
      {isOpen && (
        <div className={styles.calendarWrapper}>
          <Calendar
            currentMonth={currentMonth}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDate={selectDate}
            isDateDisabled={isDateDisabled}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
        </div>
      )}
    </div>
  );
};

DatePicker.propTypes = {
  /** Valor controlado externamente */
  value: PropTypes.shape({
    checkIn: PropTypes.instanceOf(Date),
    checkOut: PropTypes.instanceOf(Date),
  }),
  /** Função chamada ao mudar datas */
  onChange: PropTypes.func,
  /** Data mínima permitida */
  minDate: PropTypes.instanceOf(Date),
  /** Data máxima permitida */
  maxDate: PropTypes.instanceOf(Date),
  /** Array de datas bloqueadas */
  blockedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  /** Placeholder do input */
  placeholder: PropTypes.string,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

DatePicker.defaultProps = {
  value: undefined,
  onChange: undefined,
  minDate: undefined,
  maxDate: undefined,
  blockedDates: [],
  placeholder: 'Selecionar data',
  className: '',
};

export default DatePicker;
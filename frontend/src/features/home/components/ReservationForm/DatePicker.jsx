import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Calendar from './Calendar';
import useDatePicker from '../../hooks/useDatePicker';
import styles from './DatePicker.module.css';

const DatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  blockedDates,
  placeholder = 'Selecionar data',
  className = '',
}) => {
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
  } = useDatePicker({ minDate, maxDate, blockedDates });

  const containerRef = useRef(null);
  const prevCheckInRef = useRef(checkIn);
  const prevCheckOutRef = useRef(checkOut);
  const isInternalChangeRef = useRef(false);

  // ==========================================================================
  // FECHAR AO CLICAR FORA
  // ==========================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closePicker();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closePicker]);

  // ==========================================================================
  // NOTIFICAR MUDANÇAS - COM PROTEÇÃO CONTRA LOOP
  // ==========================================================================
  useEffect(() => {
    // Evitar loop se for mudança interna
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const checkInChanged = prevCheckInRef.current !== checkIn;
    const checkOutChanged = prevCheckOutRef.current !== checkOut;

    if ((checkInChanged || checkOutChanged) && onChange) {
      onChange({ checkIn, checkOut });
    }

    prevCheckInRef.current = checkIn;
    prevCheckOutRef.current = checkOut;
  }, [checkIn, checkOut, onChange]);

  // ==========================================================================
  // HANDLER DE SELEÇÃO COM CONTROLE
  // ==========================================================================
  const handleSelectDate = useCallback((date) => {
    isInternalChangeRef.current = true;
    selectDate(date);
  }, [selectDate]);

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
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
        <span className={styles.icon}>📅</span>
      </div>

      {isOpen && (
        <div className={styles.calendarWrapper}>
          <Calendar
            currentMonth={currentMonth}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDate={handleSelectDate}
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
  value: PropTypes.shape({
    checkIn: PropTypes.instanceOf(Date),
    checkOut: PropTypes.instanceOf(Date),
  }),
  onChange: PropTypes.func,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  blockedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  placeholder: PropTypes.string,
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
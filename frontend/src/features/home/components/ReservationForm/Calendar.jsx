import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Calendar.module.css';

/**
 * Calendar Component - Calendário interativo para seleção de datas
 * 
 * @component
 * @example
 * <Calendar
 *   currentMonth={new Date()}
 *   checkIn={checkIn}
 *   checkOut={checkOut}
 *   onSelectDate={handleSelectDate}
 *   isDateDisabled={isDateDisabled}
 * />
 */
const Calendar = ({
  currentMonth,
  checkIn,
  checkOut,
  onSelectDate,
  isDateDisabled,
  onPrevMonth,
  onNextMonth,
}) => {
  // ==========================================================================
  // CONSTANTES
  // ==========================================================================

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // ==========================================================================
  // GERAR DIAS DO MÊS
  // ==========================================================================

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Dias do mês anterior (para preencher início)
    const startOffset = firstDay.getDay();
    for (let i = 0; i < startOffset; i++) {
      const date = new Date(year, month, -startOffset + i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({ date, isCurrentMonth: true });
    }

    // Dias do próximo mês (para completar 42 dias - 6 semanas)
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  // ==========================================================================
  // VERIFICAR SE DATA ESTÁ SELECIONADA
  // ==========================================================================

  const isSelected = (date) => {
    if (!date) return false;
    
    const dateStr = date.toDateString();
    
    if (checkIn && checkOut) {
      return (
        dateStr === checkIn.toDateString() ||
        dateStr === checkOut.toDateString()
      );
    }
    
    if (checkIn) {
      return dateStr === checkIn.toDateString();
    }
    
    return false;
  };

  const isInRange = (date) => {
    if (!checkIn || !checkOut || !date) return false;
    
    return date > checkIn && date < checkOut;
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={styles.calendar}>
      {/* Header do calendário */}
      <div className={styles.header}>
        <button
          className={styles.navButton}
          onClick={onPrevMonth}
          aria-label="Mês anterior"
          type="button"
        >
          ←
        </button>
        
        <h3 className={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          className={styles.navButton}
          onClick={onNextMonth}
          aria-label="Próximo mês"
          type="button"
        >
          →
        </button>
      </div>

      {/* Dias da semana */}
      <div className={styles.weekDays}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className={styles.daysGrid}>
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const disabled = isDateDisabled(date);
          const selected = isSelected(date);
          const inRange = isInRange(date);
          
          return (
            <button
              key={index}
              className={`
                ${styles.dayButton}
                ${!isCurrentMonth ? styles.otherMonth : ''}
                ${disabled ? styles.disabled : ''}
                ${selected ? styles.selected : ''}
                ${inRange ? styles.inRange : ''}
              `}
              onClick={() => onSelectDate(date)}
              disabled={disabled}
              aria-label={date.toLocaleDateString('pt-BR')}
              aria-selected={selected}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

Calendar.propTypes = {
  /** Mês atual a ser exibido */
  currentMonth: PropTypes.instanceOf(Date).isRequired,
  /** Data de check-in selecionada */
  checkIn: PropTypes.instanceOf(Date),
  /** Data de check-out selecionada */
  checkOut: PropTypes.instanceOf(Date),
  /** Função chamada ao selecionar uma data */
  onSelectDate: PropTypes.func.isRequired,
  /** Função para verificar se data está desabilitada */
  isDateDisabled: PropTypes.func.isRequired,
  /** Função para ir ao mês anterior */
  onPrevMonth: PropTypes.func.isRequired,
  /** Função para ir ao próximo mês */
  onNextMonth: PropTypes.func.isRequired,
};

Calendar.defaultProps = {
  checkIn: null,
  checkOut: null,
};

export default memo(Calendar);
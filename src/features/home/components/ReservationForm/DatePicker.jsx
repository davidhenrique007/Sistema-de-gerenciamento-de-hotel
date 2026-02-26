// ============================================
// COMPONENT: DatePicker
// ============================================
// Responsabilidade: Seleção de datas com calendário interativo
// Design System: Consistente com tokens visuais
// Acessibilidade: WCAG 2.1+ com navegação por teclado
// Arquitetura: Puramente apresentacional, desacoplado do domínio
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './DatePicker.module.css';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ============================================
// COMPONENTE CALENDÁRIO (INTERNO)
// ============================================

const Calendar = ({
  currentDate,
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  onClose,
  id
}) => {
  const calendarRef = useRef(null);
  const [displayMonth, setDisplayMonth] = useState(currentDate || new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minCompare = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;
    const maxCompare = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : null;
    
    if (minCompare && compareDate < minCompare) return true;
    if (maxCompare && compareDate > maxCompare) return true;
    return false;
  };

  const isDateSelected = (year, month, day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month &&
           selectedDate.getDate() === day;
  };

  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (year, month, day) => {
    const selected = new Date(year, month, day);
    if (!isDateDisabled(selected)) {
      onSelectDate(selected);
      onClose();
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      const firstButton = calendarRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, []);

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDay = getFirstDayOfMonth(displayMonth);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className={styles.calendarEmptyDay} />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const disabled = isDateDisabled(new Date(year, month, day));
    const selected = isDateSelected(year, month, day);
    const dateKey = `${year}-${month}-${day}`;
    
    days.push(
      <button
        key={dateKey}
        onClick={() => handleDateClick(year, month, day)}
        disabled={disabled}
        className={`
          ${styles.calendarDay}
          ${selected ? styles.calendarDaySelected : ''}
          ${disabled ? styles.calendarDayDisabled : ''}
        `}
        aria-label={`${day} de ${MONTHS[month]} de ${year}`}
        aria-selected={selected}
        aria-disabled={disabled}
      >
        {day}
      </button>
    );
  }

  return (
    <div 
      ref={calendarRef}
      className={styles.calendar}
      id={id}
      role="dialog"
      aria-label="Calendário de seleção de data"
      aria-modal="true"
    >
      <div className={styles.calendarHeader}>
        <button
          onClick={handlePrevMonth}
          className={styles.calendarNavButton}
          aria-label="Mês anterior"
        >
          ←
        </button>
        <span className={styles.calendarTitle}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={handleNextMonth}
          className={styles.calendarNavButton}
          aria-label="Próximo mês"
        >
          →
        </button>
      </div>

      <div className={styles.calendarWeekdays}>
        {WEEKDAYS_SHORT.map((day, index) => (
          <div key={day} className={styles.calendarWeekday} aria-label={WEEKDAYS_FULL[index]}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {days}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL DATEPICKER
// ============================================

export const DatePicker = ({
  value,
  onChange,
  error,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Selecionar data',
  label = 'Data',
  required = false,
  className = '',
  id: externalId,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const calendarId = useRef(`calendar-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = externalId || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
  
  useEffect(() => {
    setInternalValue(value || null);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      console.log('[DatePicker] Abrindo calendário');
      setIsOpen(true);
      setTouched(true);
    }
  }, [disabled]);

  const handleInputKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'Space':
        e.preventDefault();
        console.log('[DatePicker] Abrindo calendário via teclado');
        setIsOpen(true);
        setTouched(true);
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.focus();
        }
        break;
      case 'Tab':
        if (isOpen) {
          e.preventDefault();
          const calendar = document.getElementById(calendarId.current);
          const firstButton = calendar?.querySelector('button');
          firstButton?.focus();
        }
        break;
      default:
        break;
    }
  }, [disabled, isOpen]);

  const handleDateSelect = useCallback((date) => {
    console.log('[DatePicker] Data selecionada:', date);
    setInternalValue(date);
    onChange(date);
    setIsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [onChange]);

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const containerClasses = [
    styles.datePickerContainer,
    disabled && styles.disabled,
    isFocused && styles.focused,
    error && touched && styles.error,
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.datePickerInput,
    isOpen && styles.inputActive,
    error && touched && styles.inputError
  ].filter(Boolean).join(' ');

  console.log('[DatePicker] Renderizando com props:', {
    value,
    isOpen,
    disabled,
    error,
    touched,
    internalValue
  });

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      {...props}
    >
      {label && (
        <label 
          htmlFor={inputId}
          className={styles.datePickerLabel}
        >
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}

      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={formatDisplayDate(internalValue)}
          onClick={handleInputClick}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className={inputClasses}
          aria-invalid={error && touched}
          aria-describedby={error && touched ? `${inputId}-error` : undefined}
          aria-expanded={isOpen}
          aria-controls={calendarId.current}
          aria-haspopup="dialog"
          aria-label={label}
        />
        
        <span 
          className={styles.calendarIcon} 
          aria-hidden="true"
          onClick={handleInputClick}
        >
          📅
        </span>
      </div>

      {isOpen && (
        <Calendar
          currentDate={internalValue || new Date()}
          selectedDate={internalValue}
          onSelectDate={handleDateSelect}
          minDate={minDate}
          maxDate={maxDate}
          onClose={() => setIsOpen(false)}
          id={calendarId.current}
        />
      )}

      {error && touched && (
        <div 
          id={`${inputId}-error`}
          className={styles.errorMessage}
          role="alert"
        >
          <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
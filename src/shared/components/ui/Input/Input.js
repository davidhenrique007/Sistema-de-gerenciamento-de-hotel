// ============================================
// COMPONENT: Input
// ============================================
// Responsabilidade: Input reutilizável com validação
// Acessibilidade: Labels vinculadas, ARIA, mensagens de erro
// ============================================

import React, { forwardRef, useState, useId } from 'react';
import styles from './Input.module.css';

// ============================================
// CONSTANTES
// ============================================

export const InputType = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  DATE: 'date',
  TIME: 'time',
  DATETIME_LOCAL: 'datetime-local',
  SEARCH: 'search',
  URL: 'url'
};

export const InputSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

// ============================================
// VALIDADORES
// ============================================

const validators = {
  [InputType.EMAIL]: (value) => {
    if (!value) return { isValid: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      message: 'Por favor, insira um e-mail válido'
    };
  },
  
  [InputType.URL]: (value) => {
    if (!value) return { isValid: true };
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: 'Por favor, insira uma URL válida'
      };
    }
  },
  
  [InputType.NUMBER]: (value, min, max) => {
    if (!value && value !== 0) return { isValid: true };
    const num = Number(value);
    if (isNaN(num)) {
      return {
        isValid: false,
        message: 'Por favor, insira um número válido'
      };
    }
    if (min !== undefined && num < min) {
      return {
        isValid: false,
        message: `O valor mínimo é ${min}`
      };
    }
    if (max !== undefined && num > max) {
      return {
        isValid: false,
        message: `O valor máximo é ${max}`
      };
    }
    return { isValid: true };
  },
  
  [InputType.TEL]: (value) => {
    if (!value) return { isValid: true };
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    return {
      isValid: phoneRegex.test(value),
      message: 'Por favor, insira um telefone válido'
    };
  },
  
  [InputType.DATE]: (value, min, max) => {
    if (!value) return { isValid: true };
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        message: 'Por favor, insira uma data válida'
      };
    }
    if (min && date < new Date(min)) {
      return {
        isValid: false,
        message: `A data deve ser após ${new Date(min).toLocaleDateString()}`
      };
    }
    if (max && date > new Date(max)) {
      return {
        isValid: false,
        message: `A data deve ser antes de ${new Date(max).toLocaleDateString()}`
      };
    }
    return { isValid: true };
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Input = forwardRef(({
  // Identificação
  id,
  name,
  
  // Label
  label,
  hideLabel = false,
  
  // Tipo e valor
  type = InputType.TEXT,
  value = '',
  defaultValue,
  placeholder,
  
  // Validação
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  
  // Tamanho
  size = InputSize.MEDIUM,
  fullWidth = false,
  
  // Estados
  error: externalError,
  success = false,
  
  // Ícones
  leftIcon,
  rightIcon,
  
  // Eventos
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  
  // Classes
  className = '',
  inputClassName = '',
  
  // Acessibilidade
  ariaLabel,
  ariaDescribedby,
  autoComplete = 'off',
  
  // Resto das props
  ...props
}, ref) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [internalValue, setInternalValue] = useState(defaultValue || value || '');
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  
  // Gerar ID único se não fornecido
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  // ========================================
  // VALIDAÇÃO
  // ========================================
  
  const validate = (val) => {
    // Se tem erro externo, usar ele
    if (externalError) {
      return { isValid: false, message: externalError };
    }
    
    // Validação de campo obrigatório
    if (required && (!val || val.toString().trim() === '')) {
      return {
        isValid: false,
        message: 'Este campo é obrigatório'
      };
    }
    
    // Validação de tipo específico
    const validator = validators[type];
    if (validator && val) {
      const result = validator(val, min, max);
      if (!result.isValid) {
        return result;
      }
    }
    
    // Validação de minLength/maxLength para strings
    if (typeof val === 'string') {
      if (minLength && val.length < minLength) {
        return {
          isValid: false,
          message: `Mínimo de ${minLength} caracteres`
        };
      }
      if (maxLength && val.length > maxLength) {
        return {
          isValid: false,
          message: `Máximo de ${maxLength} caracteres`
        };
      }
    }
    
    // Validação de pattern
    if (pattern && val) {
      const regex = new RegExp(pattern);
      if (!regex.test(val)) {
        return {
          isValid: false,
          message: 'Formato inválido'
        };
      }
    }
    
    return { isValid: true };
  };

  const currentValue = value !== undefined ? value : internalValue;
  const validation = validate(currentValue);
  const showError = (touched || externalError) && !validation.isValid;

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    if (onChange) {
      onChange(e, validation);
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    setFocused(false);
    
    if (onBlur) {
      onBlur(e, validation);
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    
    if (onFocus) {
      onFocus(e);
    }
  };

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const wrapperClasses = [
    styles.inputWrapper,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    readOnly && styles.readOnly,
    showError && styles.error,
    success && styles.success,
    focused && styles.focused,
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon,
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    showError && styles.inputError,
    success && styles.inputSuccess,
    inputClassName
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className={wrapperClasses}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`${styles.label} ${hideLabel ? styles.visuallyHidden : ''}`}
        >
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className={styles.inputContainer}>
        {/* Ícone Esquerdo */}
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={onKeyDown}
          
          className={inputClasses}
          
          aria-label={ariaLabel || label}
          aria-invalid={showError}
          aria-required={required}
          aria-describedby={[
            descriptionId,
            showError ? errorId : null,
            ariaDescribedby
          ].filter(Boolean).join(' ')}
          
          {...props}
        />
        
        {/* Ícone Direito */}
        {rightIcon && (
          <span className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      
      {/* Mensagem de Erro */}
      {showError && (
        <div 
          id={errorId}
          className={styles.errorMessage}
          role="alert"
        >
          {validation.message}
        </div>
      )}
      
      {/* Descrição/Hint */}
      {props.description && !showError && (
        <div 
          id={descriptionId}
          className={styles.description}
        >
          {props.description}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: Object.values(InputType),
  size: Object.values(InputSize),
  required: 'boolean',
  disabled: 'boolean',
  readOnly: 'boolean',
  fullWidth: 'boolean'
};
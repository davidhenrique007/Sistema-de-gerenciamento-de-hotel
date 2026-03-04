import React, { forwardRef, useState, useId, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

/**
 * Input Component - Campo de entrada corporativo com acessibilidade
 * 
 * @component
 * @example
 * <Input
 *   label="Nome completo"
 *   name="fullName"
 *   value={value}
 *   onChange={handleChange}
 *   error="Campo obrigatório"
 * />
 */
const Input = forwardRef(({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder = '',
  className = '',
  id: providedId,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  ...props
}, ref) => {
  // ==========================================================================
  // ESTADOS
  // ==========================================================================

  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // ==========================================================================
  // ID ÚNICO PARA ACESSIBILIDADE
  // ==========================================================================

  const generatedId = useId();
  const inputId = providedId || `input-${generatedId}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    setIsTouched(true);
    onBlur?.(event);
  };

  const handleChange = (event) => {
    onChange?.(event);
  };

  // ==========================================================================
  // CLASSES CSS
  // ==========================================================================

  const containerClasses = [
    styles.container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    isFocused && styles.focused,
    error && isTouched && styles.error,
    disabled && styles.disabled,
  ].filter(Boolean).join(' ');

  // ==========================================================================
  // ARIA DESCRIBEDBY
  // ==========================================================================

  const describedBy = [];
  if (helperText && !error) describedBy.push(helperId);
  if (error && isTouched) describedBy.push(errorId);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={containerClasses}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={styles.label}
        >
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={inputClasses}
          aria-invalid={!!(error && isTouched)}
          aria-describedby={describedBy.length > 0 ? describedBy.join(' ') : undefined}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          {...props}
        />

        {error && isTouched && (
          <span className={styles.errorIcon} aria-hidden="true">
            ⚠️
          </span>
        )}
      </div>

      {helperText && !error && (
        <span id={helperId} className={styles.helperText}>
          {helperText}
        </span>
      )}

      {error && isTouched && (
        <span 
          id={errorId} 
          className={styles.errorMessage}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /** Label do campo */
  label: PropTypes.string,
  /** Nome do campo (para formulários) */
  name: PropTypes.string,
  /** Tipo do input */
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'time', 'search']),
  /** Valor atual */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Função chamada ao alterar valor */
  onChange: PropTypes.func,
  /** Função chamada ao perder foco */
  onBlur: PropTypes.func,
  /** Função chamada ao ganhar foco */
  onFocus: PropTypes.func,
  /** Mensagem de erro */
  error: PropTypes.string,
  /** Texto de ajuda (quando não há erro) */
  helperText: PropTypes.string,
  /** Campo obrigatório */
  required: PropTypes.bool,
  /** Estado desabilitado */
  disabled: PropTypes.bool,
  /** Ocupa 100% da largura */
  fullWidth: PropTypes.bool,
  /** Placeholder */
  placeholder: PropTypes.string,
  /** Classes CSS adicionais */
  className: PropTypes.string,
  /** ID customizado */
  id: PropTypes.string,
  /** Máximo de caracteres */
  maxLength: PropTypes.number,
  /** Mínimo de caracteres */
  minLength: PropTypes.number,
  /** Padrão regex para validação */
  pattern: PropTypes.string,
  /** Autocomplete */
  autoComplete: PropTypes.string,
};

Input.defaultProps = {
  label: '',
  name: '',
  type: 'text',
  value: '',
  onChange: undefined,
  onBlur: undefined,
  onFocus: undefined,
  error: '',
  helperText: '',
  required: false,
  disabled: false,
  fullWidth: true,
  placeholder: '',
  className: '',
  id: undefined,
  maxLength: undefined,
  minLength: undefined,
  pattern: undefined,
  autoComplete: undefined,
};

export default memo(Input);
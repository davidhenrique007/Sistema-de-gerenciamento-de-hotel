import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  translateKey,
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const { t } = useI18n();
  
  const text = translateKey ? t(translateKey) : children;
  
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {text}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  translateKey: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

Button.defaultProps = {
  children: null,
  translateKey: undefined,
  variant: 'primary',
  size: 'md',
  onClick: undefined,
  disabled: false,
  type: 'button',
  className: '',
};

export default memo(Button);

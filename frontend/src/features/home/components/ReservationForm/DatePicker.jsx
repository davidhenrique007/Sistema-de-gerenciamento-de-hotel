import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import PropTypes from 'prop-types';
import styles from './DatePicker.module.css';

const CustomDatePicker = ({ label, selectedDate, onChange, minDate }) => {
  const { t } = useI18n();
  
  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const newDate = new Date(year, month, day);
      
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        type="date"
        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const newDate = e.target.value ? new Date(e.target.value) : null;
          if (newDate && minDate && newDate < minDate) {
            onChange(minDate);
          } else if (newDate) {
            onChange(newDate);
          }
        }}
        min={minDate ? minDate.toISOString().split('T')[0] : ''}
        className={styles.input}
      />
    </div>
  );
};

CustomDatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date)
};

CustomDatePicker.defaultProps = {
  selectedDate: null,
  minDate: null
};

export default CustomDatePicker;

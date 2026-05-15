// useReservationValidation.js - Validações desacopladas com i18n
import { useI18n } from '../../../contexts/I18nContext';

export const useReservationValidation = () => {
  const { t } = useI18n();

  const errorMessages = {
    ERROR_CHECKIN_PAST: () => t('errors.checkin_past'),
    ERROR_CHECKOUT_BEFORE_CHECKIN: () => t('errors.checkout_before_checkin'),
    ERROR_INVALID_DATE: () => t('errors.invalid_date'),
    ERROR_REQUIRED_FIELD: (field) => t('errors.required_field', { field }),
    ERROR_ROOM_UNAVAILABLE: () => t('errors.room_unavailable')
  };

  const getErrorMessage = (error) => {
    if (!error) return null;
    
    const errorCode = error.message || error;
    const handler = errorMessages[errorCode];
    
    if (handler) {
      return typeof handler === 'function' ? handler(error.field) : handler();
    }
    
    return t('errors.generic');
  };

  const validateReservationData = (data) => {
    const errors = [];

    if (!data.checkIn) {
      errors.push({ message: 'ERROR_REQUIRED_FIELD', field: 'checkIn' });
    }

    if (!data.checkOut) {
      errors.push({ message: 'ERROR_REQUIRED_FIELD', field: 'checkOut' });
    }

    if (data.checkIn && data.checkOut) {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        errors.push({ message: 'ERROR_CHECKIN_PAST' });
      }

      if (checkOut <= checkIn) {
        errors.push({ message: 'ERROR_CHECKOUT_BEFORE_CHECKIN' });
      }
    }

    if (!data.roomId) {
      errors.push({ message: 'ERROR_REQUIRED_FIELD', field: 'roomId' });
    }

    return errors;
  };

  return {
    getErrorMessage,
    validateReservationData,
    errorMessages
  };
};

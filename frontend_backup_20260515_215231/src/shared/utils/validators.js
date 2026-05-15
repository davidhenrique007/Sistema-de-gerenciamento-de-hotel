// Validações desacopladas de texto - retornam chaves de erro

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { errorKey: 'errors.required', field: fieldName };
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (!value || value.length < minLength) {
    return { errorKey: 'errors.min_length', field: fieldName, min: minLength };
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return { errorKey: 'errors.max_length', field: fieldName, max: maxLength };
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { errorKey: 'errors.required', field: 'email' };
  if (!emailRegex.test(email)) {
    return { errorKey: 'errors.invalid_email', field: 'email' };
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const phoneRegex = /^[0-9+\-\s()]{9,15}$/;
  if (!phoneRegex.test(phone)) {
    return { errorKey: 'errors.invalid_phone', field: 'phone' };
  }
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { errorKey: 'errors.password_mismatch', field: 'confirmPassword' };
  }
  return null;
};

export const validateDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (outDate <= inDate) {
    return { errorKey: 'errors.invalid_date_range', field: 'checkOut' };
  }
  return null;
};

export const validateRequiredSelect = (value, fieldName) => {
  if (!value || value === '') {
    return { errorKey: 'errors.required', field: fieldName };
  }
  return null;
};

export const validateNumberRange = (value, min, max, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    return { errorKey: 'errors.invalid_number', field: fieldName };
  }
  if (num < min || num > max) {
    return { errorKey: 'errors.number_range', field: fieldName, min, max };
  }
  return null;
};

/**
 * Utilitários de sanitização para prevenção de XSS e tratamento seguro de dados
 * @module sanitizer
 */

/**
 * Classe de erro personalizada para operações de sanitização
 */
class SanitizationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'SanitizationError';
    this.code = 'SANITIZATION_ERROR';
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Sanitiza uma string removendo caracteres perigosos e prevenindo XSS
 * @param {string} input - String a ser sanitizada
 * @param {Object} options - Opções de sanitização
 * @param {boolean} options.trim - Se deve remover espaços extras (default: true)
 * @param {boolean} options.allowHtml - Se permite tags HTML (default: false)
 * @param {number} options.maxLength - Tamanho máximo permitido (default: Infinity)
 * @returns {string} String sanitizada
 * @throws {SanitizationError} Quando o input é inválido
 */
export const sanitizeString = (input, options = {}) => {
  const { trim = true, allowHtml = false, maxLength = Infinity } = options;

  // Validação de tipo
  if (input === null || input === undefined) {
    throw new SanitizationError('Input não pode ser null ou undefined', {
      inputType: typeof input
    });
  }

  if (typeof input !== 'string') {
    throw new SanitizationError('Input deve ser uma string', {
      receivedType: typeof input,
      receivedValue: input
    });
  }

  let sanitized = input;

  // Remover caracteres de controle e especiais
  sanitized = sanitized.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"': return '&quot;';
      case "'": return '&#39;';
      case '\\': return '\\\\';
      case '%': return '\\%';
      default: return char;
    }
  });

  // Prevenção XSS básica
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Remover espaços extras
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Limitar tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Sanitiza um objeto recursivamente, aplicando sanitização em todas as strings
 * @param {Object|Array} input - Objeto a ser sanitizado
 * @param {Object} options - Opções de sanitização (mesmas do sanitizeString)
 * @param {Array} excludeKeys - Chaves a serem ignoradas na sanitização
 * @returns {Object|Array} Objeto sanitizado
 * @throws {SanitizationError} Quando o input é inválido
 */
export const sanitizeObject = (input, options = {}, excludeKeys = []) => {
  // Validação de tipo
  if (input === null || input === undefined) {
    throw new SanitizationError('Input não pode ser null ou undefined', {
      inputType: typeof input
    });
  }

  if (typeof input !== 'object') {
    throw new SanitizationError('Input deve ser um objeto ou array', {
      receivedType: typeof input,
      receivedValue: input
    });
  }

  // Tratar arrays
  if (Array.isArray(input)) {
    return input.map(item => 
      typeof item === 'string' 
        ? sanitizeString(item, options)
        : typeof item === 'object' && item !== null
          ? sanitizeObject(item, options, excludeKeys)
          : item
    );
  }

  // Tratar objetos
  const sanitized = {};
  
  for (const [key, value] of Object.entries(input)) {
    // Verificar se a chave deve ser excluída
    if (excludeKeys.includes(key)) {
      sanitized[key] = value;
      continue;
    }

    // Sanitizar baseado no tipo
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options, excludeKeys);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitiza um email (formatação básica)
 * @param {string} email - Email a ser sanitizado
 * @returns {string} Email sanitizado
 * @throws {SanitizationError} Quando o email é inválido
 */
export const sanitizeEmail = (email) => {
  const sanitized = sanitizeString(email, { trim: true, allowHtml: false });
  
  // Remover espaços e converter para minúsculas
  return sanitized.toLowerCase().replace(/\s+/g, '');
};

/**
 * Sanitiza um número de telefone (remove caracteres não numéricos)
 * @param {string} phone - Telefone a ser sanitizado
 * @returns {string} Telefone sanitizado (apenas números)
 * @throws {SanitizationError} Quando o telefone é inválido
 */
export const sanitizePhone = (phone) => {
  const sanitized = sanitizeString(phone, { trim: true, allowHtml: false });
  
  // Remover tudo que não for número
  return sanitized.replace(/\D/g, '');
};

/**
 * Sanitiza um número (string para número)
 * @param {string|number} input - Valor a ser convertido
 * @param {Object} options - Opções de conversão
 * @param {number} options.min - Valor mínimo permitido
 * @param {number} options.max - Valor máximo permitido
 * @param {boolean} options.integer - Se deve ser inteiro
 * @returns {number} Número sanitizado
 * @throws {SanitizationError} Quando a conversão falha
 */
export const sanitizeNumber = (input, options = {}) => {
  const { min = -Infinity, max = Infinity, integer = false } = options;

  if (input === null || input === undefined) {
    throw new SanitizationError('Input não pode ser null ou undefined');
  }

  let number;
  
  if (typeof input === 'string') {
    // Remover caracteres não numéricos exceto ponto e vírgula
    const cleaned = input.replace(/[^\d.,-]/g, '').replace(',', '.');
    number = parseFloat(cleaned);
  } else if (typeof input === 'number') {
    number = input;
  } else {
    throw new SanitizationError('Input deve ser string ou número', {
      receivedType: typeof input
    });
  }

  // Verificar se é um número válido
  if (isNaN(number) || !isFinite(number)) {
    throw new SanitizationError('Input não resulta em um número válido', {
      originalValue: input
    });
  }

  // Aplicar regras de inteiro
  if (integer) {
    number = Math.floor(number);
  }

  // Aplicar limites
  if (number < min) {
    number = min;
  }
  if (number > max) {
    number = max;
  }

  return number;
};

/**
 * Sanitiza um booleano (converte strings como 'true'/'false' para boolean)
 * @param {*} input - Valor a ser convertido
 * @returns {boolean} Valor booleano
 * @throws {SanitizationError} Quando a conversão falha
 */
export const sanitizeBoolean = (input) => {
  if (typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    const lower = input.toLowerCase().trim();
    if (['true', '1', 'yes', 'on'].includes(lower)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(lower)) {
      return false;
    }
  }

  if (typeof input === 'number') {
    return input !== 0;
  }

  throw new SanitizationError('Não foi possível converter para booleano', {
    receivedType: typeof input,
    receivedValue: input
  });
};
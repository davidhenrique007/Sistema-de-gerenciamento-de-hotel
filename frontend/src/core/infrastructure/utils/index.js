/**
 * Utilitários técnicos globais
 * Log, debug e monitoramento de performance
 * @module core/utils
 */

/**
 * Níveis de log
 */
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Logger estruturado da aplicação
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.enabled = process.env.NODE_ENV !== 'production' || true;
  }

  /**
   * Formata mensagem de log
   */
  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context: this.context,
      message,
      ...data
    };
  }

  /**
   * Log de debug (apenas desenvolvimento)
   */
  debug(message, data = {}) {
    if (this.enabled && process.env.NODE_ENV !== 'production') {
      const logData = this.formatMessage(LogLevel.DEBUG, message, data);
      console.debug(JSON.stringify(logData, null, 2));
    }
  }

  /**
   * Log de informação
   */
  info(message, data = {}) {
    const logData = this.formatMessage(LogLevel.INFO, message, data);
    console.info(JSON.stringify(logData, null, 2));
  }

  /**
   * Log de aviso
   */
  warn(message, data = {}) {
    const logData = this.formatMessage(LogLevel.WARN, message, data);
    console.warn(JSON.stringify(logData, null, 2));
  }

  /**
   * Log de erro
   */
  error(message, error = null, data = {}) {
    const errorData = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...(error.context && { errorContext: error.context })
    } : {};

    const logData = this.formatMessage(LogLevel.ERROR, message, {
      ...data,
      ...errorData
    });

    console.error(JSON.stringify(logData, null, 2));
  }
}

// Instância global do logger
export const logger = new Logger();

/**
 * Criar logger com contexto específico
 * @param {string} context - Contexto do logger
 * @returns {Logger} Nova instância do logger
 */
export const createLogger = (context) => new Logger(context);

/**
 * Medidor de performance
 */
export class PerformanceMonitor {
  constructor(label) {
    this.label = label;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Inicia medição
   */
  start() {
    this.startTime = performance.now();
    return this;
  }

  /**
   * Finaliza medição
   * @returns {number} Duração em ms
   */
  end() {
    this.endTime = performance.now();
    const duration = this.getDuration();
    
    logger.debug(`Performance [${this.label}]`, {
      duration: `${duration.toFixed(2)}ms`,
      start: this.startTime,
      end: this.endTime
    });

    return duration;
  }

  /**
   * Retorna duração sem finalizar
   * @returns {number} Duração atual em ms
   */
  getDuration() {
    const end = this.endTime || performance.now();
    return end - (this.startTime || end);
  }

  /**
   * Executa função medindo performance
   * @param {Function} fn - Função a ser executada
   * @returns {*} Resultado da função
   */
  static measure(label, fn) {
    const monitor = new PerformanceMonitor(label).start();
    const result = fn();
    monitor.end();
    return result;
  }

  /**
   * Executa função assíncrona medindo performance
   * @param {Function} fn - Função assíncrona
   * @returns {Promise<*>} Resultado da função
   */
  static async measureAsync(label, fn) {
    const monitor = new PerformanceMonitor(label).start();
    const result = await fn();
    monitor.end();
    return result;
  }
}

/**
 * Debounce para funções
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle para funções
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite em ms
 * @returns {Function} Função com throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Formata bytes para unidade legível
 * @param {number} bytes - Valor em bytes
 * @param {number} decimals - Casas decimais
 * @returns {string} Valor formatado
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Gera ID único
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Retry com backoff exponencial
 * @param {Function} fn - Função a ser executada
 * @param {Object} options - Opções
 * @returns {Promise<*>} Resultado da função
 */
export const retry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    factor = 2
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay);
      
      logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`, {
        attempt,
        delay,
        error: error.message
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
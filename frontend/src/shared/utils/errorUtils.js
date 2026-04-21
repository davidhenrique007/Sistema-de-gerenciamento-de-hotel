/**
 * Utilitários padronizados para tratamento de erros
 * @module errorUtils
 */

/**
 * Classe base para erros da aplicação
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Mensagem de erro
   * @param {string} code - Código do erro (ex: 'VALIDATION_ERROR', 'NOT_FOUND')
   * @param {Object} context - Contexto adicional do erro
   */
  constructor(message, code = 'INTERNAL_ERROR', context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Erros operacionais são esperados

    // Capturar stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converte o erro para formato JSON
   * @returns {Object} Representação JSON do erro
   */
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        context: this.context,
        timestamp: this.timestamp
      }
    };
  }

  /**
   * Retorna string formatada do erro
   * @returns {string} Representação string do erro
   */
  toString() {
    return `[${this.code}] ${this.message}`;
  }
}

/**
 * Erro para validações de dados
 */
export class ValidationError extends AppError {
  constructor(message, context = {}) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

/**
 * Erro para recursos não encontrados
 */
export class NotFoundError extends AppError {
  constructor(resource, context = {}) {
    super(`${resource} não encontrado`, 'NOT_FOUND', context);
  }
}

/**
 * Erro para autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Não autorizado', context = {}) {
    super(message, 'UNAUTHORIZED', context);
  }
}

/**
 * Erro para autorização
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acesso negado', context = {}) {
    super(message, 'FORBIDDEN', context);
  }
}

/**
 * Erro para conflitos de dados
 */
export class ConflictError extends AppError {
  constructor(message, context = {}) {
    super(message, 'CONFLICT', context);
  }
}

/**
 * Erro para limites excedidos
 */
export class RateLimitError extends AppError {
  constructor(message = 'Limite de requisições excedido', context = {}) {
    super(message, 'RATE_LIMIT_EXCEEDED', context);
  }
}

/**
 * Função helper para capturar e padronizar erros
 * @param {Error} error - Erro capturado
 * @returns {AppError} Erro padronizado
 */
export const normalizeError = (error) => {
  // Se já for AppError, retornar
  if (error instanceof AppError) {
    return error;
  }

  // Se for erro de validação conhecido
  if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
    return new ValidationError(error.message, error.context || {});
  }

  // Erros comuns do JavaScript
  if (error instanceof TypeError) {
    return new AppError(
      `Erro de tipo: ${error.message}`,
      'TYPE_ERROR',
      { originalStack: error.stack }
    );
  }

  if (error instanceof ReferenceError) {
    return new AppError(
      `Erro de referência: ${error.message}`,
      'REFERENCE_ERROR',
      { originalStack: error.stack }
    );
  }

  if (error instanceof SyntaxError) {
    return new AppError(
      `Erro de sintaxe: ${error.message}`,
      'SYNTAX_ERROR',
      { originalStack: error.stack }
    );
  }

  // Erro genérico
  return new AppError(
    error.message || 'Erro interno do servidor',
    'INTERNAL_ERROR',
    { originalError: error.toString(), stack: error.stack }
  );
};

/**
 * Handler para capturar erros em funções assíncronas
 * @param {Function} fn - Função assíncrona
 * @returns {Function} Função com tratamento de erro
 */
export const catchAsync = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

/**
 * Verifica se um erro é operacional (esperado)
 * @param {Error} error - Erro a ser verificado
 * @returns {boolean} true se for erro operacional
 */
export const isOperationalError = (error) => {
  return error instanceof AppError && error.isOperational === true;
};

/**
 * Cria mensagem de erro amigável para o usuário
 * @param {AppError} error - Erro padronizado
 * @returns {string} Mensagem amigável
 */
export const getUserFriendlyMessage = (error) => {
  const errorMap = {
    'VALIDATION_ERROR': 'Verifique os dados informados',
    'NOT_FOUND': 'Recurso não encontrado',
    'UNAUTHORIZED': 'Faça login para continuar',
    'FORBIDDEN': 'Você não tem permissão para esta ação',
    'CONFLICT': 'Conflito de dados. Tente novamente',
    'RATE_LIMIT_EXCEEDED': 'Muitas tentativas. Aguarde um momento',
    'TYPE_ERROR': 'Erro no processamento dos dados',
    'REFERENCE_ERROR': 'Erro interno do sistema',
    'SYNTAX_ERROR': 'Erro de formato nos dados',
    'INTERNAL_ERROR': 'Erro interno. Tente novamente mais tarde'
  };

  return errorMap[error.code] || error.message || 'Ocorreu um erro inesperado';
};
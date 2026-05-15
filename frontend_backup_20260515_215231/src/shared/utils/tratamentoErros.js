/**
 * Mapeamento de erros para mensagens amigáveis
 */
const errorMap = {
  // Erros de Pagamento M-Pesa
  'MPESA_INSUFFICIENT_BALANCE': {
    title: 'Saldo insuficiente',
    message: 'Seu saldo é insuficiente para realizar esta transação. Por favor, recarregue sua conta M-Pesa.',
    action: 'Tentar novamente',
    icon: '💰',
    type: 'error',
    titulo: '⚠️ Saldo insuficiente',
    mensagem: 'Seu saldo é insuficiente para realizar esta transação. Por favor, recarregue sua conta M-Pesa.',
    acao: 'Tentar novamente'
  },
  'MPESA_TIMEOUT': {
    title: 'Tempo limite excedido',
    message: 'A transação excedeu o tempo limite. Por favor, tente novamente.',
    action: 'Tentar novamente',
    icon: '⏰',
    type: 'error',
    titulo: '⏰ Tempo limite excedido',
    mensagem: 'A transação excedeu o tempo limite. Por favor, tente novamente.',
    acao: 'Tentar novamente'
  },
  'MPESA_FAILED': {
    title: 'Transação recusada',
    message: 'O pagamento foi recusado. Verifique seu saldo ou tente outro método de pagamento.',
    action: 'Tentar novamente',
    icon: '❌',
    type: 'error',
    titulo: '❌ Transação recusada',
    mensagem: 'O pagamento foi recusado. Verifique seu saldo ou tente outro método de pagamento.',
    acao: 'Tentar novamente'
  },
  
  // Erros de Pagamento Stripe
  'STRIPE_CARD_DECLINED': {
    title: 'Cartão recusado',
    message: 'Seu cartão foi recusado. Verifique os dados ou tente outro cartão.',
    action: 'Tentar outro cartão',
    icon: '💳',
    type: 'error',
    titulo: '💳 Cartão recusado',
    mensagem: 'Seu cartão foi recusado. Verifique os dados ou tente outro cartão.',
    acao: 'Tentar outro cartão'
  },
  'STRIPE_CARD_EXPIRED': {
    title: 'Cartão expirado',
    message: 'Seu cartão está expirado. Por favor, utilize um cartão válido.',
    action: 'Alterar cartão',
    icon: '📅',
    type: 'error',
    titulo: '📅 Cartão expirado',
    mensagem: 'Seu cartão está expirado. Por favor, utilize um cartão válido.',
    acao: 'Alterar cartão'
  },
  'STRIPE_INSUFFICIENT_FUNDS': {
    title: 'Limite insuficiente',
    message: 'Seu cartão não possui limite suficiente para esta transação.',
    action: 'Tentar outro cartão',
    icon: '💳',
    type: 'error',
    titulo: '💳 Limite insuficiente',
    mensagem: 'Seu cartão não possui limite suficiente para esta transação.',
    acao: 'Tentar outro cartão'
  },
  'STRIPE_AUTHENTICATION_REQUIRED': {
    title: 'Autenticação necessária',
    message: 'Esta transação requer autenticação. Por favor, complete a autenticação no seu banco.',
    action: 'Autenticar',
    icon: '🔐',
    type: 'warning',
    titulo: '🔐 Autenticação necessária',
    mensagem: 'Esta transação requer autenticação. Por favor, complete a autenticação no seu banco.',
    acao: 'Autenticar'
  },
  
  // Erros de Reserva
  'ROOM_UNAVAILABLE': {
    title: 'Quarto indisponível',
    message: 'Este quarto acabou de ser reservado. Por favor, selecione outro quarto.',
    action: 'Verificar outros quartos',
    icon: '🏨',
    type: 'error',
    titulo: '🏨 Quarto indisponível',
    mensagem: 'Este quarto acabou de ser reservado. Por favor, selecione outro quarto.',
    acao: 'Verificar outros quartos'
  },
  'QUARTO_INDISPONIVEL': {
    title: 'Quarto ocupado',
    message: 'Este quarto não está mais disponível para as datas selecionadas.',
    action: 'Verificar disponibilidade',
    icon: '🏨',
    type: 'error',
    titulo: '📅 Quarto Indisponível',
    mensagem: 'Este quarto não está mais disponível para as datas selecionadas. Por favor, escolha outro quarto.',
    acao: 'Verificar outros quartos'
  },
  'QUARTO_RESERVADO': {
    title: 'Quarto reservado',
    message: 'Este quarto acabou de ser reservado por outro cliente.',
    action: 'Verificar disponibilidade',
    icon: '🔒',
    type: 'error',
    titulo: '🔒 Quarto Reservado',
    mensagem: 'Este quarto acabou de ser reservado por outro cliente. Por favor, selecione outro quarto.',
    acao: 'Verificar disponibilidade'
  },
  'CONFLITO_CONCORRENCIA': {
    title: 'Alta demanda',
    message: 'Outro cliente está tentando reservar este quarto. Aguarde um momento e tente novamente.',
    action: 'Tentar novamente',
    icon: '⏳',
    type: 'warning',
    titulo: '⚠️ Conflito de Concorrência',
    mensagem: 'Outro cliente está tentando reservar este quarto. Aguarde alguns segundos e tente novamente.',
    acao: 'Tentar novamente'
  },
  'LOCK_NAO_ADQUIRIDO': {
    title: 'Alta demanda',
    message: 'O sistema está com alta demanda. Aguarde um momento e tente novamente.',
    action: 'Tentar novamente',
    icon: '⏳',
    type: 'warning',
    titulo: '⏳ Alta Demanda',
    mensagem: 'O sistema está com alta demanda. Aguarde um momento e tente novamente.',
    acao: 'Tentar novamente'
  },
  
  // Erros de Formulário
  'CAMPOS_OBRIGATORIOS': {
    title: 'Campos obrigatórios',
    message: 'Por favor, preencha todos os campos obrigatórios.',
    action: 'Corrigir',
    icon: '📝',
    type: 'error',
    titulo: '📝 Campos obrigatórios',
    mensagem: 'Por favor, preencha todos os campos obrigatórios.',
    acao: 'Corrigir'
  },
  'TELEFONE_INVALIDO': {
    title: 'Telefone inválido',
    message: 'Por favor, insira um número de telefone válido (ex: 84 123 4567).',
    action: 'Corrigir',
    icon: '📞',
    type: 'error',
    titulo: '📞 Telefone inválido',
    mensagem: 'Por favor, insira um número de telefone válido (ex: 84 123 4567).',
    acao: 'Corrigir'
  },
  
  // Erros Genéricos
  'NETWORK_ERROR': {
    title: 'Erro de conexão',
    message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
    action: 'Tentar novamente',
    icon: '🌐',
    type: 'error',
    titulo: '🌐 Erro de conexão',
    mensagem: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
    acao: 'Tentar novamente'
  },
  'ERRO_INTERNO': {
    title: 'Erro interno',
    message: 'Ocorreu um erro interno. Nossa equipe já foi notificada.',
    action: 'Contatar suporte',
    icon: '⚠️',
    type: 'error',
    titulo: '❌ Erro no Sistema',
    mensagem: 'Ocorreu um erro interno. Nossa equipe já foi notificada.',
    acao: 'Contatar suporte'
  }
};

/**
 * Erros padrão (fallback)
 */
const defaultError = {
  title: 'Ops! Algo deu errado',
  message: 'Não foi possível processar sua solicitação. Tente novamente.',
  action: 'Tentar novamente',
  icon: '⚠️',
  type: 'error',
  titulo: '⚠️ Erro',
  mensagem: 'Não foi possível processar sua solicitação. Tente novamente.',
  acao: 'Tentar novamente'
};

/**
 * Mapear erro do backend para mensagem amigável
 */
export const tratarErro = (error) => {
  console.log('🔍 Tratando erro:', error);
  
  if (error?.code && errorMap[error.code]) {
    return errorMap[error.code];
  }
  
  if (error?.message?.includes('Network Error') || error?.message?.includes('Failed to fetch')) {
    return errorMap.NETWORK_ERROR;
  }
  
  if (error?.message?.includes('timeout')) {
    return errorMap.MPESA_TIMEOUT;
  }
  
  if (error?.type === 'StripeCardError' || error?.message?.includes('card')) {
    if (error.message?.includes('expired')) return errorMap.STRIPE_CARD_EXPIRED;
    if (error.message?.includes('insufficient')) return errorMap.STRIPE_INSUFFICIENT_FUNDS;
    return errorMap.STRIPE_CARD_DECLINED;
  }
  
  if (error?.message?.includes('saldo') || error?.message?.includes('balance')) {
    return errorMap.MPESA_INSUFFICIENT_BALANCE;
  }
  
  if (error?.message?.includes('quarto') || error?.message?.includes('room')) {
    return errorMap.ROOM_UNAVAILABLE;
  }
  
  if (error?.response?.data?.code && errorMap[error.response.data.code]) {
    return errorMap[error.response.data.code];
  }
  
  if (error?.response?.data?.message) {
    return {
      ...defaultError,
      message: error.response.data.message,
      title: 'Erro no pagamento',
      titulo: '❌ Erro no pagamento',
      mensagem: error.response.data.message
    };
  }
  
  return defaultError;
};

/**
 * Função para tratar erro de reserva (mantendo compatibilidade com código antigo)
 */
export const tratarErroReserva = (error) => {
  const erroTratado = tratarErro(error);
  return {
    titulo: erroTratado.titulo || erroTratado.title,
    mensagem: erroTratado.mensagem || erroTratado.message,
    acao: erroTratado.acao || erroTratado.action,
    originalError: error,
    mostrar: () => {
      console.error('[Erro Reserva]', error);
      alert(`${erroTratado.titulo || erroTratado.title}\n\n${erroTratado.mensagem || erroTratado.message}`);
    }
  };
};

/**
 * Função para tratar sucesso de reserva
 */
export const tratarSucessoReserva = (data) => {
  const mensagens = {
    processing: '✅ Reserva em processamento! Aguarde a confirmação.',
    confirmada: '🎉 Reserva confirmada com sucesso!',
    pendente: '⏳ Reserva pendente de pagamento.'
  };
  
  return {
    mensagem: mensagens[data.status] || 'Reserva processada com sucesso',
    data
  };
};

/**
 * Obter título amigável do erro
 */
export const getErrorTitle = (error) => tratarErro(error).title;

/**
 * Obter mensagem amigável do erro
 */
export const getErrorMessage = (error) => tratarErro(error).message;

/**
 * Obter ação recomendada do erro
 */
export const getErrorAction = (error) => tratarErro(error).action;

/**
 * Obter ícone do erro
 */
export const getErrorIcon = (error) => tratarErro(error).icon;

/**
 * Obter tipo do erro (error, warning, info)
 */
export const getErrorType = (error) => tratarErro(error).type;

/**
 * Verificar se erro é de validação de formulário
 */
export const isValidationError = (error) => {
  const codes = ['CAMPOS_OBRIGATORIOS', 'TELEFONE_INVALIDO'];
  return codes.includes(error?.code) || codes.includes(error?.response?.data?.code);
};

/**
 * Verificar se erro é de pagamento (pode tentar novamente)
 */
export const isPaymentError = (error) => {
  const codes = [
    'MPESA_INSUFFICIENT_BALANCE', 'MPESA_TIMEOUT', 'MPESA_FAILED',
    'STRIPE_CARD_DECLINED', 'STRIPE_CARD_EXPIRED', 'STRIPE_INSUFFICIENT_FUNDS'
  ];
  return codes.includes(error?.code) || codes.includes(error?.response?.data?.code);
};

/**
 * Verificar se erro é de reserva (quarto indisponível)
 */
export const isReservationError = (error) => {
  const codes = ['ROOM_UNAVAILABLE', 'QUARTO_INDISPONIVEL', 'CONFLITO_CONCORRENCIA', 'QUARTO_RESERVADO', 'LOCK_NAO_ADQUIRIDO'];
  return codes.includes(error?.code) || codes.includes(error?.response?.data?.code);
};

export default {
  tratarErro,
  tratarErroReserva,
  tratarSucessoReserva,
  getErrorTitle,
  getErrorMessage,
  getErrorAction,
  getErrorIcon,
  getErrorType,
  isValidationError,
  isPaymentError,
  isReservationError
};

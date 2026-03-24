// frontend/src/utils/tratamentoErros.js

export const tratarErroReserva = (error) => {
  const erroMap = {
    'CONFLITO_CONCORRENCIA': {
      titulo: '⚠️ Conflito de Concorrência',
      mensagem: 'Outro cliente está tentando reservar este quarto. Aguarde alguns segundos e tente novamente.',
      acao: 'Tentar novamente'
    },
    'QUARTO_INDISPONIVEL': {
      titulo: '📅 Quarto Indisponível',
      mensagem: 'Este quarto não está mais disponível para as datas selecionadas. Por favor, escolha outro quarto.',
      acao: 'Verificar outros quartos'
    },
    'QUARTO_RESERVADO': {
      titulo: '🔒 Quarto Reservado',
      mensagem: 'Este quarto acabou de ser reservado por outro cliente. Por favor, selecione outro quarto.',
      acao: 'Verificar disponibilidade'
    },
    'LOCK_NAO_ADQUIRIDO': {
      titulo: '⏳ Alta Demanda',
      mensagem: 'O sistema está com alta demanda. Aguarde um momento e tente novamente.',
      acao: 'Tentar novamente'
    },
    'ERRO_INTERNO': {
      titulo: '❌ Erro no Sistema',
      mensagem: 'Ocorreu um erro interno. Nossa equipe já foi notificada.',
      acao: 'Contatar suporte'
    }
  };

  const errorCode = error.response?.data?.code || 'ERRO_INTERNO';
  const info = erroMap[errorCode] || erroMap['ERRO_INTERNO'];
  
  return {
    ...info,
    originalError: error,
    mostrar: () => {
      console.error('[Erro Reserva]', error);
      alert(`${info.titulo}\n\n${info.mensagem}`);
    }
  };
};

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
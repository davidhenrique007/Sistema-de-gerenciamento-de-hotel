import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../../shared/components/contexts/ToastContext';
import { tratarErro } from '../../../shared/utils/tratamentoErros';
import styles from './PagamentoFalha.module.css';

const PagamentoFalha = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useToast();
  const { error, reserva } = location.state || {};

  const handleTentarNovamente = () => {
    if (reserva) {
      navigate('/checkout', { state: { reserva } });
    } else {
      navigate('/');
    }
  };

  const handleEscolherOutroMetodo = () => {
    navigate('/checkout', { state: { reserva, mudarMetodo: true } });
  };

  const handleVoltarHome = () => {
    navigate('/');
  };

  React.useEffect(() => {
    if (error?.message) {
      showError(error.message, error.title || 'Falha no pagamento');
    }
  }, [error, showError]);

  const errorIcon = error?.icon || '❌';
  const errorTitle = error?.title || 'Falha no pagamento';
  const errorMessage = error?.message || 'Ocorreu um erro ao processar seu pagamento.';

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>{errorIcon}</div>
        <h1 className={styles.title}>{errorTitle}</h1>
        <p className={styles.message}>{errorMessage}</p>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleTentarNovamente}>
            🔄 Tentar novamente
          </button>
          <button className={styles.btnSecondary} onClick={handleEscolherOutroMetodo}>
            💳 Escolher outro método
          </button>
          <button className={styles.btnLink} onClick={handleVoltarHome}>
            🏠 Voltar para Home
          </button>
        </div>

        <div className={styles.help}>
          <p>Precisa de ajuda?</p>
          <a href="tel:+258841234567">📞 Ligue para +258 84 123 4567</a>
          <a href="mailto:suporte@hotelparadise.com">✉️ suporte@hotelparadise.com</a>
        </div>
      </div>
    </div>
  );
};

export default PagamentoFalha;

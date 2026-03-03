import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

/**
 * CheckoutPage - Página de finalização de reserva
 * 
 * Esta página será implementada no Sprint 2
 * Por enquanto, apenas redireciona para Home se não houver dados
 */
const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state;

  // Redirecionar para home se não houver dados de reserva
  React.useEffect(() => {
    if (!reservationData) {
      navigate('/', { replace: true });
    }
  }, [reservationData, navigate]);

  if (!reservationData) {
    return null;
  }

  return (
    <div className="checkout-page">
      <header className="checkout-page__header">
        <div className="container">
          <h1>Hotel Paradise</h1>
          <button 
            className="checkout-page__back-button"
            onClick={() => navigate('/')}
          >
            ← Voltar
          </button>
        </div>
      </header>

      <main className="checkout-page__main">
        <div className="container">
          <h2>Finalizar Reserva</h2>
          
          <div className="checkout-page__content">
            <div className="checkout-page__reservation-summary">
              <h3>Resumo da Reserva</h3>
              <p>Em breve: detalhes da reserva</p>
            </div>

            <div className="checkout-page__payment-section">
              <h3>Pagamento</h3>
              <p>Em breve: formulário de pagamento</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="checkout-page__footer">
        <div className="container">
          <p>&copy; 2025 Hotel Paradise. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
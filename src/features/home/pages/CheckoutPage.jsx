import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state;

  React.useEffect(() => {
    if (!reservationData) {
      navigate('/', { replace: true });
    }
  }, [reservationData, navigate]);

  if (!reservationData) return null;

  return (
    <div className="checkout-page">
      <header className="checkout-page__header">
        <div className="container">
          <h1>Hotel Paradise</h1>
          <button onClick={() => navigate('/')}>← Voltar</button>
        </div>
      </header>

      <main className="checkout-page__main">
        <div className="container">
          <h2>Finalizar Reserva</h2>
          <p>Resumo da reserva aparecerá aqui</p>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
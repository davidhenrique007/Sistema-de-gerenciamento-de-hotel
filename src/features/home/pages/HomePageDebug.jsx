// ============================================
// PAGE: HomePageDebug (ISOLAMENTO DE HOOKS)
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes base
import { Header } from '../../../shared/components/layout/Header/Header.jsx';
import { Footer } from '../../../shared/components/layout/Footer/Footer.jsx';
import { useNotification } from '../../../shared/components/ui/Notification/Notification.jsx';

// Hooks para testar individualmente
import { useHomeData } from '../hooks/useHomeData.js';
import { useHomeReservation } from '../hooks/useHomeReservation.js';
import { useReservationForm } from '../hooks/useReservationForm.js';

// Estilos
import './home.css';

export const HomePageDebug = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [activeHook, setActiveHook] = useState('data'); // 'data', 'reservation', 'form'

  // Hook 1: useHomeData (sempre ativo, é a base)
  const {
    rooms,
    services,
    loading,
    error,
    initialized,
    refresh
  } = useHomeData({
    onError: (type, err) => notification.error(`Erro: ${err.message}`)
  });

  // Hook 2: useHomeReservation (ativado por botão)
  const reservation = activeHook === 'reservation' || activeHook === 'form' ? useHomeReservation({
    calculatePriceUseCase: null, // Mock
    onPriceCalculated: (bd) => console.log('Preço calculado:', bd)
  }) : null;

  // Hook 3: useReservationForm (ativado por botão)
  const form = activeHook === 'form' ? useReservationForm({
    reservationState: reservation?.reservationState || {}
  }) : null;

  if (loading && !initialized) {
    return <div className="home-loading">Carregando...</div>;
  }

  if (error && !initialized) {
    return (
      <div className="home-error">
        <h2>Erro</h2>
        <p>{error.message}</p>
        <button onClick={() => refresh()}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header onNavigate={navigate} />
      <main style={{ padding: '40px' }}>
        <h1>🏨 Modo Debug - Hotel Paradise</h1>
        
        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveHook('data')}
            style={{ background: activeHook === 'data' ? '#4CAF50' : '#ddd' }}
          >
            Apenas useHomeData
          </button>
          <button 
            onClick={() => setActiveHook('reservation')}
            style={{ background: activeHook === 'reservation' ? '#4CAF50' : '#ddd' }}
          >
            + useHomeReservation
          </button>
          <button 
            onClick={() => setActiveHook('form')}
            style={{ background: activeHook === 'form' ? '#4CAF50' : '#ddd' }}
          >
            + useReservationForm
          </button>
        </div>

        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <h3>📊 Status:</h3>
          <p>Quartos: {rooms.length}</p>
          <p>Serviços: {services?.categories ? Object.keys(services.categories).length : 0}</p>
          <p>Hook Ativo: <strong>{activeHook}</strong></p>
          {reservation && <p>Reserva: {reservation.room ? 'Quarto selecionado' : 'Nenhum quarto'}</p>}
        </div>

        {/* Simulador de seleção de quarto para testar reserva */}
        {activeHook !== 'data' && rooms.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>🛏️ Simular Seleção de Quarto</h3>
            <button 
              onClick={() => reservation?.selectRoom(rooms[0])}
              style={{ padding: '10px', marginRight: '10px' }}
            >
              Selecionar Primeiro Quarto
            </button>
            {reservation?.room && (
              <button onClick={() => reservation.clearReservation()}>
                Limpar Seleção
              </button>
            )}
          </div>
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
};
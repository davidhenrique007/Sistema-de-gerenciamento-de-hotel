// ============================================
// PAGE: HomePageDebug (VERSÃƒO CORRIGIDA - HOOKS INCONDICIONAIS)
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes base
import { Header } from '../../../shared/components/layout/Header/Header.jsx';
import { Footer } from '../../../shared/components/layout/Footer/Footer.jsx';
import { useNotification } from '../../../shared/components/ui/Notification/Notification.jsx';

// Hooks - TODOS chamados incondicionalmente!
import { useHomeData } from '../hooks/useHomeData.js';
import { useHomeReservation } from '../hooks/useHomeReservation.js';
import { useReservationForm } from '../hooks/useReservationForm.js';

// Estilos
import './home.css';

export const HomePageDebug = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [activeHook, setActiveHook] = useState('data'); // 'data', 'reservation', 'form'

  // ========================================
  // TODOS OS HOOKS SÃƒO CHAMADOS INCONDICIONALMENTE
  // ========================================
  
  // Hook 1: useHomeData (sempre necessÃ¡rio)
  const homeData = useHomeData({
    onError: (type, err) => notification.error(`Erro: ${err.message}`)
  });

  // Hook 2: useHomeReservation (sempre chamado, mesmo se nÃ£o usado)
  const reservation = useHomeReservation({
    calculatePriceUseCase: null,
    onPriceCalculated: (bd) => console.log('PreÃ§o calculado:', bd)
  });

  // Hook 3: useReservationForm (sempre chamado, mesmo se nÃ£o usado)
  const form = useReservationForm({
    reservationState: reservation.reservationState
  });

  // ========================================
  // DESTRUTURAÃ‡ÃƒO CONDICIONAL (sÃ³ afeta o retorno, nÃ£o os hooks)
  // ========================================
  
  // Dados base (sempre disponÃ­veis)
  const {
    rooms,
    services,
    loading,
    error,
    initialized,
    refresh
  } = homeData;

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
        <h1>ðŸ¨ Modo Debug - Hotel Paradise</h1>
        
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
          <h3>ðŸ“Š Status:</h3>
          <p>Quartos: {rooms.length}</p>
          <p>ServiÃ§os: {services?.categories ? Object.keys(services.categories).length : 0}</p>
          <p>Hook Ativo: <strong>{activeHook}</strong></p>
          
          {/* RenderizaÃ§Ã£o condicional apenas para exibiÃ§Ã£o */}
          {activeHook !== 'data' && (
            <>
              <p>Reserva: {reservation.room ? 'Quarto selecionado' : 'Nenhum quarto'}</p>
              {activeHook === 'form' && (
                <p>FormulÃ¡rio: {form.isValid ? 'VÃ¡lido' : 'InvÃ¡lido'}</p>
              )}
            </>
          )}
        </div>

        {/* Simulador de seleÃ§Ã£o de quarto - sÃ³ aparece se o hook de reserva estiver "ativo" para UI */}
        {activeHook !== 'data' && rooms.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>ðŸ›ï¸ Simular SeleÃ§Ã£o de Quarto</h3>
            <button 
              onClick={() => reservation.selectRoom(rooms[0])}
              style={{ padding: '10px', marginRight: '10px' }}
            >
              Selecionar Primeiro Quarto
            </button>
            {reservation.room && (
              <button onClick={() => reservation.clearReservation()}>
                Limpar SeleÃ§Ã£o
              </button>
            )}
          </div>
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default HomePageDebug;
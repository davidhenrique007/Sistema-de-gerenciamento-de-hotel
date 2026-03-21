import React, { useState, useEffect } from 'react';
import api from '@services/api';
import TabelaQuartosModal from './TabelaQuartosModal';
import SkeletonQuarto from './SkeletonQuarto';
import { roomsData } from '../../../../data/roomsData';

const ModalSelecionarQuarto = ({
  isOpen,
  onClose,
  onConfirm,
  quartoTemp,
  onSelectTemp,
  tipoQuarto
}) => {
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Normalizar tipo para o banco
  const normalizarTipo = (tipo) => {
    const tipos = {
      'Família': 'family',
      'Familia': 'family',
      'family': 'family',
      'Standard': 'standard',
      'standard': 'standard',
      'Deluxe': 'deluxe',
      'deluxe': 'deluxe',
      'Executivo': 'suite',
      'executivo': 'suite',
      'Suíte': 'suite',
      'Suite': 'suite',
      'suite': 'suite',
      'Presidencial': 'presidential',
      'presidential': 'presidential'
    };
    return tipos[tipo] || tipo?.toLowerCase();
  };

  // Buscar quartos do tipo
  const buscarQuartos = async (tipo) => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      const tipoNormalizado = normalizarTipo(tipo);
      console.log('🔍 Buscando quartos do tipo:', tipoNormalizado);
      
      // Tentar API primeiro
      const response = await api.get(`/quartos/disponiveis?tipo=${tipoNormalizado}`);
      const quartosApi = response.data.data;
      
      if (quartosApi && quartosApi.length > 0) {
        // Usar dados da API
        const quartosComAndar = quartosApi.map(q => ({
          id: q.id,
          numero: q.numero,
          tipo: q.tipo,
          status: q.status,
          preco: q.preco,
          andar: calcularAndar(q.numero)
        }));
        setQuartos(quartosComAndar);
        console.log('✅ Usando dados da API:', quartosComAndar.length);
      } else {
        // Fallback para dados mockados
        usarFallback(tipo);
      }
    } catch (err) {
      console.error('❌ Erro na API:', err);
      usarFallback(tipo);
    } finally {
      setLoading(false);
    }
  };

  // Fallback para dados mockados
  const usarFallback = (tipo) => {
    setUsingFallback(true);
    const tipoNormalizado = normalizarTipo(tipo);
    
    // Filtrar quartos mockados pelo tipo
    const mockQuartos = roomsData
      .filter(room => room.type === tipoNormalizado)
      .map(room => ({
        id: room.id,
        numero: room.number,
        tipo: room.type,
        status: 'disponível',
        preco: room.price.amount,
        andar: calcularAndar(room.number)
      }));
    
    setQuartos(mockQuartos);
    console.log('📦 Usando dados mockados:', mockQuartos.length);
    if (mockQuartos.length === 0) {
      setError(`Nenhum quarto do tipo "${tipo}" encontrado.`);
    }
  };

  const calcularAndar = (numero) => {
    const num = parseInt(numero);
    if (num <= 14) return num <= 7 ? 1 : 2;
    if (num <= 24) return num <= 20 ? 2 : 3;
    if (num <= 34) return 3;
    if (num <= 39) return 3;
    if (num <= 42) return 3;
    return 4;
  };

  useEffect(() => {
    if (isOpen && tipoQuarto) {
      buscarQuartos(tipoQuarto);
    }
  }, [isOpen, tipoQuarto]);

  const totalDisponiveis = quartos.filter(q => 
    q.status === 'disponível' || q.status === 'available'
  ).length;

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              Selecionar Quarto {tipoQuarto}
            </h2>
            <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Escolha um quarto disponível para sua reserva
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
              Total: {quartos.length} | Disponíveis: {totalDisponiveis}
              {usingFallback && <span style={{ marginLeft: '10px', color: '#ffc107' }}>⚠️ Dados de exemplo</span>}
            </p>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        <div style={modalBodyStyle}>
          {loading && <SkeletonQuarto />}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc3545' }}>
              <p>{error}</p>
              <button onClick={() => buscarQuartos(tipoQuarto)} style={retryButtonStyle}>
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !error && quartos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>Nenhum quarto disponível para este tipo.</p>
            </div>
          )}
          {!loading && !error && quartos.length > 0 && (
            <TabelaQuartosModal
              quartos={quartos}
              quartoTemp={quartoTemp}
              onSelect={onSelectTemp}
            />
          )}
        </div>

        <div style={modalFooterStyle}>
          <button onClick={onClose} style={buttonCancelStyle}>Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={!quartoTemp}
            style={{ ...buttonConfirmStyle, opacity: !quartoTemp ? 0.5 : 1 }}
          >
            Confirmar Quarto
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos inline (manter os mesmos que você já tinha)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContainerStyle = {
  background: 'white',
  borderRadius: '16px',
  width: '90%',
  maxWidth: '900px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
};

const modalHeaderStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #eaeaea',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '16px 16px 0 0',
  color: 'white'
};

const modalBodyStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px 24px',
  maxHeight: 'calc(85vh - 140px)'
};

const modalFooterStyle = {
  padding: '16px 24px',
  borderTop: '1px solid #eaeaea',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  background: '#fafafa',
  borderRadius: '0 0 16px 16px'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: 'white',
  padding: '4px 8px'
};

const buttonCancelStyle = {
  padding: '10px 24px',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '500',
  background: 'white',
  border: '1px solid #dee2e6',
  color: '#495057',
  cursor: 'pointer'
};

const buttonConfirmStyle = {
  padding: '10px 24px',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '500',
  background: '#28a745',
  border: 'none',
  color: 'white',
  cursor: 'pointer'
};

const retryButtonStyle = {
  marginTop: '16px',
  padding: '8px 16px',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default ModalSelecionarQuarto;

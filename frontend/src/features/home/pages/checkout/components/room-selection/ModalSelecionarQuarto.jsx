import React, { useState, useEffect } from 'react';
import api from '@services/api';
import TabelaQuartosModal from './TabelaQuartosModal';
import SkeletonQuarto from './SkeletonQuarto';

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

  // Normalizar o tipo para o formato do banco
  const normalizarTipo = (tipo) => {
    const tipos = {
      'Família': 'family',
      'Familia': 'family',
      'family': 'family',
      'Standard': 'standard',
      'standard': 'standard',
      'Deluxe': 'deluxe',
      'deluxe': 'deluxe',
      'Suíte': 'suite',
      'Suite': 'suite',
      'suite': 'suite'
    };
    return tipos[tipo] || tipo?.toLowerCase();
  };

  useEffect(() => {
    if (isOpen && tipoQuarto) {
      carregarQuartos();
    }
  }, [isOpen, tipoQuarto]);

  const carregarQuartos = async () => {
    try {
      setLoading(true);
      setError(null);
      const tipoNormalizado = normalizarTipo(tipoQuarto);
      console.log('🔍 Buscando quartos do tipo:', tipoNormalizado);
      const response = await api.get(`/quartos/disponiveis?tipo=${tipoNormalizado}`);
      setQuartos(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar quartos:', err);
      setError('Não foi possível carregar os quartos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  };

  const modalHeaderStyle = {
    padding: '24px',
    borderBottom: '1px solid #eaeaea',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

  const modalBodyStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    minHeight: '300px',
    maxHeight: '60vh'
  };

  const modalFooterStyle = {
    padding: '24px',
    borderTop: '1px solid #eaeaea',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  };

  const buttonStyle = {
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>
              Selecionar Quarto {tipoQuarto}
            </h2>
            <p style={{ margin: 0, color: '#666' }}>
              Escolha um quarto disponível para sua reserva
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={modalBodyStyle}>
          {loading && <SkeletonQuarto />}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc3545' }}>
              <p>{error}</p>
              <button onClick={carregarQuartos} style={{ marginTop: '16px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !error && (
            <TabelaQuartosModal
              quartos={quartos}
              quartoTemp={quartoTemp}
              onSelect={onSelectTemp}
            />
          )}
        </div>

        <div style={modalFooterStyle}>
          <button onClick={onClose} style={{ ...buttonStyle, background: 'white', border: '1px solid #dee2e6', color: '#495057' }}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!quartoTemp}
            style={{
              ...buttonStyle,
              background: '#007bff',
              border: 'none',
              color: 'white',
              opacity: !quartoTemp ? 0.5 : 1,
              cursor: !quartoTemp ? 'not-allowed' : 'pointer'
            }}
          >
            Confirmar Quarto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSelecionarQuarto;

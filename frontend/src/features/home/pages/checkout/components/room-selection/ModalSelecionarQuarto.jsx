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

  // NORMALIZAÇÃO DE TIPOS - CORRIGIDA!
  const normalizarTipo = (tipo) => {
    const tipos = {
      'Família': 'family',
      'Familia': 'family',
      'family': 'family',
      'Standard': 'standard',
      'standard': 'standard',
      'Deluxe': 'deluxe',
      'deluxe': 'deluxe',
      'Executivo': 'suite',        // ← EXECUTIVO VIRA SUITE
      'executivo': 'suite',
      'Suíte': 'suite',
      'Suite': 'suite',
      'suite': 'suite',
      'Presidencial': 'presidential',
      'presidential': 'presidential'
    };
    
    const resultado = tipos[tipo] || tipo?.toLowerCase();
    console.log('🔄 Normalizando tipo:', tipo, '→', resultado);
    return resultado;
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
      
      // Adicionar andar baseado no número do quarto
      const quartosComAndar = response.data.data.map(q => ({
        ...q,
        andar: calcularAndar(q.numero)
      }));
      
      setQuartos(quartosComAndar);
      console.log(`✅ Encontrados ${quartosComAndar.length} quartos`);
    } catch (err) {
      console.error('Erro ao carregar quartos:', err);
      setError('Não foi possível carregar os quartos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const calcularAndar = (numero) => {
    const num = parseInt(numero);
    if (num <= 14) return num <= 7 ? 1 : 2;
    if (num <= 24) return num <= 20 ? 2 : 3;
    if (num <= 34) return 3;
    if (num <= 39) return 3;  // Suite/Executivo no 3º andar
    if (num <= 42) return 3;  // Family no 3º andar
    return 4;  // Presidential no 4º andar
  };

  const totalDisponiveis = quartos.filter(q => 
    q.status === 'disponível' || q.status === 'available'
  ).length;

  if (!isOpen) return null;

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
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'modalFadeIn 0.2s ease-out'
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

  const buttonCancelStyle = {
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    background: 'white',
    border: '1px solid #dee2e6',
    color: '#495057',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const buttonConfirmStyle = {
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    background: quartoTemp ? '#28a745' : '#6c757d',
    border: 'none',
    color: 'white',
    cursor: quartoTemp ? 'pointer' : 'not-allowed',
    opacity: quartoTemp ? 1 : 0.6,
    transition: 'all 0.2s'
  };

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
              Total de Quartos: {quartos.length} | Disponíveis: {totalDisponiveis}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'white',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={modalBodyStyle}>
          {loading && <SkeletonQuarto />}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc3545' }}>
              <p>{error}</p>
              <button
                onClick={carregarQuartos}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
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
          <button
            onClick={onClose}
            style={buttonCancelStyle}
            onMouseEnter={(e) => {
              e.target.style.background = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!quartoTemp}
            style={buttonConfirmStyle}
            onMouseEnter={(e) => {
              if (quartoTemp) e.target.style.background = '#218838';
            }}
            onMouseLeave={(e) => {
              if (quartoTemp) e.target.style.background = '#28a745';
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

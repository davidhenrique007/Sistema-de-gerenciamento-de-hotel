// =====================================================
// COMPONENTE - MODAL DE SELEÇÃO DE QUARTO (MÚLTIPLA)
// =====================================================

import React, { useState, useEffect } from 'react';
import api from '@services/api';
import TabelaQuartosModal from './TabelaQuartosModal';
import SkeletonQuarto from './SkeletonQuarto';
import styles from './modal.module.css';

const ModalSelecionarQuarto = ({
  isOpen,
  onClose,
  onConfirm,
  quartosTemp,
  onToggleTemp,
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
      
      const response = await api.get(`/quartos/disponiveis?tipo=${tipoNormalizado}`);
      console.log('📦 Resposta da API:', response.data);
      
      // Verificar estrutura da resposta
      let quartosData = [];
      if (response.data && response.data.data) {
        quartosData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        quartosData = response.data;
      }
      
      if (quartosData && quartosData.length > 0) {
        // Mapear os dados corretamente - usando os campos do banco
        const quartosComAndar = quartosData.map(q => ({
          id: q.id,
          numero: q.room_number || q.numero,      // room_number do banco
          tipo: q.type || q.tipo,                 // type do banco
          status: q.status,
          preco: q.price_per_night || q.preco,
          andar: q.floor || calcularAndar(q.room_number || q.numero)
        }));
        setQuartos(quartosComAndar);
        console.log('✅ Usando dados da API:', quartosComAndar.length);
        console.log('📊 Primeiro quarto:', quartosComAndar[0]);
      } else {
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
    
    // Criar dados mockados com números sequenciais
    const mockQuartos = [];
    const prefixo = tipoNormalizado === 'standard' ? 1 : 
                     tipoNormalizado === 'deluxe' ? 15 :
                     tipoNormalizado === 'suite' ? 35 :
                     tipoNormalizado === 'family' ? 40 : 43;
    
    for (let i = 0; i < 10; i++) {
      const numero = prefixo + i;
      mockQuartos.push({
        id: `mock-${numero}`,
        numero: numero.toString().padStart(2, '0'),
        tipo: tipoNormalizado,
        status: 'available',
        preco: tipoNormalizado === 'standard' ? 3000 :
               tipoNormalizado === 'deluxe' ? 4000 :
               tipoNormalizado === 'suite' ? 6000 :
               tipoNormalizado === 'family' ? 5000 : 12000,
        andar: Math.floor(numero / 10) + 1
      });
    }
    
    setQuartos(mockQuartos);
    console.log('📦 Usando dados mockados:', mockQuartos.length);
    if (mockQuartos.length === 0) {
      setError(`Nenhum quarto do tipo "${tipo}" encontrado.`);
    }
  };

  const calcularAndar = (numero) => {
    if (!numero) return 1;
    const num = parseInt(numero);
    if (num <= 7) return 1;
    if (num <= 14) return 2;
    if (num <= 21) return 3;
    if (num <= 28) return 4;
    return 5;
  };

  useEffect(() => {
    if (isOpen && tipoQuarto) {
      buscarQuartos(tipoQuarto);
    }
  }, [isOpen, tipoQuarto]);

  const totalDisponiveis = quartos.filter(q => 
    q.status === 'available' || q.status === 'disponível'
  ).length;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Selecionar Quarto {tipoQuarto}</h2>
            <p className={styles.modalSubtitle}>Escolha os quartos disponíveis para sua reserva</p>
            <small className={styles.modalStats}>
              Total: {quartos.length} | Disponíveis: {totalDisponiveis}
              {usingFallback && <span style={{ marginLeft: '10px', color: '#ffc107' }}>⚠️ Dados de exemplo</span>}
            </small>
          </div>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        {/* Corpo */}
        <div className={styles.modalBody}>
          {loading && <SkeletonQuarto />}
          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button onClick={() => buscarQuartos(tipoQuarto)} className={styles.retryButton}>
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !error && quartos.length === 0 && (
            <div className={styles.emptyMessage}>
              <p>Nenhum quarto disponível para este tipo.</p>
            </div>
          )}
          {!loading && !error && quartos.length > 0 && (
            <TabelaQuartosModal
              quartos={quartos}
              quartosTemp={quartosTemp}
              onToggle={onToggleTemp}
            />
          )}
        </div>

        {/* Rodapé */}
        <div className={styles.modalFooter}>
          <div className={styles.quartosSelecionadosInfo}>
            {quartosTemp.length > 0 && (
              <span>{quartosTemp.length} quarto(s) selecionado(s)</span>
            )}
          </div>
          <button onClick={onClose} className={styles.buttonCancel}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={quartosTemp.length === 0}
            className={styles.buttonConfirm}
          >
            Confirmar ({quartosTemp.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSelecionarQuarto;
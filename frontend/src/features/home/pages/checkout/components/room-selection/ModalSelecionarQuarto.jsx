// =====================================================
// COMPONENTE - MODAL DE SELEÇÃO DE QUARTO (MÚLTIPLA)
// =====================================================

import React, { useState, useEffect } from 'react';
import api from '@services/api';
import TabelaQuartosModal from './TabelaQuartosModal';
import SkeletonQuarto from './SkeletonQuarto';
import { roomsData } from '../../../../data/roomsData';
import styles from './modal.module.css';  // ← CORRIGIDO: importando o CSS Module

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
      const quartosApi = response.data.data;
      
      if (quartosApi && quartosApi.length > 0) {
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
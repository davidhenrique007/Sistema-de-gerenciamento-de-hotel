// =====================================================
// HOOK - CONTROLE DO MODAL DE SELEÇÃO DE QUARTO (MÚLTIPLA)
// =====================================================

import { useState, useCallback } from 'react';

export const useModalQuarto = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [quartosSelecionados, setQuartosSelecionados] = useState([]);
  const [quartosTemp, setQuartosTemp] = useState([]);

  const abrirModal = useCallback(() => {
    setIsOpen(true);
    setQuartosTemp([...quartosSelecionados]);
  }, [quartosSelecionados]);

  const fecharModal = useCallback(() => {
    setIsOpen(false);
    setQuartosTemp([]);
  }, []);

  // Selecionar/Deselecionar quarto (toggle)
  const toggleQuartoTemp = useCallback((quarto) => {
    setQuartosTemp(prev => {
      const existe = prev.find(q => q.id === quarto.id);
      if (existe) {
        return prev.filter(q => q.id !== quarto.id);
      } else {
        return [...prev, quarto];
      }
    });
  }, []);

  const confirmarSelecao = useCallback(() => {
    setQuartosSelecionados([...quartosTemp]);
    setIsOpen(false);
    setQuartosTemp([]);
  }, [quartosTemp]);

  const cancelarSelecao = useCallback(() => {
    setQuartosTemp([]);
    setIsOpen(false);
  }, []);

  // Remover um quarto da seleção (fora do modal)
  const removerQuarto = useCallback((quartoId) => {
    setQuartosSelecionados(prev => prev.filter(q => q.id !== quartoId));
  }, []);

  // Adicionar um quarto manualmente (fora do modal)
  const adicionarQuarto = useCallback((quarto) => {
    setQuartosSelecionados(prev => [...prev, quarto]);
  }, []);

  // Limpar todos os quartos
  const limparQuartos = useCallback(() => {
    setQuartosSelecionados([]);
    setQuartosTemp([]);
  }, []);

  return {
    // Estado
    isOpen,
    quartosSelecionados,
    quartosTemp,
    
    // Funções do modal
    abrirModal,
    fecharModal,
    toggleQuartoTemp,
    confirmarSelecao,
    cancelarSelecao,
    
    // Funções de gestão
    removerQuarto,
    adicionarQuarto,
    limparQuartos,
    
    // Utilitários
    totalQuartos: quartosSelecionados.length,
    temQuartos: quartosSelecionados.length > 0
  };
};
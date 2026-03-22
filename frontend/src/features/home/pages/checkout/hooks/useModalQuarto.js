import { useState, useCallback } from 'react';

export const useModalQuarto = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [quartoTemp, setQuartoTemp] = useState(null);

  const abrirModal = useCallback(() => {
    setIsOpen(true);
    setQuartoTemp(quartoSelecionado);
  }, [quartoSelecionado]);

  const fecharModal = useCallback(() => {
    setIsOpen(false);
    setQuartoTemp(null);
  }, []);

  const selecionarQuartoTemp = useCallback((quarto) => {
    setQuartoTemp(quarto);
  }, []);

  const confirmarSelecao = useCallback(() => {
    if (quartoTemp) {
      setQuartoSelecionado(quartoTemp);
      setIsOpen(false);
      setQuartoTemp(null);
    }
  }, [quartoTemp]);

  const cancelarSelecao = useCallback(() => {
    setQuartoTemp(null);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    quartoSelecionado,
    quartoTemp,
    abrirModal,
    fecharModal,
    selecionarQuartoTemp,
    confirmarSelecao,
    cancelarSelecao
  };
};
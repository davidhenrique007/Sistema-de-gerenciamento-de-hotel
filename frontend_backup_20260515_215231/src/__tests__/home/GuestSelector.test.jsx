import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestSelector from '../../features/home/components/ReservationForm/GuestSelector';
import { GUEST_TYPES } from '../../features/home/hooks/useGuestCounter';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('GuestSelector Component', () => {
  // ==========================================================================
  // MOCK DATA
  // ==========================================================================

  const mockGuests = {
    adults: 2,
    children: 1,
    babies: 0,
  };

  const mockHandlers = {
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    hasReachedMin: jest.fn().mockReturnValue(false),
    hasReachedMax: jest.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================

  describe('Renderização', () => {
    it('deve renderizar todos os tipos de hóspedes', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      expect(screen.getByText('Adultos')).toBeInTheDocument();
      expect(screen.getByText('Crianças')).toBeInTheDocument();
      expect(screen.getByText('Bebês')).toBeInTheDocument();
    });

    it('deve mostrar as descrições corretas', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      expect(screen.getByText('Acima de 12 anos')).toBeInTheDocument();
      expect(screen.getByText('2 a 12 anos')).toBeInTheDocument();
      expect(screen.getByText('Abaixo de 2 anos')).toBeInTheDocument();
    });

    it('deve mostrar os valores corretos', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve calcular e mostrar total corretamente', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      expect(screen.getByText('Total de hóspedes')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // 2 + 1 + 0
    });
  });

  // ==========================================================================
  // INTERAÇÕES
  // ==========================================================================

  describe('Interações', () => {
    it('deve chamar onIncrement ao clicar em + para adultos', async () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      const adultIncrement = screen.getAllByText('+')[0];
      await userEvent.click(adultIncrement);

      expect(mockHandlers.onIncrement).toHaveBeenCalledWith(GUEST_TYPES.ADULTS);
    });

    it('deve chamar onDecrement ao clicar em - para crianças', async () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      const childDecrement = screen.getAllByText('−')[1];
      await userEvent.click(childDecrement);

      expect(mockHandlers.onDecrement).toHaveBeenCalledWith(GUEST_TYPES.CHILDREN);
    });

    it('deve desabilitar botões quando atingir mínimo', () => {
      const hasReachedMin = (type) => type === GUEST_TYPES.ADULTS;

      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
          hasReachedMin={hasReachedMin}
        />
      );

      const decrementButtons = screen.getAllByText('−');
      
      // Primeiro botão (adultos) deve estar desabilitado
      expect(decrementButtons[0]).toBeDisabled();
      
      // Outros botões não devem estar desabilitados
      expect(decrementButtons[1]).not.toBeDisabled();
      expect(decrementButtons[2]).not.toBeDisabled();
    });

    it('deve desabilitar botões quando atingir máximo', () => {
      const hasReachedMax = (type) => type === GUEST_TYPES.CHILDREN;

      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
          hasReachedMax={hasReachedMax}
        />
      );

      const incrementButtons = screen.getAllByText('+');
      
      // Segundo botão (crianças) deve estar desabilitado
      expect(incrementButtons[1]).toBeDisabled();
      
      // Outros botões não devem estar desabilitados
      expect(incrementButtons[0]).not.toBeDisabled();
      expect(incrementButtons[2]).not.toBeDisabled();
    });
  });

  // ==========================================================================
  // ACESSIBILIDADE
  // ==========================================================================

  describe('Acessibilidade', () => {
    it('deve ter aria-labels nos botões', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      const buttons = screen.getAllByRole('button');
      
      expect(buttons[0]).toHaveAttribute('aria-label', 'Remover adultos');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Adicionar adultos');
      expect(buttons[2]).toHaveAttribute('aria-label', 'Remover crianças');
      expect(buttons[3]).toHaveAttribute('aria-label', 'Adicionar crianças');
      expect(buttons[4]).toHaveAttribute('aria-label', 'Remover bebês');
      expect(buttons[5]).toHaveAttribute('aria-label', 'Adicionar bebês');
    });

    it('deve ter aria-live no contador de total', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      const totalElement = screen.getByText('3');
      expect(totalElement).toHaveAttribute('aria-live', 'polite');
    });

    it('deve permitir foco nos botões', () => {
      render(
        <GuestSelector
          guests={mockGuests}
          onIncrement={mockHandlers.onIncrement}
          onDecrement={mockHandlers.onDecrement}
        />
      );

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      
      expect(firstButton).toHaveFocus();
    });
  });
});
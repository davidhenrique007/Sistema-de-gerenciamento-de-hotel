import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationForm from '../../features/home/components/ReservationForm/ReservationForm';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockRoom = {
  id: 'room-001',
  number: '101',
  typeLabel: 'Standard',
  capacity: 2,
  price: {
    amount: 3000,
    currency: 'MZN',
  },
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('ReservationForm Component', () => {
  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================

  describe('Renderização', () => {
    it('deve mostrar mensagem quando não há quarto selecionado', () => {
      render(<ReservationForm selectedRoom={null} />);
      
      expect(screen.getByText(/selecione um quarto/i)).toBeInTheDocument();
    });

    it('deve renderizar formulário completo quando quarto selecionado', () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      expect(screen.getByText(/reservar quarto 101/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data de check-in/i)).toBeInTheDocument();
      expect(screen.getByText(/adultos/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // INTERAÇÕES
  // ==========================================================================

  describe('Interações', () => {
    it('deve permitir selecionar datas', async () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      const dateInput = screen.getByLabelText(/data de check-in/i);
      await userEvent.click(dateInput);
      
      // Calendário deve abrir
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('deve permitir alterar número de hóspedes', async () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      const incrementButton = screen.getAllByLabelText(/adicionar/i)[0];
      await userEvent.click(incrementButton);
      
      // Verificar se contador aumentou
      const guestCount = screen.getAllByText('2')[0];
      expect(guestCount).toBeInTheDocument();
    });

    it('não deve permitir exceder capacidade do quarto', async () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      // Tentar adicionar 3 adultos (capacidade 2)
      const incrementButton = screen.getAllByLabelText(/adicionar/i)[0];
      await userEvent.click(incrementButton); // 2
      await userEvent.click(incrementButton); // 3 (deve bloquear)
      
      // Verificar mensagem de erro
      expect(screen.getByText(/capacidade máxima/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // VALIDAÇÕES
  // ==========================================================================

  describe('Validações', () => {
    it('deve desabilitar botão de submit inicialmente', () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      const submitButton = screen.getByRole('button', { name: /reservar agora/i });
      expect(submitButton).toBeDisabled();
    });

    it('deve habilitar botão quando formulário válido', async () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      // Selecionar datas
      const dateInput = screen.getByLabelText(/data de check-in/i);
      await userEvent.click(dateInput);
      
      // Selecionar data no calendário (simplificado)
      const dateButtons = await screen.findAllByRole('button', { name: /\d+/ });
      await userEvent.click(dateButtons[15]); // Data aleatória
      
      // Verificar botão habilitado
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /reservar agora/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('deve mostrar erros de validação ao tentar submeter inválido', async () => {
      render(<ReservationForm selectedRoom={mockRoom} />);
      
      const submitButton = screen.getByRole('button', { name: /reservar agora/i });
      await userEvent.click(submitButton);
      
      // Deve mostrar erros
      expect(screen.getByText(/por favor, corrija/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SUBMISSÃO
  // ==========================================================================

  describe('Submissão', () => {
    it('deve chamar onSubmit com dados da reserva', async () => {
      const handleSubmit = jest.fn();
      
      render(<ReservationForm selectedRoom={mockRoom} onSubmit={handleSubmit} />);
      
      // Preencher formulário
      const dateInput = screen.getByLabelText(/data de check-in/i);
      await userEvent.click(dateInput);
      
      const dateButtons = await screen.findAllByRole('button', { name: /\d+/ });
      await userEvent.click(dateButtons[15]); // Check-in
      await userEvent.click(dateButtons[20]); // Check-out
      
      // Submeter
      const submitButton = screen.getByRole('button', { name: /reservar agora/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});
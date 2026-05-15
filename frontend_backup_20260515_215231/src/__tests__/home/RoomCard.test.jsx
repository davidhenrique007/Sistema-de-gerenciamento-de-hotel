import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomCard from '../../features/home/components/RoomsSection/RoomCard';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockRoom = {
  id: 'room-001',
  number: '101',
  type: 'standard',
  typeLabel: 'Standard',
  capacity: 2,
  price: {
    amount: 3000,
    currency: 'MZN',
  },
  status: 'available',
  amenities: ['Wi-Fi', 'TV', 'Ar condicionado'],
  image: '/assets/images/rooms/standard/101.jpg',
  description: 'Quarto aconchegante com vista para o jardim.',
  size: 25,
  bedType: 'Cama de casal queen',
};

const mockOccupiedRoom = {
  ...mockRoom,
  id: 'room-002',
  number: '202',
  status: 'occupied',
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('RoomCard Component', () => {
  // ==========================================================================
  // RENDERIZAÇÃO BÁSICA
  // ==========================================================================

  describe('Renderização básica', () => {
    it('deve renderizar corretamente com dados do quarto', () => {
      render(<RoomCard room={mockRoom} />);

      expect(screen.getByText('Quarto 101')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('3.000 MZN')).toBeInTheDocument();
      expect(screen.getByText('2 hóspedes')).toBeInTheDocument();
      expect(screen.getByText(mockRoom.description)).toBeInTheDocument();
    });

    it('deve renderizar badge de disponível', () => {
      render(<RoomCard room={mockRoom} />);
      
      const badge = screen.getByText('Disponível');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('success');
    });

    it('deve renderizar badge de ocupado', () => {
      render(<RoomCard room={mockOccupiedRoom} />);
      
      const badge = screen.getByText('Ocupado');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('error');
    });

    it('deve renderizar amenities corretamente', () => {
      render(<RoomCard room={mockRoom} />);
      
      mockRoom.amenities.forEach(amenity => {
        expect(screen.getByText(amenity)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // BOTÃO DE SELEÇÃO
  // ==========================================================================

  describe('Botão de seleção', () => {
    it('deve renderizar botão "Selecionar Quarto" quando disponível', () => {
      render(<RoomCard room={mockRoom} />);
      
      const button = screen.getByRole('button', { name: /selecionar quarto/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('deve renderizar botão "Indisponível" quando ocupado', () => {
      render(<RoomCard room={mockOccupiedRoom} />);
      
      const button = screen.getByRole('button', { name: /indisponível/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('deve chamar onSelect ao clicar no botão quando disponível', async () => {
      const handleSelect = jest.fn();
      render(<RoomCard room={mockRoom} onSelect={handleSelect} />);

      const button = screen.getByRole('button', { name: /selecionar quarto/i });
      await userEvent.click(button);

      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith(mockRoom);
    });

    it('não deve chamar onSelect ao clicar no botão quando ocupado', async () => {
      const handleSelect = jest.fn();
      render(<RoomCard room={mockOccupiedRoom} onSelect={handleSelect} />);

      const button = screen.getByRole('button', { name: /indisponível/i });
      await userEvent.click(button);

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // ESTADO SELECIONADO
  // ==========================================================================

  describe('Estado selecionado', () => {
    it('deve aplicar classe selected quando isSelected=true', () => {
      render(<RoomCard room={mockRoom} isSelected={true} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('selected');
    });

    it('não deve aplicar classe selected quando isSelected=false', () => {
      render(<RoomCard room={mockRoom} isSelected={false} />);
      
      const card = screen.getByRole('article');
      expect(card).not.toHaveClass('selected');
    });
  });

  // ==========================================================================
  // ACESSIBILIDADE
  // ==========================================================================

  describe('Acessibilidade', () => {
    it('deve ter aria-label apropriado no botão disponível', () => {
      render(<RoomCard room={mockRoom} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Selecionar quarto 101');
    });

    it('deve ter aria-label apropriado no botão indisponível', () => {
      render(<RoomCard room={mockOccupiedRoom} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Quarto 202 indisponível');
    });

    it('deve ter aria-labelledby associado ao título', () => {
      render(<RoomCard room={mockRoom} />);
      
      const card = screen.getByRole('article');
      const labelledby = card.getAttribute('aria-labelledby');
      
      expect(labelledby).toBe(`room-title-${mockRoom.id}`);
      expect(document.getElementById(labelledby)).toBeInTheDocument();
    });
  });
});
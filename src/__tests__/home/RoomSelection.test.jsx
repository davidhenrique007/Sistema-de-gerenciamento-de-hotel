import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomsSection from '../../features/home/components/RoomsSection/RoomsSection';
import useRooms from '../../features/home/hooks/useRooms';
import useRoomSelection from '../../features/home/hooks/useRoomSelection';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('../../features/home/hooks/useRooms');
jest.mock('../../features/home/hooks/useRoomSelection');

const mockRooms = [
  {
    id: 'room-001',
    number: '101',
    type: 'standard',
    typeLabel: 'Standard',
    capacity: 2,
    price: { amount: 3000, currency: 'MZN' },
    status: 'available',
    amenities: ['Wi-Fi', 'TV'],
    image: '/test.jpg',
    description: 'Quarto teste',
    size: 25,
  },
  {
    id: 'room-002',
    number: '102',
    type: 'standard',
    typeLabel: 'Standard',
    capacity: 2,
    price: { amount: 3000, currency: 'MZN' },
    status: 'available',
    amenities: ['Wi-Fi', 'TV'],
    image: '/test.jpg',
    description: 'Quarto teste 2',
    size: 25,
  },
];

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Room Selection Flow', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock useRooms
    useRooms.mockReturnValue({
      rooms: mockRooms,
      isLoading: false,
      error: null,
      stats: {
        total: 2,
        available: 2,
        occupied: 0,
        maintenance: 0,
      },
      getAvailableRooms: () => mockRooms,
    });

    // Mock useRoomSelection
    useRoomSelection.mockReturnValue({
      selectedRoomId: null,
      selectedRoom: null,
      selectRoom: jest.fn(),
      deselectRoom: jest.fn(),
      isRoomSelected: jest.fn(),
      toggleRoomSelection: jest.fn(),
    });
  });

  // ==========================================================================
  // RENDERIZAÇÃO DO GRID
  // ==========================================================================

  describe('Renderização do Grid', () => {
    it('deve renderizar todos os quartos corretamente', () => {
      render(<RoomsSection />);

      expect(screen.getByText('Quarto 101')).toBeInTheDocument();
      expect(screen.getByText('Quarto 102')).toBeInTheDocument();
    });

    it('deve mostrar loading state quando carregando', () => {
      useRooms.mockReturnValue({
        rooms: [],
        isLoading: true,
        error: null,
        stats: { total: 0, available: 0 },
        getAvailableRooms: () => [],
      });

      render(<RoomsSection />);
      
      expect(screen.getByText(/carregando quartos/i)).toBeInTheDocument();
    });

    it('deve mostrar erro state quando houver erro', () => {
      useRooms.mockReturnValue({
        rooms: [],
        isLoading: false,
        error: 'Erro ao carregar',
        stats: { total: 0, available: 0 },
        getAvailableRooms: () => [],
      });

      render(<RoomsSection />);
      
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });

    it('deve filtrar quartos quando clicar em "Disponíveis"', async () => {
      const getAvailableRooms = jest.fn().mockReturnValue([mockRooms[0]]);
      
      useRooms.mockReturnValue({
        rooms: mockRooms,
        isLoading: false,
        error: null,
        stats: { total: 2, available: 2 },
        getAvailableRooms,
      });

      render(<RoomsSection />);

      const filterButton = screen.getByText('Disponíveis');
      await userEvent.click(filterButton);

      expect(getAvailableRooms).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // SELEÇÃO DE QUARTO
  // ==========================================================================

  describe('Seleção de Quarto', () => {
    it('deve chamar selectRoom ao clicar em um quarto', async () => {
      const mockSelectRoom = jest.fn();
      
      useRoomSelection.mockReturnValue({
        selectedRoomId: null,
        selectedRoom: null,
        selectRoom: mockSelectRoom,
        deselectRoom: jest.fn(),
        isRoomSelected: jest.fn(),
        toggleRoomSelection: jest.fn(),
      });

      const mockOnSelectRoom = jest.fn();
      
      render(<RoomsSection onSelectRoom={mockOnSelectRoom} />);

      const roomCards = screen.getAllByRole('button', { name: /selecionar quarto/i });
      await userEvent.click(roomCards[0]);

      expect(mockSelectRoom).toHaveBeenCalledWith(mockRooms[0]);
      expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[0]);
    });

    it('deve destacar visualmente o quarto selecionado', () => {
      useRoomSelection.mockReturnValue({
        selectedRoomId: 'room-001',
        selectedRoom: mockRooms[0],
        selectRoom: jest.fn(),
        deselectRoom: jest.fn(),
        isRoomSelected: (id) => id === 'room-001',
        toggleRoomSelection: jest.fn(),
      });

      render(<RoomsSection />);

      const gridItems = screen.getAllByRole('button');
      
      // O primeiro item deve ter classe selected
      expect(gridItems[0].parentElement).toHaveClass('selected');
    });

    it('deve mostrar preview do quarto selecionado na página', async () => {
      const mockSelectRoom = jest.fn();
      
      useRoomSelection.mockReturnValue({
        selectedRoomId: 'room-001',
        selectedRoom: mockRooms[0],
        selectRoom: mockSelectRoom,
        deselectRoom: jest.fn(),
        isRoomSelected: (id) => id === 'room-001',
        toggleRoomSelection: jest.fn(),
      });

      render(<RoomsSection />);

      // Verificar se a informação do quarto selecionado aparece
      expect(screen.getByText(/quarto selecionado: 101/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACESSIBILIDADE
  // ==========================================================================

  describe('Acessibilidade', () => {
    it('deve ter role="grid" no container principal', () => {
      render(<RoomsSection />);
      
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('deve ter aria-selected nos itens selecionados', () => {
      useRoomSelection.mockReturnValue({
        selectedRoomId: 'room-001',
        selectedRoom: mockRooms[0],
        selectRoom: jest.fn(),
        deselectRoom: jest.fn(),
        isRoomSelected: (id) => id === 'room-001',
        toggleRoomSelection: jest.fn(),
      });

      render(<RoomsSection />);

      const selectedItem = screen.getByLabelText(/quarto 101/i).closest('[role="button"]');
      expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    });

    it('deve permitir navegação por teclado', async () => {
      render(<RoomsSection />);

      const firstItem = screen.getAllByRole('button')[0];
      firstItem.focus();

      expect(firstItem).toHaveFocus();
    });
  });
});
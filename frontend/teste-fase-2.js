// ============================================
// TESTE DA FASE 2 - Use Cases (Dias 06-09)
// ============================================
// Executar com: node teste-fase-2.js
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { storage } from './src/shared/utils/storage.js';
import { Money } from './src/core/domain/value-objects/Money.js';
import { DateRange, createDateRange } from './src/core/domain/value-objects/DateRange.js';
import { OccupancyStatuses } from './src/core/domain/value-objects/OccupancyStatus.js';
import { Room } from './src/core/domain/entities/Room.js';
import { Service, ServiceType } from './src/core/domain/entities/Service.js';
import { Reservation, ReservationStatus } from './src/core/domain/entities/Reservation.js';

// ============================================
// USE CASES - DIA 06
// ============================================
import { ListAvailableRoomsUseCase } from './src/core/application/use-cases/rooms/ListAvailableRoomsUseCase.js';
import { GetRoomDetailsUseCase } from './src/core/application/use-cases/rooms/GetRoomDetailsUseCase.js';

// ============================================
// USE CASES - DIA 07
// ============================================
import { UpdateRoomOccupancyUseCase, OccupancyAction } from './src/core/application/use-cases/rooms/UpdateRoomOccupancyUseCase.js';
import { ValidateRoomAvailabilityUseCase } from './src/core/application/use-cases/rooms/ValidateRoomAvailabilityUseCase.js';

// ============================================
// USE CASES - DIA 08
// ============================================
import { CalculatePriceUseCase } from './src/core/application/use-cases/reservation/CalculatePriceUseCase.js';
import { ValidateReservationUseCase } from './src/core/application/use-cases/reservation/ValidateReservationUseCase.js';

// ============================================
// USE CASES - DIA 09
// ============================================
import { ListServicesUseCase, ServiceCategory } from './src/core/application/use-cases/services/ListServicesUseCase.js';
import { CalculateServicesPriceUseCase } from './src/core/application/use-cases/services/CalculateServicesPriceUseCase.js';

// ============================================
// MOCK REPOSITORIES
// ============================================

// Mock do repositório de quartos
class MockRoomRepository {
  constructor() {
    this.rooms = this._createMockRooms();
  }

  _createMockRooms() {
    return [
      new Room({
        id: 101,
        number: '101',
        type: 'standard',
        capacity: 2,
        pricePerNight: new Money(250.00),
        status: OccupancyStatuses.AVAILABLE,
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar']
      }),
      new Room({
        id: 102,
        number: '102',
        type: 'standard',
        capacity: 2,
        pricePerNight: new Money(280.00),
        status: OccupancyStatuses.AVAILABLE,
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Vista mar']
      }),
      new Room({
        id: 201,
        number: '201',
        type: 'deluxe',
        capacity: 3,
        pricePerNight: new Money(450.00),
        status: OccupancyStatuses.AVAILABLE,
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Banheira', 'Vista mar']
      }),
      new Room({
        id: 202,
        number: '202',
        type: 'deluxe',
        capacity: 3,
        pricePerNight: new Money(480.00),
        status: OccupancyStatuses.OCCUPIED, // Já ocupado
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Banheira']
      }),
      new Room({
        id: 301,
        number: '301',
        type: 'executive',
        capacity: 2,
        pricePerNight: new Money(600.00),
        status: OccupancyStatuses.AVAILABLE,
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Mesa de trabalho', 'Cafeteira']
      }),
      new Room({
        id: 401,
        number: '401',
        type: 'family',
        capacity: 5,
        pricePerNight: new Money(800.00),
        status: OccupancyStatuses.AVAILABLE,
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', '2 camas', 'Berço']
      }),
      new Room({
        id: 501,
        number: '501',
        type: 'presidential',
        capacity: 4,
        pricePerNight: new Money(1200.00),
        status: OccupancyStatuses.MAINTENANCE, // Em manutenção
        amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Sala', 'Jacuzzi', 'Vista 360']
      })
    ];
  }

  async findAll() {
    return this.rooms;
  }

  async findById(id) {
    return this.rooms.find(r => r.id === id) || null;
  }

  async findByNumber(number) {
    return this.rooms.find(r => r.number === number) || null;
  }

  async update(room) {
    const index = this.rooms.findIndex(r => r.id === room.id);
    if (index >= 0) {
      this.rooms[index] = room;
    }
    return room;
  }
}

// Mock do repositório de serviços
class MockServiceRepository {
  constructor() {
    this.services = this._createMockServices();
  }

  _createMockServices() {
    return [
      new Service({
        id: 1,
        name: 'Café da manhã',
        description: 'Café da manhã completo com opções variadas',
        price: new Money(45.00),
        type: ServiceType.PER_PERSON_NIGHT,
        isOptional: true,
        maxQuantity: 2
      }),
      new Service({
        id: 2,
        name: 'Massagem relaxante',
        description: 'Massagem de 60 minutos',
        price: new Money(150.00),
        type: ServiceType.PER_PERSON,
        isOptional: true,
        maxQuantity: 2
      }),
      new Service({
        id: 3,
        name: 'Estacionamento',
        description: 'Vaga coberta no estacionamento',
        price: new Money(30.00),
        type: ServiceType.PER_NIGHT,
        isOptional: true,
        maxQuantity: 1
      }),
      new Service({
        id: 4,
        name: 'Jantar romântico',
        description: 'Jantar especial para duas pessoas',
        price: new Money(280.00),
        type: ServiceType.PER_STAY,
        isOptional: true,
        maxQuantity: 1
      }),
      new Service({
        id: 5,
        name: 'Translado aeroporto',
        description: 'Transporte ida/volta',
        price: new Money(120.00),
        type: ServiceType.PER_PERSON,
        isOptional: true,
        maxQuantity: 4
      }),
      new Service({
        id: 6,
        name: 'Acesso ao spa',
        description: 'Acesso completo ao spa por 1 dia',
        price: new Money(90.00),
        type: ServiceType.PER_PERSON,
        isOptional: true,
        maxQuantity: 2
      }),
      new Service({
        id: 7,
        name: 'Cesta de frutas',
        description: 'Cesta de boas-vindas',
        price: new Money(50.00),
        type: ServiceType.PER_STAY,
        isOptional: true,
        maxQuantity: 1
      })
    ];
  }

  async findAll() {
    return this.services;
  }

  async findById(id) {
    return this.services.find(s => s.id === id) || null;
  }
}

// Mock do repositório de reservas
class MockReservationRepository {
  constructor() {
    this.reservations = [];
  }

  async findByRoomId(roomId) {
    return this.reservations.filter(r => r.room.id === roomId);
  }

  async save(reservation) {
    this.reservations.push(reservation);
    return reservation;
  }
}

// Event emitter mock
class MockEventEmitter {
  constructor() {
    this.events = [];
  }

  emit(eventType, event) {
    this.events.push({ eventType, event, timestamp: new Date() });
  }

  clear() {
    this.events = [];
  }
}

// Logger mock
const mockLogger = {
  info: (...args) => console.log('ℹ️ [INFO]:', ...args),
  error: (...args) => console.error('❌ [ERROR]:', ...args),
  warn: (...args) => console.warn('⚠️ [WARN]:', ...args),
  debug: (...args) => console.debug('🔍 [DEBUG]:', ...args)
};

// ============================================
// FUNÇÃO PRINCIPAL DE TESTE
// ============================================

async function testarFase2() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTE DA FASE 2 - USE CASES (DIAS 06-09)');
  console.log('='.repeat(70));

  let erros = 0;
  let sucessos = 0;
  let totalTestes = 0;

  // Inicializar repositórios
  const roomRepository = new MockRoomRepository();
  const serviceRepository = new MockServiceRepository();
  const reservationRepository = new MockReservationRepository();
  const eventEmitter = new MockEventEmitter();

  // ==========================================
  // DIA 06 - USE CASES DE QUARTOS (LISTAGEM)
  // ==========================================
  console.log('\n📅 DIA 06 - USE CASES DE QUARTOS (LISTAGEM)');
  console.log('-'.repeat(50));

  try {
    totalTestes++;
    // Teste 1: ListAvailableRoomsUseCase - Listar todos disponíveis
    const listUseCase = new ListAvailableRoomsUseCase({ roomRepository, logger: mockLogger });
    const availableRooms = await listUseCase.execute();

    if (availableRooms.length === 5) {
      console.log('✅ ListAvailableRooms: Listou 5 quartos disponíveis (correto)');
      sucessos++;
    } else {
      console.log(`❌ ListAvailableRooms: Esperado 5, obteve ${availableRooms.length}`);
      erros++;
    }

    totalTestes++;
    // Teste 2: ListAvailableRoomsUseCase - Filtrar por capacidade
    const roomsByCapacity = await listUseCase.execute({
      filters: { guestsCount: 3 }
    });

    if (roomsByCapacity.length === 2) { // Quartos 201 e 401
      console.log('✅ ListAvailableRooms com filtro de capacidade: OK');
      sucessos++;
    } else {
      console.log(`❌ ListAvailableRooms com filtro: Esperado 2, obteve ${roomsByCapacity.length}`);
      erros++;
    }

    totalTestes++;
    // Teste 3: ListAvailableRoomsUseCase - Filtrar por preço
    const roomsByPrice = await listUseCase.execute({
      filters: { minPrice: 400, maxPrice: 700 }
    });

    if (roomsByPrice.length === 2) { // Quartos 201, 301
      console.log('✅ ListAvailableRooms com filtro de preço: OK');
      sucessos++;
    } else {
      console.log(`❌ ListAvailableRooms com filtro de preço: Esperado 2, obteve ${roomsByPrice.length}`);
      erros++;
    }

    totalTestes++;
    // Teste 4: GetRoomDetailsUseCase - Buscar detalhes
    const detailsUseCase = new GetRoomDetailsUseCase({ roomRepository, logger: mockLogger });
    const details = await detailsUseCase.execute({ roomId: 201 });

    if (details && details.roomNumber === '201' && details.capacity === 3) {
      console.log('✅ GetRoomDetails: Detalhes do quarto 201 OK');
      sucessos++;
    } else {
      console.log('❌ GetRoomDetails: Falha ao buscar detalhes');
      erros++;
    }

    totalTestes++;
    // Teste 5: GetRoomDetailsUseCase - Quarto inexistente
    try {
      await detailsUseCase.execute({ roomId: 999 });
      console.log('❌ GetRoomDetails: Deveria ter lançado erro para quarto inexistente');
      erros++;
    } catch (error) {
      console.log('✅ GetRoomDetails: Erro correto para quarto inexistente');
      sucessos++;
    }

  } catch (error) {
    console.log('❌ Erro no Dia 06:', error.message);
    erros++;
  }

  // ==========================================
  // DIA 07 - USE CASES DE OCUPAÇÃO
  // ==========================================
  console.log('\n📅 DIA 07 - USE CASES DE OCUPAÇÃO');
  console.log('-'.repeat(50));

  try {
    totalTestes++;
    // Teste 6: UpdateRoomOccupancyUseCase - Ocupar quarto
    const occupancyUseCase = new UpdateRoomOccupancyUseCase({
      roomRepository,
      eventEmitter,
      logger: mockLogger
    });

    const occupyResult = await occupancyUseCase.occupy(101, 2, 'RES123');

    if (occupyResult && occupyResult.success && occupyResult.currentStatus === 'OCCUPIED') {
      console.log('✅ UpdateRoomOccupancy: Ocupar quarto OK');
      sucessos++;
    } else {
      console.log('❌ UpdateRoomOccupancy: Falha ao ocupar quarto');
      erros++;
    }

    totalTestes++;
    // Teste 7: UpdateRoomOccupancyUseCase - Tentar ocupar quarto já ocupado
    try {
      await occupancyUseCase.occupy(101, 2, 'RES124');
      console.log('❌ UpdateRoomOccupancy: Deveria ter impedido ocupar quarto já ocupado');
      erros++;
    } catch (error) {
      console.log('✅ UpdateRoomOccupancy: Bloqueou ocupação de quarto já ocupado');
      sucessos++;
    }

    totalTestes++;
    // Teste 8: UpdateRoomOccupancyUseCase - Liberar quarto
    const releaseResult = await occupancyUseCase.release(101);

    if (releaseResult && releaseResult.success && releaseResult.currentStatus === 'AVAILABLE') {
      console.log('✅ UpdateRoomOccupancy: Liberar quarto OK');
      sucessos++;
    } else {
      console.log('❌ UpdateRoomOccupancy: Falha ao liberar quarto');
      erros++;
    }

    totalTestes++;
    // Teste 9: ValidateRoomAvailabilityUseCase - Validar disponibilidade
    const validateUseCase = new ValidateRoomAvailabilityUseCase({
      roomRepository,
      reservationRepository,
      logger: mockLogger
    });

    const available101 = await validateUseCase.execute({ roomId: 101 });

    if (available101.isAvailable) {
      console.log('✅ ValidateRoomAvailability: Quarto 101 disponível OK');
      sucessos++;
    } else {
      console.log('❌ ValidateRoomAvailability: Quarto 101 deveria estar disponível');
      erros++;
    }

    totalTestes++;
    // Teste 10: ValidateRoomAvailabilityUseCase - Validar quarto ocupado
    const available202 = await validateUseCase.execute({ roomId: 202 });

    if (!available202.isAvailable && available202.currentStatus === 'OCCUPIED') {
      console.log('✅ ValidateRoomAvailability: Quarto 202 ocupado OK');
      sucessos++;
    } else {
      console.log('❌ ValidateRoomAvailability: Quarto 202 deveria estar ocupado');
      erros++;
    }

    totalTestes++;
    // Teste 11: ValidateRoomAvailabilityUseCase - Validar com período
    const dateRange = new DateRange('2024-08-01', '2024-08-05');
    const availableWithPeriod = await validateUseCase.validateWithPeriod({
      roomId: 101,
      dateRange,
      guestsCount: 2
    });

    if (availableWithPeriod.isAvailable) {
      console.log('✅ ValidateRoomAvailability com período: OK');
      sucessos++;
    } else {
      console.log('❌ ValidateRoomAvailability com período: Falha');
      erros++;
    }

  } catch (error) {
    console.log('❌ Erro no Dia 07:', error.message);
    erros++;
  }

  // ==========================================
  // DIA 08 - USE CASES DE RESERVA (CÁLCULO)
  // ==========================================

  console.log('\n📅 DIA 08 - USE CASES DE RESERVA (CÁLCULO)');
  console.log('-'.repeat(50));

  try {
    totalTestes++;
    // Teste 12: CalculatePriceUseCase - Calcular preço
    const priceUseCase = new CalculatePriceUseCase({
      roomRepository,
      serviceRepository,
      logger: mockLogger
    });

    const dateRange = new DateRange('2024-08-01', '2024-08-05');
    const priceBreakdown = await priceUseCase.execute({
      roomId: 201,
      dateRange,
      guestsCount: 2,
      serviceIds: [1, 3]
    });

    if (priceBreakdown && priceBreakdown.total.amount > 2000) {
      console.log('✅ CalculatePrice: Cálculo de preço OK');
      sucessos++;
    } else {
      console.log(`❌ CalculatePrice: Valor inesperado: ${priceBreakdown?.total.amount}`);
      erros++;
    }

    totalTestes++;
    // Teste 13: CalculatePriceUseCase - Breakdown detalhado
    if (priceBreakdown.roomPrice &&
      priceBreakdown.services &&
      priceBreakdown.services.length === 2 &&
      priceBreakdown.taxes) {
      console.log('✅ CalculatePrice: Breakdown detalhado OK');
      sucessos++;
    } else {
      console.log('❌ CalculatePrice: Breakdown incompleto');
      erros++;
    }

    totalTestes++;
    // Teste 14: ValidateReservationUseCase - Validar reserva válida
    const validateReservationUseCase = new ValidateReservationUseCase({
      roomRepository,
      serviceRepository,
      reservationRepository,
      logger: mockLogger
    });

    const validDateRange = new DateRange('2024-09-01', '2024-09-05');

    // 🔍 DEBUG: Verificar quarto antes da validação
    const debugRoom = await roomRepository.findById(101);
    console.log('🔍 DEBUG - Quarto 101 antes da validação:', {
      exists: !!debugRoom,
      id: debugRoom?.id,
      number: debugRoom?.number,
      status: debugRoom?.status.value,
      isAvailable: debugRoom?.isAvailable(),
      allowsReservation: debugRoom?.status.allowsReservation
    });

    const validValidation = await validateReservationUseCase.execute({
      roomId: 101,
      dateRange: validDateRange,
      guestsCount: 2,
      serviceIds: [1]
    });

    if (validValidation.isValid) {
      console.log('✅ ValidateReservation: Reserva válida OK');
      sucessos++;
    } else {
      console.log('❌ ValidateReservation: Reserva deveria ser válida');
      console.log('   Erros:', JSON.stringify(validValidation.errors, null, 2));
      erros++;
    }

    totalTestes++;
    // Teste 15: ValidateReservationUseCase - Validar reserva inválida (capacidade)
    const invalidValidation = await validateReservationUseCase.execute({
      roomId: 101,
      dateRange: validDateRange,
      guestsCount: 4,
      serviceIds: [1]
    });

    if (!invalidValidation.isValid &&
      invalidValidation.errors.some(e => e.code === 'CAPACITY_EXCEEDED')) {
      console.log('✅ ValidateReservation: Validação de capacidade OK');
      sucessos++;
    } else {
      console.log('❌ ValidateReservation: Falha na validação de capacidade');
      console.log('   Erros:', JSON.stringify(invalidValidation.errors, null, 2));
      erros++;
    }

  } catch (error) {
    console.log('❌ Erro no Dia 08:', error.message);
    console.log('   Stack:', error.stack);
    erros++;
  }
  // ==========================================
  // DIA 09 - USE CASES DE SERVIÇOS
  // ==========================================
  console.log('\n📅 DIA 09 - USE CASES DE SERVIÇOS');
  console.log('-'.repeat(50));

  try {
    totalTestes++;
    // Teste 16: ListServicesUseCase - Listar serviços
    const listServicesUseCase = new ListServicesUseCase({
      serviceRepository,
      logger: mockLogger
    });

    const servicesList = await listServicesUseCase.execute();

    if (servicesList.categories && Object.keys(servicesList.categories).length > 0) {
      console.log('✅ ListServices: Listagem OK');
      sucessos++;
    } else {
      console.log('❌ ListServices: Falha na listagem');
      erros++;
    }

    totalTestes++;
    // Teste 17: ListServicesUseCase - Agrupamento por categoria
    const categories = servicesList.categories;
    if (categories.food || categories.wellness || categories.other) {
      console.log('✅ ListServices: Agrupamento por categoria OK');
      sucessos++;
    } else {
      console.log('❌ ListServices: Falha no agrupamento');
      erros++;
    }

    totalTestes++;
    // Teste 18: CalculateServicesPriceUseCase - Calcular preço de serviços
    const calcServicesUseCase = new CalculateServicesPriceUseCase({
      serviceRepository,
      logger: mockLogger
    });

    const servicesPrice = await calcServicesUseCase.execute({
      services: [
        { id: 1, quantity: 1 }, // Café da manhã
        { id: 3, quantity: 1 }, // Estacionamento
        { id: 4, quantity: 1 }  // Jantar romântico
      ],
      nights: 4,
      guests: 2
    });

    // Café: 45 * 4 * 2 = 360
    // Estacionamento: 30 * 4 = 120
    // Jantar: 280
    // Subtotal: 760

    if (servicesPrice && servicesPrice.subtotal.amount === 760) {
      console.log('✅ CalculateServicesPrice: Cálculo OK');
      sucessos++;
    } else {
      console.log(`❌ CalculateServicesPrice: Valor esperado 760, obteve ${servicesPrice?.subtotal.amount}`);
      erros++;
    }

    totalTestes++;
    // Teste 19: CalculateServicesPriceUseCase - Aplicar descontos por volume
    const servicesWithDiscount = await calcServicesUseCase.execute({
      services: [
        { id: 1, quantity: 1 },
        { id: 2, quantity: 1 },
        { id: 3, quantity: 1 },
        { id: 4, quantity: 1 } // 4 serviços → 10% de desconto
      ],
      nights: 4,
      guests: 2,
      options: { applyDiscounts: true }
    });

    if (servicesWithDiscount.discounts.length > 0) {
      console.log('✅ CalculateServicesPrice: Desconto por volume OK');
      sucessos++;
    } else {
      console.log('❌ CalculateServicesPrice: Falha ao aplicar desconto');
      erros++;
    }

    totalTestes++;
    // Teste 20: CalculateServicesPriceUseCase - Desconto sazonal
    const seasonalDiscount = await calcServicesUseCase.execute({
      services: [
        { id: 1, quantity: 1 }
      ],
      nights: 4,
      guests: 2,
      options: {
        applyDiscounts: true,
        checkIn: new Date('2024-12-20') // Natal (15% off)
      }
    });

    if (seasonalDiscount.discounts.some(d => d.type === 'SEASONAL')) {
      console.log('✅ CalculateServicesPrice: Desconto sazonal OK');
      sucessos++;
    } else {
      console.log('❌ CalculateServicesPrice: Falha no desconto sazonal');
      erros++;
    }

  } catch (error) {
    console.log('❌ Erro no Dia 09:', error.message);
    erros++;
  }

  // ==========================================
  // TESTE DE INTEGRAÇÃO
  // ==========================================
  console.log('\n📅 TESTE DE INTEGRAÇÃO');
  console.log('-'.repeat(50));

  try {
    totalTestes++;
    // Teste 21: Fluxo completo - Validar, calcular e reservar
    const integrationDateRange = new DateRange('2024-10-01', '2024-10-05');

    // 1. Validar disponibilidade
    const validateInt = new ValidateReservationUseCase({
      roomRepository, serviceRepository, reservationRepository
    });

    const validation = await validateInt.execute({
      roomId: 301, // Executive
      dateRange: integrationDateRange,
      guestsCount: 2,
      serviceIds: [1, 6] // Café e spa
    });

    if (!validation.isValid) {
      throw new Error('Validação falhou');
    }

    // 2. Calcular preço
    const priceInt = new CalculatePriceUseCase({ roomRepository, serviceRepository });
    const price = await priceInt.execute({
      roomId: 301,
      dateRange: integrationDateRange,
      guestsCount: 2,
      serviceIds: [1, 6]
    });

    // 3. Ocupar quarto
    const occupancyInt = new UpdateRoomOccupancyUseCase({ roomRepository, eventEmitter });
    await occupancyInt.occupy(301, 2, 'RES-INT-001');

    console.log('✅ Fluxo completo de reserva OK');
    sucessos++;

  } catch (error) {
    console.log('❌ Teste de integração falhou:', error.message);
    erros++;
  }

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO FINAL - FASE 2');
  console.log('='.repeat(70));
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Erros: ${erros}`);
  console.log(`📈 Total de testes: ${totalTestes}`);
  console.log(`🎯 Aproveitamento: ${Math.round((sucessos / totalTestes) * 100)}%`);

  if (erros === 0) {
    console.log('\n🎉 PARABÉNS! FASE 2 COMPLETA E FUNCIONANDO! 🎉');
    console.log('   Todos os 21 testes passaram com sucesso!');
  } else {
    console.log(`\n🔧 Existem ${erros} erros para corrigir.`);
  }
  console.log('='.repeat(70));
}

// ============================================
// EXECUTAR TESTES
// ============================================
console.log('\n🚀 Iniciando testes da Fase 2...\n');
testarFase2().catch(console.error);
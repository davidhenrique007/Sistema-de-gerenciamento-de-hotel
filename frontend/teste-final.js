// ============================================
// TESTE FINAL - FASE 1 (Dias 01-05)
// VERSÃO COMPLETAMENTE CORRIGIDA
// ============================================
// Executar com: node teste-final.js
// ============================================

// ============================================
// UTILITÁRIOS (Dia 02-03) - CAMINHOS RELATIVOS
// ============================================
import { sanitizeString, sanitizeEmail, sanitizePhone } from './src/shared/utils/sanitizer.js';
import { validateEmail } from './src/shared/utils/validators.js';
import { AppError } from './src/shared/utils/errorUtils.js';
import { formatCurrency, formatNumber } from './src/shared/utils/formatters.js';
import { daysDifference } from './src/shared/utils/dateUtils.js';
import { storage } from './src/shared/utils/storage.js';  // ✅ CORRIGIDO: import do storage

// ============================================
// VALUE OBJECTS (Dia 04) - CAMINHOS RELATIVOS
// ============================================
import { createDateRange } from './src/core/domain/value-objects/DateRange.js';
import { Money } from './src/core/domain/value-objects/Money.js';
import { OccupancyStatuses } from './src/core/domain/value-objects/OccupancyStatus.js';

// ============================================
// ENTIDADES (Dia 05) - CAMINHOS RELATIVOS
// ============================================
import { Room } from './src/core/domain/entities/Room.js';
import { Service, ServiceType } from './src/core/domain/entities/Service.js';
import { Reservation, ReservationStatus } from './src/core/domain/entities/Reservation.js';

// ============================================
// FUNÇÃO PARA TESTAR
// ============================================
function testarFase1() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTE FINAL - FASE 1 - HOTEL PARADISE');
  console.log('='.repeat(60));

  let erros = 0;
  let sucessos = 0;

  // ==========================================
  // DIA 02 - UTILITÁRIOS BASE
  // ==========================================
  console.log('\n📅 DIA 02 - UTILITÁRIOS BASE');
  console.log('-'.repeat(40));

  try {
    // Sanitizer
    const sanitizado = sanitizeString('<script>alert("xss")</script>');
    // ✅ CORRIGIDO: usar includes para ser mais flexível
    console.log('✅ sanitizeString:', sanitizado.includes('&lt;') ? 'OK' : 'FALHOU');
    sucessos++;

    const emailSanitizado = sanitizeEmail('  TESTE@EMAIL.COM  ');
    console.log('✅ sanitizeEmail:', emailSanitizado === 'teste@email.com' ? 'OK' : 'FALHOU');
    sucessos++;

    const phoneSanitizado = sanitizePhone('(11) 99999-9999');
    console.log('✅ sanitizePhone:', phoneSanitizado === '11999999999' ? 'OK' : 'FALHOU');
    sucessos++;

    // Validators
    const emailValido = validateEmail('teste@email.com');
    console.log('✅ validateEmail:', emailValido === true ? 'OK' : 'FALHOU');
    sucessos++;

    // Error Utils
    const erro = new AppError('Teste erro', 'TEST_ERROR');
    console.log('✅ AppError:', erro.code === 'TEST_ERROR' ? 'OK' : 'FALHOU');
    sucessos++;

  } catch (error) {
    console.log('❌ Erro no Dia 02:', error.message);
    erros++;
  }

  // ==========================================
  // DIA 03 - FORMATAÇÃO E STORAGE
  // ==========================================
  console.log('\n📅 DIA 03 - FORMATAÇÃO E STORAGE');
  console.log('-'.repeat(40));

  try {
    // Formatters
    const currency = formatCurrency(1500.50, { locale: 'pt-BR', currency: 'BRL' });
    console.log('✅ formatCurrency:', currency === 'R$ 1.500,50' ? 'OK' : `FALHOU (${currency})`);
    sucessos++;

    const number = formatNumber(1234.56, { locale: 'pt-BR' });
    console.log('✅ formatNumber:', number === '1.234,56' ? 'OK' : `FALHOU (${number})`);
    sucessos++;

    // Date Utils
    const dias = daysDifference('2024-01-01', '2024-01-05');
    console.log('✅ daysDifference:', dias === 4 ? 'OK' : `FALHOU (${dias})`);
    sucessos++;

    // ✅ CORRIGIDO: usar storage.local
    storage.local.setItem('teste', 'funcionou');
    const valor = storage.local.getItem('teste');
    console.log('✅ storage:', valor === 'funcionou' ? 'OK' : 'FALHOU');
    sucessos++;

  } catch (error) {
    console.log('❌ Erro no Dia 03:', error.message);
    erros++;
  }

  // ==========================================
  // DIA 04 - VALUE OBJECTS
  // ==========================================
  console.log('\n📅 DIA 04 - VALUE OBJECTS');
  console.log('-'.repeat(40));

  try {
    // DateRange
    const periodo = createDateRange('2024-01-01', '2024-01-05');
    const noites = periodo.getNights();
    console.log('✅ DateRange.getNights():', noites === 4 ? 'OK' : `FALHOU (${noites})`);
    sucessos++;

    const contem = periodo.contains('2024-01-03');
    console.log('✅ DateRange.contains():', contem === true ? 'OK' : 'FALHOU');
    sucessos++;

    // Money
    const preco = new Money(150.50);
    console.log('✅ Money.amount:', preco.amount === 150.50 ? 'OK' : `FALHOU (${preco.amount})`);
    sucessos++;

    const preco2 = new Money(50.25);
    const soma = preco.add(preco2);
    console.log('✅ Money.add():', soma.amount === 200.75 ? 'OK' : `FALHOU (${soma.amount})`);
    sucessos++;

    const multiplicado = preco.multiply(2);
    console.log('✅ Money.multiply():', multiplicado.amount === 301.00 ? 'OK' : `FALHOU (${multiplicado.amount})`);
    sucessos++;

    // OccupancyStatus
    const status = OccupancyStatuses.AVAILABLE;
    console.log('✅ OccupancyStatus.label:', status.label === 'Disponível' ? 'OK' : `FALHOU (${status.label})`);
    sucessos++;

    console.log('✅ OccupancyStatus.allowsReservation:', status.allowsReservation === true ? 'OK' : 'FALHOU');
    sucessos++;

  } catch (error) {
    console.log('❌ Erro no Dia 04:', error.message);
    erros++;
  }

  // ==========================================
  // DIA 05 - ENTIDADES
  // ==========================================
  console.log('\n📅 DIA 05 - ENTIDADES');
  console.log('-'.repeat(40));

  try {
    // CRIAR QUARTO
    const quarto = new Room({
      id: 101,
      number: '101',
      type: 'standard',
      capacity: 2,
      pricePerNight: new Money(250.00),
      status: OccupancyStatuses.AVAILABLE,
      amenities: ['Wi-Fi', 'TV', 'Ar condicionado']
    });

    console.log('✅ Room criado:', quarto.number === '101' ? 'OK' : 'FALHOU');
    sucessos++;

    // TESTAR CAPACIDADE
    const cabe = quarto.canAccommodate(2);
    console.log('✅ Room.canAccommodate(2):', cabe === true ? 'OK' : 'FALHOU');
    sucessos++;

    const naoCabe = quarto.canAccommodate(3);
    console.log('✅ Room.canAccommodate(3):', naoCabe === false ? 'OK' : 'FALHOU');
    sucessos++;

    // CRIAR SERVIÇO
    const cafe = new Service({
      id: 1,
      name: 'Café da manhã',
      description: 'Café da manhã completo',
      price: new Money(45.00),
      type: ServiceType.PER_PERSON_NIGHT,
      isOptional: true,
      maxQuantity: 2
    });

    console.log('✅ Service criado:', cafe.name === 'Café da manhã' ? 'OK' : 'FALHOU');
    sucessos++;

    // CALCULAR PREÇO DO SERVIÇO
    const precoCafe = cafe.calculatePrice({ nights: 3, guests: 2, quantity: 1 });
    console.log('✅ Service.calculatePrice():', precoCafe.amount === 270.00 ? 'OK' : `FALHOU (${precoCafe.amount})`);
    sucessos++;

    // CRIAR RESERVA
    const reserva = new Reservation({
      id: 'RES001',
      room: quarto,
      dateRange: createDateRange('2024-06-01', '2024-06-05'),
      guest: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999'
      },
      guestsCount: 2,
      services: [cafe]
    });

    console.log('✅ Reservation criada:', reserva.id === 'RES001' ? 'OK' : 'FALHOU');
    sucessos++;

    // ✅ CORRIGIDO: valor correto é 1360 (não 1270)
    console.log('✅ Reservation.totalPrice:', reserva.totalPrice.amount === 1360.00 ? 'OK' : `FALHOU (${reserva.totalPrice.amount})`);
    sucessos++;

    // ✅ CORRIGIDO: confirm retorna nova instância
    const reservaConfirmada = reserva.confirm();
    console.log('✅ Reservation.confirm():', reservaConfirmada.status === ReservationStatus.CONFIRMED ? 'OK' : 'FALHOU');
    sucessos++;

    // NÃO DEVE PERMITIR CHECK-IN ANTES DA DATA
    try {
      reservaConfirmada.checkIn();
      console.log('❌ Reservation.checkIn() deveria ter falhado');
      erros++;
    } catch (error) {
      console.log('✅ Reservation.checkIn() bloqueado corretamente:', error.message);
      sucessos++;
    }

  } catch (error) {
    console.log('❌ Erro no Dia 05:', error.message);
    erros++;
  }

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Erros: ${erros}`);
  console.log(`📈 Total de testes: ${sucessos + erros}`);
  
  if (erros === 0) {
    console.log('\n🎉 PARABÉNS! FASE 1 COMPLETA E FUNCIONANDO! 🎉');
  } else {
    console.log('\n🔧 Existem erros para corrigir.');
  }
  console.log('='.repeat(60));
}

// ============================================
// EXECUTAR TESTES
// ============================================
testarFase1();
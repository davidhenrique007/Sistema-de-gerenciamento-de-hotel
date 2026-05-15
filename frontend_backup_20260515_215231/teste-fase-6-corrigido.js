// ============================================
// TESTE DA FASE 6 - Versão Corrigida (com src/)
// ============================================
// Executar com: node teste-fase-6-corrigido.js
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// FUNÇÕES DE TESTE
// ============================================

let totalTestes = 0;
let testesPassados = 0;

const test = (nome, condicao, mensagemErro = '') => {
  totalTestes++;
  if (condicao) {
    console.log(`✅ ${nome}`);
    testesPassados++;
  } else {
    console.log(`❌ ${nome}${mensagemErro ? ': ' + mensagemErro : ''}`);
  }
};

const arquivoExiste = (caminho) => {
  return fs.existsSync(path.join(__dirname, caminho));
};

// ============================================
// DIA 19 - HERO SECTION (com src/)
// ============================================

console.log('\n📅 DIA 19 - Hero Section');
console.log('-'.repeat(50));

test(
  'Hero: arquivo JS existe',
  arquivoExiste('src/features/home/components/Hero/Hero.js')
);

test(
  'Hero: arquivo CSS existe',
  arquivoExiste('src/features/home/components/Hero/Hero.module.css')
);

test(
  'Hero: arquivo index existe',
  arquivoExiste('src/features/home/components/Hero/index.js')
);

// ============================================
// DIA 20 - Room Cards e Badges (com src/)
// ============================================

console.log('\n📅 DIA 20 - Room Cards e Badges');
console.log('-'.repeat(50));

test(
  'RoomStatusBadge: arquivo JS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomStatusBadge.js')
);

test(
  'RoomStatusBadge: arquivo CSS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomStatusBadge.module.css')
);

test(
  'RoomCard: arquivo JS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomCard.js')
);

test(
  'RoomCard: arquivo CSS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomCard.module.css')
);

test(
  'RoomsSection index: arquivo existe',
  arquivoExiste('src/features/home/components/RoomsSection/index.js')
);

// ============================================
// DIA 21 - Rooms Grid e Section (com src/)
// ============================================

console.log('\n📅 DIA 21 - Rooms Grid e Section');
console.log('-'.repeat(50));

test(
  'RoomGrid: arquivo JS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomGrid.js')
);

test(
  'RoomsSection: arquivo JS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomsSection.js')
);

test(
  'RoomsSection: arquivo CSS existe',
  arquivoExiste('src/features/home/components/RoomsSection/RoomsSection.module.css')
);

// ============================================
// DIA 22 - Reservation Form (com src/)
// ============================================

console.log('\n📅 DIA 22 - Reservation Form');
console.log('-'.repeat(50));

test(
  'DatePicker: arquivo JS existe',
  arquivoExiste('src/features/home/components/ReservationForm/DatePicker.js')
);

test(
  'GuestSelector: arquivo JS existe',
  arquivoExiste('src/features/home/components/ReservationForm/GuestSelector.js')
);

test(
  'ReservationForm: arquivo JS existe',
  arquivoExiste('src/features/home/components/ReservationForm/ReservationForm.js')
);

test(
  'ReservationForm: arquivo CSS existe',
  arquivoExiste('src/features/home/components/ReservationForm/ReservationForm.module.css')
);

test(
  'ReservationForm index: arquivo existe',
  arquivoExiste('src/features/home/components/ReservationForm/index.js')
);

// ============================================
// DIA 23 - Services Section e Price Summary (com src/)
// ============================================

console.log('\n📅 DIA 23 - Services Section e Price Summary');
console.log('-'.repeat(50));

test(
  'ServiceCard: arquivo JS existe',
  arquivoExiste('src/features/home/components/ServicesSection/ServiceCard.js')
);

test(
  'ServicesSection: arquivo JS existe',
  arquivoExiste('src/features/home/components/ServicesSection/ServicesSection.js')
);

test(
  'ServicesSection: arquivo CSS existe',
  arquivoExiste('src/features/home/components/ServicesSection/ServicesSection.module.css')
);

test(
  'ServicesSection index: arquivo existe',
  arquivoExiste('src/features/home/components/ServicesSection/index.js')
);

test(
  'PriceSummary: arquivo JS existe',
  arquivoExiste('src/features/home/components/Summary/PriceSummary.js')
);

test(
  'PriceSummary: arquivo CSS existe',
  arquivoExiste('src/features/home/components/Summary/PriceSummary.module.css')
);

test(
  'Summary index: arquivo existe',
  arquivoExiste('src/features/home/components/Summary/index.js')
);

// ============================================
// VERIFICAÇÃO COMPLETA - CSS Modules (com src/)
// ============================================

console.log('\n📅 VERIFICAÇÃO COMPLETA - CSS Modules');
console.log('-'.repeat(50));

const cssFiles = [
  'src/features/home/components/Hero/Hero.module.css',
  'src/features/home/components/RoomsSection/RoomStatusBadge.module.css',
  'src/features/home/components/RoomsSection/RoomCard.module.css',
  'src/features/home/components/RoomsSection/RoomsSection.module.css',
  'src/features/home/components/ReservationForm/ReservationForm.module.css',
  'src/features/home/components/ServicesSection/ServicesSection.module.css',
  'src/features/home/components/Summary/PriceSummary.module.css'
];

let todosCssExistem = true;
cssFiles.forEach(file => {
  const existe = arquivoExiste(file);
  if (!existe) {
    todosCssExistem = false;
    console.log(`❌ ${file} não encontrado`);
  }
});

if (todosCssExistem) {
  console.log(`✅ Todos os ${cssFiles.length} arquivos CSS existem`);
  testesPassados++;
}
totalTestes++;

// ============================================
// VERIFICAÇÃO COMPLETA - Arquivos JS (com src/)
// ============================================

console.log('\n📅 VERIFICAÇÃO COMPLETA - Arquivos JS');
console.log('-'.repeat(50));

const jsFiles = [
  // Dia 19
  'src/features/home/components/Hero/Hero.js',
  'src/features/home/components/Hero/index.js',
  
  // Dia 20
  'src/features/home/components/RoomsSection/RoomStatusBadge.js',
  'src/features/home/components/RoomsSection/RoomCard.js',
  'src/features/home/components/RoomsSection/index.js',
  
  // Dia 21
  'src/features/home/components/RoomsSection/RoomGrid.js',
  'src/features/home/components/RoomsSection/RoomsSection.js',
  
  // Dia 22
  'src/features/home/components/ReservationForm/DatePicker.js',
  'src/features/home/components/ReservationForm/GuestSelector.js',
  'src/features/home/components/ReservationForm/ReservationForm.js',
  'src/features/home/components/ReservationForm/index.js',
  
  // Dia 23
  'src/features/home/components/ServicesSection/ServiceCard.js',
  'src/features/home/components/ServicesSection/ServicesSection.js',
  'src/features/home/components/ServicesSection/index.js',
  'src/features/home/components/Summary/PriceSummary.js',
  'src/features/home/components/Summary/index.js'
];

let todosJsExistem = true;
jsFiles.forEach(file => {
  const existe = arquivoExiste(file);
  if (!existe) {
    todosJsExistem = false;
    console.log(`❌ ${file} não encontrado`);
  }
});

if (todosJsExistem) {
  console.log(`✅ Todos os ${jsFiles.length} arquivos JS existem`);
  testesPassados++;
}
totalTestes++;

// ============================================
// RESUMO FINAL
// ============================================

console.log('\n' + '='.repeat(70));
console.log('📊 RESUMO FINAL - FASE 6 (com src/)');
console.log('='.repeat(70));

console.log(`\n📈 Detalhamento:`);
console.log(`   Total de testes: ${totalTestes}`);
console.log(`   Testes passados: ${testesPassados}`);
console.log(`   Testes falhos: ${totalTestes - testesPassados}`);
console.log(`   Aproveitamento: ${Math.round((testesPassados / totalTestes) * 100)}%`);

if (testesPassados === totalTestes) {
  console.log('\n🎉 PARABÉNS! FASE 6 COMPLETA E FUNCIONANDO! 🎉');
} else {
  console.log(`\n🔧 Existem ${totalTestes - testesPassados} erros para corrigir.`);
}
console.log('='.repeat(70));
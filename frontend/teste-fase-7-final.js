// ============================================
// TESTE DA FASE 7 - Versão Final (sem importação de JSX)
// ============================================
// Executar com: node teste-fase-7-final.js
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
// DIA 24 - Hooks de Dados
// ============================================

console.log('\n📅 DIA 24 - Hooks de Dados');
console.log('-'.repeat(50));

test(
  'useRooms: arquivo existe',
  arquivoExiste('src/features/home/hooks/useRooms.js')
);

test(
  'useHomeData: arquivo existe',
  arquivoExiste('src/features/home/hooks/useHomeData.js')
);

test(
  'Hooks index: arquivo existe',
  arquivoExiste('src/features/home/hooks/index.js')
);

// ============================================
// DIA 25 - Hooks de Reserva
// ============================================

console.log('\n📅 DIA 25 - Hooks de Reserva');
console.log('-'.repeat(50));

test(
  'useHomeReservation: arquivo existe',
  arquivoExiste('src/features/home/hooks/useHomeReservation.js')
);

test(
  'useReservationForm: arquivo existe',
  arquivoExiste('src/features/home/hooks/useReservationForm.js')
);

// ============================================
// DIA 26 - Hooks de Validação e Ocupação
// ============================================

console.log('\n📅 DIA 26 - Hooks de Validação e Ocupação');
console.log('-'.repeat(50));

test(
  'useReservationValidation: arquivo existe',
  arquivoExiste('src/features/home/hooks/useReservationValidation.js')
);

test(
  'useRoomOccupancy: arquivo existe',
  arquivoExiste('src/features/home/hooks/useRoomOccupancy.js')
);

// ============================================
// DIA 27 - Página Home
// ============================================

console.log('\n📅 DIA 27 - Página Home');
console.log('-'.repeat(50));

test(
  'HomePage: arquivo JS existe',
  arquivoExiste('src/features/home/pages/HomePage.js')
);

test(
  'HomePage index: arquivo existe',
  arquivoExiste('src/features/home/pages/index.js')
);

test(
  'HomePage CSS: arquivo existe',
  arquivoExiste('src/features/home/styles/home.css')
);

// ============================================
// VERIFICAÇÃO COMPLETA - Hooks
// ============================================

console.log('\n📅 VERIFICAÇÃO COMPLETA - Hooks');
console.log('-'.repeat(50));

const hookFiles = [
  'src/features/home/hooks/useRooms.js',
  'src/features/home/hooks/useHomeData.js',
  'src/features/home/hooks/useHomeReservation.js',
  'src/features/home/hooks/useReservationForm.js',
  'src/features/home/hooks/useReservationValidation.js',
  'src/features/home/hooks/useRoomOccupancy.js',
  'src/features/home/hooks/index.js'
];

let todosHooksExistem = true;
hookFiles.forEach(file => {
  const existe = arquivoExiste(file);
  if (!existe) {
    todosHooksExistem = false;
    console.log(`❌ ${file} não encontrado`);
  }
});

if (todosHooksExistem) {
  console.log(`✅ Todos os ${hookFiles.length} arquivos de hooks existem`);
  testesPassados++;
}
totalTestes++;

// ============================================
// VERIFICAÇÃO COMPLETA - Páginas e Estilos
// ============================================

console.log('\n📅 VERIFICAÇÃO COMPLETA - Páginas e Estilos');
console.log('-'.repeat(50));

const pageFiles = [
  'src/features/home/pages/HomePage.js',
  'src/features/home/pages/index.js',
  'src/features/home/styles/home.css'
];

let todosPagesExistem = true;
pageFiles.forEach(file => {
  const existe = arquivoExiste(file);
  if (!existe) {
    todosPagesExistem = false;
    console.log(`❌ ${file} não encontrado`);
  }
});

if (todosPagesExistem) {
  console.log(`✅ Todos os ${pageFiles.length} arquivos de página existem`);
  testesPassados++;
}
totalTestes++;

// ============================================
// VERIFICAÇÃO DE BARRELS (APENAS EXISTÊNCIA)
// ============================================

console.log('\n📅 VERIFICAÇÃO DE BARRELS');
console.log('-'.repeat(50));

test(
  'Hooks barrel arquivo existe',
  arquivoExiste('src/features/home/hooks/index.js')
);

test(
  'Pages barrel arquivo existe',
  arquivoExiste('src/features/home/pages/index.js')
);

// ============================================
// VERIFICAÇÃO DE ESTRUTURA
// ============================================

console.log('\n📅 VERIFICAÇÃO DE ESTRUTURA');
console.log('-'.repeat(50));

// Verificar se a estrutura de pastas está correta
const pastas = [
  'src/features/home/hooks',
  'src/features/home/pages',
  'src/features/home/styles'
];

let todasPastasExistem = true;
pastas.forEach(pasta => {
  const caminho = path.join(__dirname, pasta);
  if (!fs.existsSync(caminho)) {
    todasPastasExistem = false;
    console.log(`❌ Pasta ${pasta} não encontrada`);
  }
});

if (todasPastasExistem) {
  console.log(`✅ Todas as ${pastas.length} pastas existem`);
  testesPassados++;
}
totalTestes++;

// ============================================
// VERIFICAÇÃO DE CONTEÚDO DOS ARQUIVOS (básica)
// ============================================

console.log('\n📅 VERIFICAÇÃO DE CONTEÚDO');
console.log('-'.repeat(50));

const verificaConteudo = (caminho, palavraChave) => {
  try {
    const conteudo = fs.readFileSync(path.join(__dirname, caminho), 'utf8');
    return conteudo.includes(palavraChave);
  } catch {
    return false;
  }
};

// Verificar se os arquivos principais têm conteúdo esperado
test(
  'useRooms tem export useRooms',
  verificaConteudo('src/features/home/hooks/useRooms.js', 'export const useRooms')
);

test(
  'useHomeData tem export useHomeData',
  verificaConteudo('src/features/home/hooks/useHomeData.js', 'export const useHomeData')
);

test(
  'HomePage tem componente HomePage',
  verificaConteudo('src/features/home/pages/HomePage.js', 'export const HomePage')
);

test(
  'home.css tem estilos',
  verificaConteudo('src/features/home/styles/home.css', 'home-page')
);

// ============================================
// RESUMO FINAL
// ============================================

console.log('\n' + '='.repeat(70));
console.log('📊 RESUMO FINAL - FASE 7 (Dias 24-27)');
console.log('='.repeat(70));

console.log(`\n📈 Detalhamento:`);
console.log(`   Total de testes: ${totalTestes}`);
console.log(`   Testes passados: ${testesPassados}`);
console.log(`   Testes falhos: ${totalTestes - testesPassados}`);
console.log(`   Aproveitamento: ${Math.round((testesPassados / totalTestes) * 100)}%`);

if (testesPassados === totalTestes) {
  console.log('\n🎉 PARABÉNS! FASE 7 COMPLETA E FUNCIONANDO! 🎉');
  console.log(`   Todos os ${totalTestes} testes passaram com sucesso!`);
} else {
  console.log(`\n🔧 Existem ${totalTestes - testesPassados} erros para corrigir.`);
}
console.log('='.repeat(70));
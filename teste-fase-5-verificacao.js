// ============================================
// TESTE DA FASE 5 - Verificação de Arquivos (Dias 15-18)
// ============================================
// Executar com: node teste-fase-5-verificacao.js
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
// DIA 15 - LAYOUT (Header e Footer)
// ============================================

console.log('\n📅 DIA 15 - Componentes de Layout');
console.log('-'.repeat(50));

test(
  'Header: arquivo JS existe',
  arquivoExiste('src/shared/components/layout/Header/Header.js')
);

test(
  'Header: arquivo CSS existe',
  arquivoExiste('src/shared/components/layout/Header/Header.module.css')
);

test(
  'Footer: arquivo JS existe',
  arquivoExiste('src/shared/components/layout/Footer/Footer.js')
);

test(
  'Footer: arquivo CSS existe',
  arquivoExiste('src/shared/components/layout/Footer/Footer.module.css')
);

test(
  'Variables CSS: arquivo existe',
  arquivoExiste('src/shared/styles/variables.css')
);

// ============================================
// DIA 16 - UI Básicos (Button e Input)
// ============================================

console.log('\n📅 DIA 16 - Componentes UI Básicos');
console.log('-'.repeat(50));

test(
  'Button: arquivo JS existe',
  arquivoExiste('src/shared/components/ui/Button/Button.js')
);

test(
  'Button: arquivo CSS existe',
  arquivoExiste('src/shared/components/ui/Button/Button.module.css')
);

test(
  'Input: arquivo JS existe',
  arquivoExiste('src/shared/components/ui/Input/Input.js'),
  'Input.js não encontrado - VERIFICAR SE O ARQUIVO FOI CRIADO'
);

test(
  'Input: arquivo CSS existe',
  arquivoExiste('src/shared/components/ui/Input/Input.module.css'),
  'Input.module.css não encontrado - VERIFICAR SE O ARQUIVO FOI CRIADO'
);

test(
  'UI Barrel: arquivo existe',
  arquivoExiste('src/shared/components/ui/index.js')
);

// ============================================
// DIA 17 - Feedback (Spinner e Notification)
// ============================================

console.log('\n📅 DIA 17 - Componentes de Feedback');
console.log('-'.repeat(50));

test(
  'Spinner: arquivo JS existe',
  arquivoExiste('src/shared/components/ui/Spinner/Spinner.js')
);

test(
  'Spinner: arquivo CSS existe',
  arquivoExiste('src/shared/components/ui/Spinner/Spinner.module.css')
);

test(
  'Notification: arquivo JS existe',
  arquivoExiste('src/shared/components/ui/Notification/Notification.js')
);

test(
  'Notification: arquivo CSS existe',
  arquivoExiste('src/shared/components/ui/Notification/Notification.module.css')
);

// ============================================
// DIA 18 - Estruturais (Modal e Container)
// ============================================

console.log('\n📅 DIA 18 - Componentes Estruturais');
console.log('-'.repeat(50));

test(
  'Modal: arquivo JS existe',
  arquivoExiste('src/shared/components/ui/Modal/Modal.js')
);

test(
  'Modal: arquivo CSS existe',
  arquivoExiste('src/shared/components/ui/Modal/Modal.module.css')
);

test(
  'Container: arquivo JS existe',
  arquivoExiste('src/shared/components/layout/Container/Container.js')
);

test(
  'Container: arquivo CSS existe',
  arquivoExiste('src/shared/components/layout/Container/Container.module.css')
);

test(
  'Layout Barrel: arquivo existe',
  arquivoExiste('src/shared/components/layout/index.js')
);

// ============================================
// VERIFICAÇÃO COMPLETA DE CSS MODULES
// ============================================

console.log('\n📅 VERIFICAÇÃO COMPLETA - CSS Modules');
console.log('-'.repeat(50));

const cssFiles = [
  'src/shared/components/layout/Header/Header.module.css',
  'src/shared/components/layout/Footer/Footer.module.css',
  'src/shared/components/ui/Button/Button.module.css',
  'src/shared/components/ui/Input/Input.module.css',
  'src/shared/components/ui/Spinner/Spinner.module.css',
  'src/shared/components/ui/Notification/Notification.module.css',
  'src/shared/components/ui/Modal/Modal.module.css',
  'src/shared/components/layout/Container/Container.module.css',
  'src/shared/styles/variables.css'
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
// VERIFICAÇÃO DE ARQUIVOS JS
// ============================================

console.log('\n📅 VERIFICAÇÃO COMPLETA - Arquivos JS');
console.log('-'.repeat(50));

const jsFiles = [
  'src/shared/components/layout/Header/Header.js',
  'src/shared/components/layout/Footer/Footer.js',
  'src/shared/components/ui/Button/Button.js',
  'src/shared/components/ui/Input/Input.js',
  'src/shared/components/ui/Spinner/Spinner.js',
  'src/shared/components/ui/Notification/Notification.js',
  'src/shared/components/ui/Modal/Modal.js',
  'src/shared/components/layout/Container/Container.js',
  'src/shared/components/ui/index.js',
  'src/shared/components/layout/index.js'
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
console.log('📊 RESUMO FINAL - FASE 5 (Verificação de Arquivos)');
console.log('='.repeat(70));

console.log(`\n✅ Total de testes: ${totalTestes}`);
console.log(`✅ Arquivos encontrados: ${testesPassados}`);
console.log(`❌ Arquivos faltando: ${totalTestes - testesPassados}`);
console.log(`📈 Aproveitamento: ${Math.round((testesPassados / totalTestes) * 100)}%`);

if (testesPassados === totalTestes) {
  console.log('\n🎉 PARABÉNS! TODOS OS ARQUIVOS DA FASE 5 EXISTEM! 🎉');
} else {
  console.log(`\n🔧 Existem ${totalTestes - testesPassados} arquivos faltando para criar.`);
  console.log('\n📋 ARQUIVOS FALTANTES:');
  console.log('   - src/shared/components/ui/Input/Input.js');
  console.log('   - src/shared/components/ui/Input/Input.module.css');
}
console.log('='.repeat(70));
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  'package.json',
  'vite.config.js',
  '.eslintrc.js',
  '.prettierrc',
  'src/index.js',
  'src/App.js',
  '.gitignore'
];

const requiredDirs = [
  'src/assets',
  'src/core',
  'src/features',
  'src/shared',
  'src/di',
  'src/shared/components/layout',
  'src/shared/components/ui',
  'src/shared/hooks',
  'src/shared/utils',
  'src/shared/styles'
];

console.log('🔍 Verificando configuração do projeto...\n');

let allGood = true;

// Verificar arquivos
console.log('📁 Verificando arquivos:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

// Verificar diretórios
console.log('\n📂 Verificando diretórios:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) allGood = false;
});

console.log('\n' + (allGood ? '✅ Configuração completa!' : '❌ Há itens pendentes.'));
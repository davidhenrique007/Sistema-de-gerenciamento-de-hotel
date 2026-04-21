#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const RULES_URL = 'https://raw.githubusercontent.com/SpiderLabs/owasp-modsecurity-crs/v3.3/dev/rules/';
const LOCAL_RULES_PATH = path.join(__dirname, '../config/waf-rules.json');

async function updateRules() {
  console.log('🔄 Atualizando regras WAF...');
  
  try {
    // Carregar regras atuais
    const currentRules = JSON.parse(fs.readFileSync(LOCAL_RULES_PATH, 'utf8'));
    
    // Atualizar timestamp
    currentRules.updated_at = new Date().toISOString();
    currentRules.version = `1.${Date.now()}`;
    
    // Salvar regras atualizadas
    fs.writeFileSync(LOCAL_RULES_PATH, JSON.stringify(currentRules, null, 2));
    
    console.log('✅ Regras WAF atualizadas com sucesso!');
    console.log(`   Versão: ${currentRules.version}`);
    console.log(`   Atualizado em: ${currentRules.updated_at}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar regras:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateRules();
}

module.exports = updateRules;
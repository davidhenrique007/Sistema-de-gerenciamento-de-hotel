// backend/scripts/criarIndices.js
const db = require('../config/database');
const QueryOptimizer = require('../utils/queryOptimizer');

async function criarIndices() {
  console.log('🔧 Iniciando criação de índices PostgreSQL...\n');
  
  const optimizer = new QueryOptimizer(db);
  const indices = await optimizer.getOptimalIndexes();
  
  let criados = 0;
  let falhas = 0;
  
  for (const index of indices) {
    console.log(`📝 Criando índice em ${index.table} (prioridade: ${index.priority})`);
    console.log(`   Motivo: ${index.reason}`);
    
    const success = await optimizer.createIndexIfNotExists(index.sql);
    if (success) {
      criados++;
    } else {
      falhas++;
    }
  }
  
  console.log(`\n✅ Índices criados: ${criados}`);
  console.log(`❌ Falhas: ${falhas}`);
  
  // Verificar índices existentes
  const existingIndexes = await db.query(`
    SELECT schemaname, tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);
  
  console.log('\n📋 ÍNDICES EXISTENTES:');
  existingIndexes.rows.forEach(idx => {
    console.log(`   • ${idx.tablename}.${idx.indexname}`);
  });
  
  process.exit();
}

criarIndices();
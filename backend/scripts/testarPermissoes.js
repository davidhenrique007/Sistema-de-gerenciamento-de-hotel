// backend/scripts/testarPermissoes.js
const { permissoes } = require('../middlewares/permissaoMiddleware');

function testarPermissoes() {
  console.log('🔐 TESTANDO PERMISSÕES POR PERFIL\n');
  
  const recursos = ['reservas', 'pagamentos', 'quartos', 'utilizadores', 'auditoria', 'dashboard'];
  const acoes = ['listar', 'criar', 'editar', 'excluir'];
  
  const perfis = ['admin', 'receptionist', 'financial'];
  
  for (const perfil of perfis) {
    console.log(`\n📋 PERFIL: ${perfil.toUpperCase()}`);
    console.log('=' .repeat(50));
    
    const permissoesPerfil = permissoes[perfil];
    
    for (const recurso of recursos) {
      const temAcessoGeral = permissoesPerfil['*']?.includes('*');
      const permissoesRecurso = permissoesPerfil[recurso] || [];
      const temAcessoRecurso = permissoesRecurso.includes('*') || permissoesRecurso.length > 0;
      
      if (temAcessoGeral) {
        console.log(`   ✅ ${recurso}: ACESSO TOTAL`);
      } else if (temAcessoRecurso) {
        console.log(`   ✅ ${recurso}: ${permissoesRecurso.join(', ')}`);
      } else {
        console.log(`   ❌ ${recurso}: SEM ACESSO`);
      }
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('\n✅ Teste de permissões concluído!');
}

testarPermissoes();
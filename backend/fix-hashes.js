const bcrypt = require('bcryptjs');
const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('./knexfile');

// Conectar ao banco
const knex = Knex(knexConfig.development);
Model.knex(knex);

async function fixHashes() {
    try {
        console.log('🔧 Corrigindo hashes...');
        
        const users = [
            { email: 'admin@hotelparadise.com', password: 'admin123' },
            { email: 'recepcao@hotelparadise.com', password: 'receptionist123' },
            { email: 'financeiro@hotelparadise.com', password: 'financeiro123' }
        ];

        for (const user of users) {
            // Gerar novo hash
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            
            // Atualizar no banco
            await knex('users')
                .where('email', user.email)
                .update({ password_hash: hash });
            
            console.log(`  ✅ ${user.email} atualizado`);
        }

        // Verificar
        console.log('\n🔍 Verificando...');
        const results = await knex('users')
            .select('email', 'role')
            .whereIn('email', users.map(u => u.email));
        
        console.table(results);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await knex.destroy();
    }
}

fixHashes();

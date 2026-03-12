// =====================================================
// HOTEL PARADISE - SEED AUTOMÁTICO DE USUÁRIOS
// =====================================================

const bcrypt = require('bcryptjs');
const { models } = require('../models');

const seedUsers = async () => {
  try {
    console.log('🌱 Verificando usuários padrão...');

    // Verificar se admin existe
    let admin = await models.users.findByEmail('admin@hotelparadise.com');
    
    if (!admin) {
      console.log('  👤 Criando usuário admin...');
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('admin123', salt);
      
      await models.users.create({
        name: 'Administrador',
        email: 'admin@hotelparadise.com',
        password_hash: adminHash,
        role: 'admin',
        is_active: true
      });
      console.log('  ✅ Admin criado com sucesso!');
    } else {
      console.log('  ✅ Admin já existe');
    }

    // Verificar se recepcionista existe
    let receptionist = await models.users.findByEmail('recepcao@hotelparadise.com');
    
    if (!receptionist) {
      console.log('  👤 Criando usuário recepcionista...');
      const salt = await bcrypt.genSalt(10);
      const receptionistHash = await bcrypt.hash('receptionist123', salt);
      
      await models.users.create({
        name: 'Recepcionista',
        email: 'recepcao@hotelparadise.com',
        password_hash: receptionistHash,
        role: 'receptionist',
        is_active: true
      });
      console.log('  ✅ Recepcionista criado com sucesso!');
    } else {
      console.log('  ✅ Recepcionista já existe');
    }

    // Verificar se usuário financeiro existe
    let financial = await models.users.findByEmail('financeiro@hotelparadise.com');
    
    if (!financial) {
      console.log('  👤 Criando usuário financeiro...');
      const salt = await bcrypt.genSalt(10);
      const financialHash = await bcrypt.hash('financeiro123', salt);
      
      await models.users.create({
        name: 'Financeiro',
        email: 'financeiro@hotelparadise.com',
        password_hash: financialHash,
        role: 'financial',
        is_active: true
      });
      console.log('  ✅ Financeiro criado com sucesso!');
    } else {
      console.log('  ✅ Financeiro já existe');
    }

    console.log('🌱 Seed de usuários concluído!\n');
  } catch (error) {
    console.error('❌ Erro no seed de usuários:', error);
  }
};

module.exports = seedUsers;
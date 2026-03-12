const bcrypt = require('bcryptjs');

async function generateHashes() {
    const salt = await bcrypt.genSalt(10);
    
    const adminHash = await bcrypt.hash('admin123', salt);
    const receptionistHash = await bcrypt.hash('receptionist123', salt);
    
    console.log('-- HASHES REAIS PARA USAR NO BANCO --');
    console.log(`Admin (admin123): ${adminHash}`);
    console.log(`Receptionist (receptionist123): ${receptionistHash}`);
    
    console.log('\n-- COMANDOS SQL --');
    console.log(`UPDATE users SET password_hash = '${adminHash}' WHERE email = 'admin@hotelparadise.com';`);
    console.log(`UPDATE users SET password_hash = '${receptionistHash}' WHERE email = 'recepcao@hotelparadise.com';`);
}

generateHashes();

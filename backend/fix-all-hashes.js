const bcrypt = require('bcryptjs');

async function fixAllHashes() {
    const salt = await bcrypt.genSalt(10);
    
    const users = [
        { email: 'admin@hotelparadise.com', pass: 'admin123' },
        { email: 'recepcao@hotelparadise.com', pass: 'receptionist123' },
        { email: 'financeiro@hotelparadise.com', pass: 'financeiro123' }
    ];
    
    console.log('-- COMANDOS SQL PARA CORRIGIR TODOS OS HASHES --\n');
    
    for (const user of users) {
        const hash = await bcrypt.hash(user.pass, salt);
        // Escapar $ para PowerShell
        const escapedHash = hash.replace(/\$/g, '`$');
        console.log(`docker exec -it hotel_paradise_db psql -U postgres -d hotel_paradise -c "UPDATE users SET password_hash = '${escapedHash}' WHERE email = '${user.email}';"`);
    }
    
    console.log('\n-- HASHES GERADOS (para referência) --');
    for (const user of users) {
        const hash = await bcrypt.hash(user.pass, salt);
        console.log(`${user.email}: ${hash}`);
    }
}

fixAllHashes();

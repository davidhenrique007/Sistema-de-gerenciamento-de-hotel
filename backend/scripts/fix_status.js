const pool = require('./config/database');
pool.query("ALTER TABLE rooms DROP CONSTRAINT IF EXISTS status_check")
  .then(() => pool.query("ALTER TABLE rooms ADD CONSTRAINT status_check CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive', 'cleaning'))"))
  .then(() => { console.log('Constraint corrigida!'); process.exit(0); })
  .catch(e => { console.error('Erro:', e.message); process.exit(1); });

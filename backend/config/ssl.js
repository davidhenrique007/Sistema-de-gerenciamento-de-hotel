const fs = require('fs');
const path = require('path');

const getSSLConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log('🔓 Ambiente de desenvolvimento - HTTP mode');
    return null;
  }

  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../../ssl/private.key');
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../../ssl/certificate.crt');

  try {
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error('❌ Certificados SSL não encontrados');
      console.error(`🔑 Key path: ${keyPath}`);
      console.error(`📜 Cert path: ${certPath}`);
      console.log('💡 Execute: npm run ssl:generate');
      process.exit(1);
    }

    const key = fs.readFileSync(keyPath, 'utf8');
    const cert = fs.readFileSync(certPath, 'utf8');

    console.log('✅ Certificados SSL carregados com sucesso');
    
    return { key, cert };
  } catch (error) {
    console.error('❌ Erro ao carregar certificados SSL:', error.message);
    process.exit(1);
  }
};

module.exports = { getSSLConfig };
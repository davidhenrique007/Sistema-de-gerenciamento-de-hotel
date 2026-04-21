const speakeasy = require('speakeasy');

const secret = 'HFJESSKGHJCV2IZMGZ2GWW2RINKSYJRV';

// Gerar código atual
const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('Código TOTP atual (válido por 30 segundos):', token);
console.log('Use este código para ativar o 2FA');

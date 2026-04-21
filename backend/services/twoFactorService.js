const speakeasy = require('speakeasy');
const crypto = require('crypto');

class TwoFactorService {
  constructor() {
    this.window = 1; // Tolerância de 1 intervalo (30 segundos)
  }

  generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `Hotel Paradise (${email})`,
      length: 20,
      issuer: 'Hotel Paradise'
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url
    };
  }

  verifyCode(secret, token) {
    if (!secret || !token) return false;
    
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: this.window
    });
  }

  generateRecoveryCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  hashRecoveryCodes(codes) {
    return codes.map(code => {
      return crypto.createHash('sha256').update(code).digest('hex');
    });
  }

  verifyRecoveryCode(inputCode, storedHashes) {
    const inputHash = crypto.createHash('sha256').update(inputCode).digest('hex');
    const index = storedHashes.findIndex(hash => hash === inputHash);
    return index !== -1 ? index : null;
  }
}

module.exports = new TwoFactorService();
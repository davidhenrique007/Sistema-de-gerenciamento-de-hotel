const QRCode = require('qrcode');

async function generateQRCode(otpauthUrl) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar QR Code');
  }
}

module.exports = { generateQRCode };
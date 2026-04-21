const httpsRedirect = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (isProduction && !isHttps) {
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    console.log(`🔄 Redirecionando: ${req.method} ${req.url} → HTTPS`);
    return res.redirect(301, httpsUrl);
  }
  
  next();
};

module.exports = httpsRedirect;
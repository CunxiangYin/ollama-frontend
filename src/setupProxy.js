const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://192.168.1.86:11434',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> http://192.168.1.86:11434${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
      }
    })
  );
};
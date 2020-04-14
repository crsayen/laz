const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://35.223.229.47:8080',
      changeOrigin: true,
      secure: false,
      logLevel: "debug"
    })
  );
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://35.223.229.47:8080',
      changeOrigin: true,
      secure: false,
      logLevel: "debug"
    })
  );
};
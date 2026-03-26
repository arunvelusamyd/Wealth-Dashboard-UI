const { createProxyMiddleware } = require('http-proxy-middleware');

// Only proxy /api/* to the backend — all other paths (favicon, static files, etc.)
// are served directly by the React dev server and never reach this proxy.
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8010',
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          // Swallow proxy errors gracefully when the backend is down
          console.warn(`[proxy] ${req.method} ${req.path} → backend unreachable (${err.code})`);
          if (!res.headersSent) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Backend unavailable', code: err.code }));
          }
        },
      },
    })
  );
};

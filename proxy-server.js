const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Proxy middleware for SC API
app.use('/api', createProxyMiddleware({
  target: 'https://wealth.sc.com',
  changeOrigin: true,
  timeout: 120000, // 2 minutes timeout
  proxyTimeout: 120000, // 2 minutes proxy timeout
  pathRewrite: {
    '^/api': '/sg/oe/api'
  },
  // Ensure body is forwarded for POST requests
  onProxyReq: (proxyReq, req, res) => {
    console.log('=== Proxy Request ===');
    console.log('Method:', req.method);
    console.log('Path:', proxyReq.path);
    console.log('Headers:', JSON.stringify(proxyReq.getHeaders(), null, 2));
    
    // Forward Authorization header if present
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log('✓ Authorization header forwarded');
    }
    
    // Log request body if present
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    
    // http-proxy-middleware automatically handles request body forwarding
    // We just need to ensure headers are set correctly
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy response status:', proxyRes.statusCode);
    console.log('Proxy response headers:', proxyRes.headers);
    
    // Log response body for debugging
    let responseBody = '';
    proxyRes.on('data', (chunk) => {
      responseBody += chunk;
    });
    
    proxyRes.on('end', () => {
      console.log('API Response Body:', responseBody.substring(0, 1000)); // First 1000 chars
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      res.status(408).json({ 
        error: 'Request timeout - The API server took too long to respond',
        details: 'Please check your Bearer token and JSON payload format'
      });
    } else {
      res.status(500).json({ 
        error: 'Proxy error occurred',
        details: err.message 
      });
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Proxy server is running' });
});

// Test endpoint to check SC API connectivity
app.get('/test-api', async (req, res) => {
  let responseSent = false;
  
  try {
    const https = require('https');
    const options = {
      hostname: 'wealth.sc.com',
      port: 443,
      path: '/sg/oe/api/portfolio/portfolio_list',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Proxy-Server/1.0)'
      },
      timeout: 10000
    };

    const request = https.request(options, (response) => {
      if (!responseSent) {
        responseSent = true;
        console.log('Test API response status:', response.statusCode);
        res.json({ 
          status: 'API endpoint is reachable',
          statusCode: response.statusCode,
          headers: response.headers
        });
      }
    });

    request.on('error', (err) => {
      if (!responseSent) {
        responseSent = true;
        console.error('Test API error:', err);
        res.json({ 
          status: 'API endpoint error',
          error: err.message,
          code: err.code
        });
      }
    });

    request.on('timeout', () => {
      if (!responseSent) {
        responseSent = true;
        console.error('Test API timeout');
        request.destroy();
        res.json({ 
          status: 'API endpoint timeout',
          error: 'Connection timeout'
        });
      }
    });

    request.setTimeout(10000);
    request.end();
  } catch (error) {
    if (!responseSent) {
      responseSent = true;
      res.json({ 
        status: 'Test failed',
        error: error.message
      });
    }
  }
});

// Test POST endpoint with sample data
app.post('/test-post', async (req, res) => {
  try {
    const https = require('https');
    const postData = JSON.stringify({
      accountId: "test-account",
      portfolioType: "investment"
    });
    
    const options = {
      hostname: 'wealth.sc.com',
      port: 443,
      path: '/sg/oe/api/portfolio/portfolio_list',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (compatible; Proxy-Server/1.0)'
      },
      timeout: 15000
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        res.json({
          status: 'POST test completed',
          statusCode: response.statusCode,
          headers: response.headers,
          responseData: data.substring(0, 500) // First 500 chars
        });
      });
    });

    request.on('error', (err) => {
      res.json({ 
        status: 'POST test error',
        error: err.message,
        code: err.code
      });
    });

    request.on('timeout', () => {
      request.destroy();
      res.json({ 
        status: 'POST test timeout',
        error: 'Connection timeout'
      });
    });

    request.setTimeout(15000);
    request.write(postData);
    request.end();
  } catch (error) {
    res.json({ 
      status: 'POST test failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/portfolio/portfolio_list`);
});

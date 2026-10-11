const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.csv': 'text/csv; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=UTF-8',
  '.tex': 'text/x-tex; charset=UTF-8',
  '.m': 'text/plain; charset=UTF-8',
  '.mat': 'application/octet-stream',
  '.webmanifest': 'application/manifest+json'
};

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);

  // Production Health Check Endpoint
  if (reqUrl === '/health' || reqUrl === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'UP',
      platform: 'Autonomous Controller Evolution Platform (ACEP 4.0)',
      version: '4.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      engine: 'Production Node.js / MATLAB Native Integration',
      endpoints: {
        dashboard: '/',
        health: '/health',
        telemetry: '/api/telemetry',
        audit: '/reports/ACEP_CAPABILITY_AUDIT.md'
      }
    }, null, 2));
    return;
  }

  // Production Telemetry API Endpoint
  if (reqUrl === '/api/telemetry') {
    const csvPath = path.join(__dirname, 'reports', 'acep_telemetry_log.csv');
    if (fs.existsSync(csvPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(csvPath).pipe(res);
      return;
    }
  }

  if (reqUrl === '/') reqUrl = '/index.html';

  // Determine file candidate locations
  let candidates = [
    path.join(__dirname, 'web_app', reqUrl),
    path.join(__dirname, reqUrl)
  ];

  let filePath = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end(`404 Not Found: ${reqUrl}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const acceptEncoding = req.headers['accept-encoding'] || '';

  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // Caching strategy: Never cache in development/live mode so edits update instantly
  headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  headers['Pragma'] = 'no-cache';
  headers['Expires'] = '0';

  // Gzip compression for text assets
  const compressible = ['.html', '.css', '.js', '.json', '.csv', '.md', '.tex', '.m'].includes(ext);
  if (compressible && acceptEncoding.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    const rawStream = fs.createReadStream(filePath);
    const gzip = zlib.createGzip();
    rawStream.pipe(gzip).pipe(res);
  } else {
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`=======================================================`);
  console.log(` ACEP Studio v4.0 Production Web Server Running:`);
  console.log(` - Local:         http://localhost:${PORT}`);
  console.log(` - Network / LAN: http://${localIp}:${PORT}`);
  console.log(` - Health API:    http://localhost:${PORT}/health`);
  console.log(` - Telemetry API: http://localhost:${PORT}/api/telemetry`);
  console.log(`=======================================================`);
});

// Graceful process shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

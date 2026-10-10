const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=UTF-8',
  '.tex': 'text/x-tex; charset=UTF-8',
  '.m': 'text/plain; charset=UTF-8',
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
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${reqUrl}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`=======================================================`);
  console.log(` ACEP Studio v2.0 Web Server running live:`);
  console.log(` - Local PC:     http://localhost:${PORT}`);
  console.log(` - Network / LAN: http://${localIp}:${PORT}`);
  console.log(`   (Open the LAN link on iPhone, iPad, Android, or other PCs)`);
  console.log(`=======================================================`);
});

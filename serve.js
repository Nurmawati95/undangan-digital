// Server localhost sederhana TANPA dependensi (pakai modul bawaan Node.js).
// Cara pakai: node serve.js [port]
// Contoh : node serve.js 8080
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2], 10) || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/';
  const qIndex = rawUrl.indexOf('?');
  const rawQuery = qIndex >= 0 ? rawUrl.slice(qIndex + 1) : '';
  let urlPath = decodeURIComponent((qIndex >= 0 ? rawUrl.slice(0, qIndex) : rawUrl) || '/');

  // Routing halaman utama
  if (urlPath === '/' || urlPath === '/index.html') {
    urlPath = '/landing.html';
  }
  // Alias demo undangan agar URL rapi
  if (urlPath === '/undangan-1') {
    urlPath = '/code.html';
  }
  if (urlPath === '/undangan-2') {
    urlPath = '/code.html';
  }
  // Undangan dinamis per acara: /u/nama-slug (?kpd=Nama+Tamu ikut utuh)
  // Sajikan render.html sebagai "rewrite" (URL asli tidak berubah),
  // supaya parameter seperti ?kpd= tidak hilang oleh redirect.
  if (urlPath.startsWith('/u/')) {
    const slug = urlPath.slice(3).split('/')[0].trim();
    if (slug) {
      return fs.readFile(path.join(ROOT, 'render.html'), (err, data) => {
        if (err) return send(res, 500, 'Gagal memuat halaman undangan');
        send(res, 200, data, MIME['.html']);
      });
    }
  }

  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Cegah path traversal keluar dari folder project
  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Tiru perilaku Vercel: sajikan 404.html (fallback /u/slug) bila ada
      const notFound = path.join(ROOT, '404.html');
      return fs.readFile(notFound, (e404, d404) => {
        if (!e404) return send(res, 404, d404, MIME['.html']);
        return send(res, 404, 'File tidak ditemukan: ' + urlPath);
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (err2, data) => {
      if (err2) return send(res, 500, 'Gagal membaca file');
      send(res, 200, data, MIME[ext] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, () => {
  console.log('Undangan digital jalan di:');
  console.log('  http://localhost:' + PORT);
  console.log('Tekan Ctrl+C untuk berhenti.');
});

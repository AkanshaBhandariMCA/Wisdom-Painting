const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const REVIEWS_PATH = path.join(DATA_DIR, 'reviews.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function ensureReviewsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(REVIEWS_PATH)) {
    fs.writeFileSync(REVIEWS_PATH, JSON.stringify({ reviews: [] }, null, 2), 'utf-8');
  }
}

function readReviews() {
  ensureReviewsFile();

  try {
    const raw = fs.readFileSync(REVIEWS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reviews)) {
      return { reviews: [] };
    }
    return parsed;
  } catch {
    return { reviews: [] };
  }
}

function writeReviews(payload) {
  ensureReviewsFile();
  fs.writeFileSync(REVIEWS_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sanitizeText(value, maxLength = 4000) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeRating(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 5) {
    return null;
  }
  return rounded;
}

function handleReviewsApi(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, readReviews());
  }

  if (req.method === 'POST') {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 1_000_000) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const body = JSON.parse(rawBody || '{}');

        const name = sanitizeText(body.name, 120);
        const email = sanitizeText(body.email, 180);
        const message = sanitizeText(body.message, 2000);
        const location = sanitizeText(body.location || '', 160);
        const source = sanitizeText(body.source || 'Website Form', 120);
        const rating = normalizeRating(body.rating);

        if (!name || !email || !message || rating === null) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Missing or invalid fields. Required: name, email, rating(1-5), message.',
          });
        }

        const payload = readReviews();
        const entry = {
          id: `r-${Date.now()}`,
          verified: true,
          name,
          email,
          rating,
          message,
          location,
          source,
          submittedAt: new Date().toISOString(),
        };

        payload.reviews.push(entry);
        writeReviews(payload);

        return sendJson(res, 201, { ok: true, review: entry });
      } catch {
        return sendJson(res, 400, { ok: false, error: 'Invalid JSON body.' });
      }
    });

    return;
  }

  return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const normalized = urlPath === '/' ? '/index.html' : urlPath;
  const safeRelativePath = path.normalize(normalized).replace(/^\.+/, '');
  const filePath = path.join(ROOT, safeRelativePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' || ext === '.json' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const pathname = req.url.split('?')[0];

  if (pathname === '/api/reviews') {
    handleReviewsApi(req, res);
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  ensureReviewsFile();
  console.log(`Server running at http://localhost:${PORT}`);
});

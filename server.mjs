import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {
  approveUtrPayment,
  getOwnerPin,
  getPhonePeConfig,
  initiatePhonePePayment,
  loadEnvFile,
  lookupPublicPass,
  readApplications,
  readSettings,
  rejectUtrPayment,
  submitUtrApplication,
  verifyPhonePePayment,
  writeApplications,
  writeSettings,
} from './server/phonepeAndSms.mjs';

loadEnvFile();

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const fullUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const urlPath = fullUrl.pathname;

  if (urlPath === '/api/public-config' && req.method === 'GET') {
    const settings = readSettings();
    const pg = getPhonePeConfig();
    sendJson(res, 200, {
      ok: true,
      upiId: settings.upiId,
      merchantName: settings.merchantName,
      hasPhonePePg: pg.mode !== 'UNCONFIGURED',
    });
    return;
  }

  if (urlPath === '/api/upi/submit' && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const record = await submitUtrApplication(payload);
      sendJson(res, 201, { ok: true, application: record });
    } catch (err) {
      sendJson(res, err.statusCode || 500, { ok: false, error: err.message });
    }
    return;
  }

  if (urlPath === '/api/pass-lookup' && req.method === 'GET') {
    const q = fullUrl.searchParams.get('q') || '';
    const found = lookupPublicPass(q);
    if (!found) {
      sendJson(res, 404, { ok: false, error: 'Pass not found' });
      return;
    }
    sendJson(res, 200, { ok: true, application: found });
    return;
  }

  if (urlPath === '/api/phonepe/initiate' && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host || `localhost:${PORT}`;
      const origin = process.env.PUBLIC_SITE_URL || `${proto}://${host}`;
      const result = await initiatePhonePePayment(payload, origin);
      sendJson(res, 200, { ok: true, ...result });
    } catch (err) {
      sendJson(res, err.statusCode || 500, { ok: false, error: err.message });
    }
    return;
  }

  if (urlPath === '/api/phonepe/verify' && req.method === 'GET') {
    try {
      const txnId = fullUrl.searchParams.get('txnId') || '';
      if (!txnId) {
        sendJson(res, 400, { ok: false, verified: false, error: 'Missing txnId' });
        return;
      }
      const result = await verifyPhonePePayment(txnId);
      sendJson(res, 200, { ok: true, ...result });
    } catch (err) {
      sendJson(res, err.statusCode || 500, { ok: false, verified: false, error: err.message });
    }
    return;
  }

  if (urlPath === '/api/phonepe/callback') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (urlPath === '/api/settings') {
    if (req.headers['x-owner-pin'] !== getOwnerPin()) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }
    if (req.method === 'GET') {
      sendJson(res, 200, { ok: true, settings: readSettings() });
      return;
    }
    if (req.method === 'POST') {
      const payload = await readJsonBody(req);
      sendJson(res, 200, { ok: true, settings: writeSettings(payload) });
      return;
    }
  }

  if (urlPath.startsWith('/api/applications')) {
    if (req.headers['x-owner-pin'] !== getOwnerPin()) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }

    if (req.method === 'GET' && urlPath === '/api/applications') {
      sendJson(res, 200, { ok: true, applications: readApplications() });
      return;
    }

    if (req.method === 'POST' && urlPath.endsWith('/approve')) {
      try {
        const targetId = decodeURIComponent(
          urlPath.replace('/api/applications/', '').replace(/\/approve$/, '')
        );
        const out = await approveUtrPayment(targetId);
        sendJson(res, 200, { ok: true, ...out });
      } catch (err) {
        sendJson(res, err.statusCode || 500, { ok: false, error: err.message });
      }
      return;
    }

    if (req.method === 'POST' && urlPath.endsWith('/reject')) {
      const targetId = decodeURIComponent(
        urlPath.replace('/api/applications/', '').replace(/\/reject$/, '')
      );
      sendJson(res, 200, { ok: true, applications: rejectUtrPayment(targetId) });
      return;
    }

    if (req.method === 'PATCH') {
      try {
        const targetId = decodeURIComponent(urlPath.replace('/api/applications/', ''));
        const patch = await readJsonBody(req);
        const next = readApplications().map((item) =>
          item.applicationId === targetId ? { ...item, ...patch } : item
        );
        writeApplications(next);
        sendJson(res, 200, { ok: true, applications: next });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
      return;
    }
  }

  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`LIM WHITES server running on http://localhost:${PORT}`);
});

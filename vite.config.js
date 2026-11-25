import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  getOwnerPin,
  initiatePhonePePayment,
  readApplications,
  verifyPhonePePayment,
  writeApplications,
} from './server/phonepeAndSms.mjs';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
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
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
}

function phonepeAndApplicationsPlugin() {
  return {
    name: 'lim-whites-phonepe-api',
    configureServer(server) {
      server.middlewares.use('/api/phonepe/initiate', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const payload = await readJsonBody(req);
          const proto = req.headers['x-forwarded-proto'] || 'http';
          const host = req.headers.host || 'localhost:5173';
          const origin = `${proto}://${host}`;
          const result = await initiatePhonePePayment(payload, origin);
          sendJson(res, 200, { ok: true, ...result });
        } catch (err) {
          sendJson(res, err.statusCode || 500, { ok: false, error: err.message });
        }
      });

      server.middlewares.use('/api/phonepe/verify', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const parsedUrl = new URL(req.url || '/', 'http://localhost');
          const txnId = parsedUrl.searchParams.get('txnId') || '';
          if (!txnId) {
            sendJson(res, 400, { ok: false, verified: false, error: 'Missing txnId' });
            return;
          }
          const result = await verifyPhonePePayment(txnId);
          sendJson(res, 200, { ok: true, ...result });
        } catch (err) {
          sendJson(res, err.statusCode || 500, { ok: false, verified: false, error: err.message });
        }
      });

      server.middlewares.use('/api/phonepe/callback', async (req, res) => {
        // Server-to-server webhook acknowledgement from PhonePe
        sendJson(res, 200, { ok: true });
      });

      server.middlewares.use('/api/applications', async (req, res, next) => {
        const urlPath = (req.url || '/').split('?')[0];
        const pin = req.headers['x-owner-pin'];
        if (pin !== getOwnerPin()) {
          sendJson(res, 401, { ok: false, error: 'Unauthorized' });
          return;
        }

        if (req.method === 'GET' && urlPath === '/') {
          sendJson(res, 200, { ok: true, applications: readApplications() });
          return;
        }

        if (req.method === 'PATCH' && urlPath.length > 1) {
          try {
            const targetId = decodeURIComponent(urlPath.slice(1));
            const patch = await readJsonBody(req);
            const list = readApplications();
            const nextList = list.map((item) =>
              item.applicationId === targetId ? { ...item, ...patch } : item
            );
            writeApplications(nextList);
            sendJson(res, 200, { ok: true, applications: nextList });
          } catch (err) {
            sendJson(res, 400, { ok: false, error: err.message });
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss(), phonepeAndApplicationsPlugin()],
});

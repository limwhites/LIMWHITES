// Saves every submitted VIP application to:
// 1) Local/Node backend API (/api/applications -> server-data/applications.json)
// 2) Optional Google Sheets / Formspree webhook (VITE_SUBMISSION_WEBHOOK_URL)

export const OWNER_PIN_DEFAULT = import.meta.env.VITE_OWNER_PIN || 'LIMWHITES2026';
const WEBHOOK_URL = import.meta.env.VITE_SUBMISSION_WEBHOOK_URL || '';

export async function persistVipApplication(applicationRecord) {
  const payload = {
    ...applicationRecord,
    status: 'Pending',
    ownerNote: '',
  };

  // 1. Save to backend API if available
  try {
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Ignore when hosted on purely static CDN without Node API
  }

  // 2. Forward to Google Sheets / Formspree Webhook if configured
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Do not block customer Digital Thank You Card on network hiccup
    }
  }
}

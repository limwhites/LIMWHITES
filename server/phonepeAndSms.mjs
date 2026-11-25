import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.resolve(process.cwd(), 'server-data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

export function readApplications() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function writeApplications(list) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

export function readSettings() {
  loadEnvFile();
  let fileSettings = {};
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      fileSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch {
    fileSettings = {};
  }
  return {
    upiId:
      fileSettings.upiId ||
      (process.env.MERCHANT_UPI_ID || process.env.VITE_MERCHANT_UPI_ID || '9555838550@ptsbi').trim(),
    merchantName:
      fileSettings.merchantName ||
      (process.env.MERCHANT_UPI_NAME || 'LIM WHITES').trim(),
  };
}

export function writeSettings(next) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const current = readSettings();
  const merged = {
    upiId: String(next.upiId ?? current.upiId).trim(),
    merchantName: String(next.merchantName ?? current.merchantName).trim() || 'LIM WHITES',
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function getOwnerPin() {
  loadEnvFile();
  return process.env.VITE_OWNER_PIN || process.env.OWNER_PIN || 'LIMWHITES2026';
}

export function getPhonePeConfig() {
  loadEnvFile();
  const envMode = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase();
  const isProd = envMode === 'PROD' || envMode === 'PRODUCTION';

  const clientId = (process.env.PHONEPE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PHONEPE_CLIENT_SECRET || '').trim();
  const clientVersion = (process.env.PHONEPE_CLIENT_VERSION || '1').trim();

  const merchantId = (process.env.PHONEPE_MERCHANT_ID || '').trim();
  const saltKey = (process.env.PHONEPE_SALT_KEY || '').trim();
  const saltIndex = (process.env.PHONEPE_SALT_INDEX || '1').trim();

  const v2BaseUrl = isProd
    ? 'https://api.phonepe.com/apis/pg'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  const v2AuthUrl = isProd
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
  const v1BaseUrl = isProd
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  return {
    mode: clientId && clientSecret ? 'V2' : merchantId && saltKey ? 'V1' : 'UNCONFIGURED',
    isProd,
    clientId,
    clientSecret,
    clientVersion,
    v2BaseUrl,
    v2AuthUrl,
    merchantId,
    saltKey,
    saltIndex,
    v1BaseUrl,
  };
}

let cachedToken = { token: '', expiresAt: 0 };

async function getPhonePeV2Token(cfg) {
  if (cachedToken.token && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }
  const params = new URLSearchParams();
  params.append('client_id', cfg.clientId);
  params.append('client_secret', cfg.clientSecret);
  params.append('client_version', cfg.clientVersion);
  params.append('grant_type', 'client_credentials');

  const res = await fetch(cfg.v2AuthUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.message || 'PhonePe OAuth token generation failed');
  }
  const ttlSec = Number(data.expires_in || 900);
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + ttlSec * 1000,
  };
  return data.access_token;
}

export async function initiatePhonePePayment(applicantData, origin) {
  const cfg = getPhonePeConfig();
  if (cfg.mode === 'UNCONFIGURED') {
    const err = new Error(
      'PhonePe PG API keys are not active yet. Please use the PhonePe UPI QR + 12-Digit UTR option.'
    );
    err.statusCode = 503;
    throw err;
  }

  const merchantTransactionId = `LWVIP${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
  const applicationId = `LW-VIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const amountPaise = 300000;
  const redirectUrl = `${origin}/?phonepe_txn=${encodeURIComponent(merchantTransactionId)}`;
  const callbackUrl = `${origin}/api/phonepe/callback`;

  let gatewayRedirectUrl = '';

  if (cfg.mode === 'V2') {
    const token = await getPhonePeV2Token(cfg);
    const payload = {
      merchantOrderId: merchantTransactionId,
      amount: amountPaise,
      expireAfter: 1200,
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'LIM WHITES VIP Early Access Fee (Rs. 3,000)',
        merchantUrls: { redirectUrl },
      },
      metaInfo: {
        udf1: applicationId,
        udf2: applicantData.hoodieSku,
        udf3: applicantData.size,
      },
    };

    const res = await fetch(`${cfg.v2BaseUrl}/checkout/v2/pay`, {
      method: 'POST',
      headers: {
        Authorization: `O-Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CLIENT-ID': cfg.clientId,
        'X-CLIENT-VERSION': cfg.clientVersion,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.redirectUrl) {
      throw new Error(data.message || 'PhonePe V2 checkout initiation failed');
    }
    gatewayRedirectUrl = data.redirectUrl;
  } else {
    const payload = {
      merchantId: cfg.merchantId,
      merchantTransactionId,
      merchantUserId: `LW_${applicantData.phone}`,
      amount: amountPaise,
      redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl,
      mobileNumber: applicantData.phone,
      paymentInstrument: { type: 'PAY_PAGE' },
    };
    const base64Payload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    const checksum =
      crypto
        .createHash('sha256')
        .update(`${base64Payload}/pg/v1/pay${cfg.saltKey}`)
        .digest('hex') + `###${cfg.saltIndex}`;

    const res = await fetch(`${cfg.v1BaseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });
    const data = await res.json();
    const url = data?.data?.instrumentResponse?.redirectInfo?.url;
    if (!res.ok || !data.success || !url) {
      throw new Error(data.message || 'PhonePe V1 checkout initiation failed');
    }
    gatewayRedirectUrl = url;
  }

  const now = new Date();
  const pendingRecord = {
    applicationId,
    merchantTransactionId,
    phonepeTransactionId: '',
    utrNumber: '',
    paymentStatus: 'PENDING_PAYMENT',
    status: 'Awaiting Payment',
    smsStatus: 'pending',
    hoodieId: applicantData.hoodieId,
    hoodieName: applicantData.hoodieName,
    hoodieSku: applicantData.hoodieSku,
    hoodieImage: applicantData.hoodieImage,
    colorway: applicantData.colorway,
    stock: applicantData.stock,
    size: applicantData.size,
    sizeValuation: applicantData.sizeValuation,
    feePaid: 3000,
    fullName: applicantData.fullName,
    email: applicantData.email,
    phone: applicantData.phone,
    instagram: applicantData.instagram || '',
    collectorTier: applicantData.collectorTier,
    address: applicantData.address,
    city: applicantData.city,
    state: applicantData.state,
    pincode: applicantData.pincode,
    paymentMethodLabel: 'PHONEPE PAYMENT GATEWAY',
    acceptedNonRefundableTerms: true,
    submittedAtIso: now.toISOString(),
    submittedAtFormatted: now.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  };

  const list = readApplications();
  writeApplications([pendingRecord, ...list]);

  return { redirectUrl: gatewayRedirectUrl, merchantTransactionId, applicationId };
}

export async function submitUtrApplication(applicantData) {
  const utr = String(applicantData.utrNumber || '').replace(/\s+/g, '');
  if (!/^\d{12}$/.test(utr)) {
    const err = new Error('Please enter a valid 12-digit UTR / UPI Transaction Reference Number.');
    err.statusCode = 400;
    throw err;
  }

  const list = readApplications();
  const duplicate = list.find(
    (item) => item.utrNumber === utr && item.paymentStatus !== 'REJECTED'
  );
  if (duplicate) {
    const err = new Error(
      `This 12-digit UTR (${utr}) has already been submitted under application ${duplicate.applicationId}.`
    );
    err.statusCode = 409;
    throw err;
  }

  const applicationId = `LW-VIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const record = {
    applicationId,
    merchantTransactionId: `UTR_${utr}`,
    phonepeTransactionId: utr,
    paymentReference: utr,
    utrNumber: utr,
    paymentStatus: 'UTR_SUBMITTED',
    status: 'Awaiting UTR Verification',
    smsStatus: 'waiting_utr_approval',
    hoodieId: applicantData.hoodieId,
    hoodieName: applicantData.hoodieName,
    hoodieSku: applicantData.hoodieSku,
    hoodieImage: applicantData.hoodieImage,
    colorway: applicantData.colorway,
    stock: applicantData.stock,
    size: applicantData.size,
    sizeValuation: applicantData.sizeValuation,
    feePaid: 3000,
    fullName: applicantData.fullName,
    email: applicantData.email,
    phone: applicantData.phone,
    instagram: applicantData.instagram || '',
    collectorTier: applicantData.collectorTier,
    address: applicantData.address,
    city: applicantData.city,
    state: applicantData.state,
    pincode: applicantData.pincode,
    paymentMethodLabel: `UPI UTR (${utr})`,
    acceptedNonRefundableTerms: true,
    submittedAtIso: now.toISOString(),
    submittedAtFormatted: now.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  };

  writeApplications([record, ...list]);
  await forwardToWebhook(record);
  return record;
}

export async function sendCustomerConfirmationSms(record) {
  loadEnvFile();
  const phone = String(record.phone || '').replace(/\D/g, '');
  if (phone.length !== 10) {
    return { status: 'invalid_phone' };
  }

  const smsText = `LIM WHITES: Thank you ${record.fullName}! Your VIP Early Access application (${record.applicationId}) for ${record.hoodieSku} Size ${record.size} is confirmed after Rs.3,000 payment. Please wait, our team will contact you soon.`;

  const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
  if (fast2smsKey) {
    try {
      const route = (process.env.FAST2SMS_ROUTE || 'q').trim();
      const bodyPayload =
        route === 'dlt' && process.env.FAST2SMS_TEMPLATE_ID
          ? {
              route: 'dlt',
              sender_id: process.env.FAST2SMS_SENDER_ID || 'LIMWHT',
              message: process.env.FAST2SMS_TEMPLATE_ID,
              variables_values: `${record.fullName}|${record.applicationId}`,
              numbers: phone,
            }
          : {
              route: 'q',
              message: smsText,
              language: 'english',
              numbers: phone,
            };

      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      return {
        status: data.return ? 'sent_fast2sms' : 'failed_fast2sms',
        providerResponse: data,
      };
    } catch (err) {
      return { status: 'error_fast2sms', error: err.message };
    }
  }

  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioFrom = (process.env.TWILIO_FROM_NUMBER || '').trim();
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const form = new URLSearchParams();
      form.append('To', `+91${phone}`);
      form.append('From', twilioFrom);
      form.append('Body', smsText);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        }
      );
      const data = await res.json();
      return {
        status: res.ok ? 'sent_twilio' : 'failed_twilio',
        sid: data.sid,
      };
    } catch (err) {
      return { status: 'error_twilio', error: err.message };
    }
  }

  const msg91Key = (process.env.MSG91_AUTH_KEY || '').trim();
  const msg91Template = (process.env.MSG91_TEMPLATE_ID || '').trim();
  if (msg91Key && msg91Template) {
    try {
      const res = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: msg91Key,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: msg91Template,
          recipients: [
            {
              mobiles: `91${phone}`,
              name: record.fullName,
              appid: record.applicationId,
            },
          ],
        }),
      });
      const data = await res.json();
      return {
        status: res.ok ? 'sent_msg91' : 'failed_msg91',
        providerResponse: data,
      };
    } catch (err) {
      return { status: 'error_msg91', error: err.message };
    }
  }

  return { status: 'sms_gateway_not_configured' };
}

async function forwardToWebhook(record) {
  loadEnvFile();
  const webhookUrl = (
    process.env.SUBMISSION_WEBHOOK_URL ||
    process.env.VITE_SUBMISSION_WEBHOOK_URL ||
    ''
  ).trim();
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch {
    // Ignore webhook errors
  }
}

export async function approveUtrPayment(applicationId) {
  const list = readApplications();
  const target = list.find((a) => a.applicationId === applicationId);
  if (!target) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }
  const smsRes = await sendCustomerConfirmationSms(target);
  const updated = {
    ...target,
    paymentStatus: 'PAID',
    status: target.status === 'Allotted' ? 'Allotted' : 'Pending',
    paymentMethodLabel: target.utrNumber
      ? `PHONEPE UPI VERIFIED (UTR ${target.utrNumber})`
      : target.paymentMethodLabel,
    smsStatus: smsRes.status,
    verifiedAtIso: new Date().toISOString(),
  };
  const nextList = list.map((a) => (a.applicationId === applicationId ? updated : a));
  writeApplications(nextList);
  await forwardToWebhook(updated);
  return { application: updated, applications: nextList };
}

export function rejectUtrPayment(applicationId) {
  const list = readApplications();
  const nextList = list.map((a) =>
    a.applicationId === applicationId
      ? {
          ...a,
          paymentStatus: 'REJECTED',
          status: 'Payment Rejected',
          smsStatus: 'not_sent_unpaid',
        }
      : a
  );
  writeApplications(nextList);
  return nextList;
}

export function lookupPublicPass(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  const list = readApplications();
  const found = list.find(
    (p) =>
      String(p.applicationId || '').toLowerCase() === q ||
      String(p.email || '').toLowerCase() === q ||
      String(p.utrNumber || '').toLowerCase() === q
  );
  return found || null;
}

export async function verifyPhonePePayment(merchantTransactionId) {
  const cfg = getPhonePeConfig();
  if (cfg.mode === 'UNCONFIGURED') {
    const err = new Error('PhonePe Merchant credentials are not configured on the server.');
    err.statusCode = 503;
    throw err;
  }

  const list = readApplications();
  const existing = list.find((item) => item.merchantTransactionId === merchantTransactionId);
  if (!existing) {
    const err = new Error('Transaction record not found.');
    err.statusCode = 404;
    throw err;
  }

  if (existing.paymentStatus === 'PAID') {
    return { verified: true, state: 'COMPLETED', application: existing };
  }

  let isPaid = false;
  let gatewayState = 'FAILED';
  let phonepeTxnId = '';
  let verifiedAmountPaise = 0;

  if (cfg.mode === 'V2') {
    const token = await getPhonePeV2Token(cfg);
    const res = await fetch(
      `${cfg.v2BaseUrl}/checkout/v2/order/${encodeURIComponent(merchantTransactionId)}/status?details=true`,
      {
        method: 'GET',
        headers: {
          Authorization: `O-Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CLIENT-ID': cfg.clientId,
          'X-CLIENT-VERSION': cfg.clientVersion,
        },
      }
    );
    const data = await res.json();
    gatewayState = data.state || 'FAILED';
    verifiedAmountPaise = Number(data.amount || 0);
    phonepeTxnId = data.paymentDetails?.[0]?.transactionId || data.orderId || merchantTransactionId;
    isPaid = res.ok && gatewayState === 'COMPLETED' && verifiedAmountPaise === 300000;
  } else {
    const statusPath = `/pg/v1/status/${cfg.merchantId}/${merchantTransactionId}`;
    const checksum =
      crypto
        .createHash('sha256')
        .update(`${statusPath}${cfg.saltKey}`)
        .digest('hex') + `###${cfg.saltIndex}`;

    const res = await fetch(`${cfg.v1BaseUrl}${statusPath}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': cfg.merchantId,
      },
    });
    const data = await res.json();
    gatewayState = data.code || data.data?.state || 'FAILED';
    verifiedAmountPaise = Number(data.data?.amount || 0);
    phonepeTxnId = data.data?.transactionId || merchantTransactionId;
    isPaid =
      res.ok &&
      data.success === true &&
      data.code === 'PAYMENT_SUCCESS' &&
      verifiedAmountPaise === 300000;
  }

  if (isPaid) {
    const smsRes = await sendCustomerConfirmationSms(existing);
    const updatedRecord = {
      ...existing,
      paymentStatus: 'PAID',
      status: 'Pending',
      phonepeTransactionId: phonepeTxnId,
      paymentReference: phonepeTxnId,
      paymentMethodLabel: `PHONEPE VERIFIED (${phonepeTxnId})`,
      smsStatus: smsRes.status,
      verifiedAtIso: new Date().toISOString(),
    };
    const nextList = list.map((item) =>
      item.merchantTransactionId === merchantTransactionId ? updatedRecord : item
    );
    writeApplications(nextList);
    await forwardToWebhook(updatedRecord);
    return { verified: true, state: 'COMPLETED', application: updatedRecord };
  }

  const failedStatus = gatewayState === 'PENDING' ? 'PENDING_PAYMENT' : 'FAILED';
  const updatedFail = {
    ...existing,
    paymentStatus: failedStatus,
    status: failedStatus === 'PENDING_PAYMENT' ? 'Awaiting Payment' : 'Payment Failed',
  };
  writeApplications(
    list.map((item) => (item.merchantTransactionId === merchantTransactionId ? updatedFail : item))
  );
  return {
    verified: false,
    state: gatewayState,
    message:
      gatewayState === 'PENDING'
        ? 'Your ₹3,000 PhonePe payment is still pending confirmation.'
        : 'Payment was not completed on PhonePe. VIP Access is only issued after verified ₹3,000 payment.',
  };
}

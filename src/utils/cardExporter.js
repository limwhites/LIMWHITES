import { formatINR } from '../data/hoodies';

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function downloadThankYouCardPng(application) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Deep matte obsidian card base
  const bgGrad = ctx.createLinearGradient(0, 0, 1280, 800);
  bgGrad.addColorStop(0, '#09090B');
  bgGrad.addColorStop(0.55, '#141418');
  bgGrad.addColorStop(1, '#070709');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1280, 800);

  // Subtle architectural Adidas-inspired diagonal stripes on right edge
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const xBase = 980 + i * 74;
    ctx.moveTo(xBase, 0);
    ctx.lineTo(xBase + 42, 0);
    ctx.lineTo(xBase - 240, 800);
    ctx.lineTo(xBase - 282, 800);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Outer gold-metallic hairline frame
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 28, 28, 1224, 744, 18);
  ctx.stroke();

  // Top gold accent bar
  const goldGrad = ctx.createLinearGradient(56, 56, 1224, 56);
  goldGrad.addColorStop(0, '#D4AF37');
  goldGrad.addColorStop(0.5, '#F5E6A8');
  goldGrad.addColorStop(1, '#B48A3E');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(56, 56, 1168, 4);

  // Header brand + badge
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px "Barlow Condensed", Arial, sans-serif';
  ctx.fillText('LIM WHITES  ×  BAPE®', 56, 112);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('OFFICIAL VIP EARLY ACCESS DIGITAL THANK YOU CARD', 56, 142);

  // Top right status pill
  ctx.fillStyle = 'rgba(212, 175, 55, 0.14)';
  drawRoundedRect(ctx, 878, 78, 346, 48, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#F5E6A8';
  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.fillText('STATUS: VIP APPLICATION LOGGED', 898, 108);

  // Personalized Thank You headline
  ctx.fillStyle = '#D4AF37';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillText(`APP ID: ${application.applicationId}`, 56, 198);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 54px "Barlow Condensed", Arial, sans-serif';
  const safeName = (application.fullName || 'VIP APPLICANT').toUpperCase().slice(0, 28);
  ctx.fillText(`THANK YOU, ${safeName}`, 56, 256);

  ctx.fillStyle = '#D4D4D8';
  ctx.font = '400 19px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(
    'Your VIP Early Access entry for the Limited 09 Archive drop is officially registered.',
    56,
    290
  );

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 320);
  ctx.lineTo(1224, 320);
  ctx.stroke();

  // Left box: Hoodie details
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  drawRoundedRect(ctx, 56, 348, 568, 286, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('RESERVED EDITION (STOCK: 09 • NOT FOR SALE)', 82, 384);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px "Barlow Condensed", Arial, sans-serif';
  ctx.fillText(application.hoodieName.slice(0, 42), 82, 422);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText(`SKU: ${application.hoodieSku}  |  COLOR: ${application.colorway}`, 82, 452);

  const metrics = [
    ['SELECTED SIZE', `SIZE ${application.size}`],
    ['SIZE VALUATION', formatINR(application.sizeValuation)],
    ['VIP ACCESS FEE PAID', `${formatINR(application.feePaid)} (VERIFIED)`],
    ['PAYMENT METHOD', application.paymentMethodLabel],
  ];

  metrics.forEach(([label, val], idx) => {
    const rowY = 498 + idx * 32;
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText(label, 82, rowY);

    ctx.fillStyle = idx === 2 ? '#86EFAC' : '#FFFFFF';
    ctx.font = '700 16px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText(val, 290, rowY);
  });

  // Right box: Applicant verified details
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  drawRoundedRect(ctx, 652, 348, 572, 286, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('VERIFIED APPLICANT CREDENTIALS', 678, 384);

  const applicantRows = [
    ['FULL NAME', application.fullName],
    ['EMAIL', application.email],
    ['MOBILE', `+91 ${application.phone}`],
    ['DISPATCH CITY', `${application.city}, ${application.state} - ${application.pincode}`],
    ['PROFILE TIER', application.collectorTier],
    ['SUBMITTED', application.submittedAtFormatted],
  ];

  applicantRows.forEach(([label, val], idx) => {
    const rowY = 424 + idx * 34;
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText(label, 678, rowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 15px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText(String(val || '-').slice(0, 34), 835, rowY);
  });

  // Bottom Policy Stamp & Barcode graphic
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  drawRoundedRect(ctx, 56, 662, 860, 74, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.stroke();

  ctx.fillStyle = '#D4AF37';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('VIP ALLOTMENT NOTICE • T&C ACCEPTED', 78, 692);

  ctx.fillStyle = '#E4E4E7';
  ctx.font = '400 14px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(
    'You will be informed on your registered contact once allotted. ₹3,000 fee is non-refundable.',
    78,
    718
  );

  // Decorative serial barcode on bottom right
  ctx.fillStyle = '#FFFFFF';
  const bars = [4, 2, 6, 2, 4, 8, 2, 4, 2, 6, 4, 2, 8, 2, 4, 6, 2, 4, 2, 6, 4, 2, 6, 4];
  let bx = 948;
  bars.forEach((bw, idx) => {
    if (idx % 2 === 0) {
      ctx.fillRect(bx, 664, bw * 2.2, 50);
    }
    bx += bw * 2.7;
  });

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillText(`LW-VAULT // ${application.applicationId}`, 948, 734);

  const link = document.createElement('a');
  link.download = `LIM-WHITES-VIP-PASS-${application.applicationId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

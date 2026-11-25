import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Lock,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Clock,
  CreditCard,
  Building2,
  Wallet,
  QrCode,
} from 'lucide-react';
import {
  HOODIES,
  SIZE_OPTIONS,
  VIP_APPLICATION_FEE,
  formatINR,
} from '../data/hoodies';

const COLLECTOR_TIERS = [
  'Private Collector',
  'Returning LIM WHITES VIP',
  'Streetwear Archive Member',
  'First-Time VIP Applicant',
];

export default function VipApplicationModal({
  isOpen,
  initialHoodieId,
  initialSize,
  onClose,
  onOpenTerms,
  onPendingSubmitted,
}) {
  const [step, setStep] = useState(1); // 1 = Details, 2 = PhonePe / UPI QR + UTR, 3 = Submitted Under Verification
  const [hoodieId, setHoodieId] = useState(initialHoodieId || HOODIES[0].id);
  const [size, setSize] = useState(initialSize || 'S');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    instagram: '',
    collectorTier: COLLECTOR_TIERS[0],
    address: '',
    city: '',
    state: '',
    pincode: '',
    acceptTerms: false,
    utrNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [merchantConfig, setMerchantConfig] = useState({
    upiId: '9555838550@ptsbi',
    merchantName: 'LIM WHITES',
    hasPhonePePg: false,
  });
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    if (initialHoodieId) setHoodieId(initialHoodieId);
    if (initialSize) setSize(initialSize);
    setErrors({});
    setApiError('');
    setSubmitting(false);
    setSubmittedRecord(null);

    fetch('/api/public-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.ok) {
          setMerchantConfig({
            upiId: data.upiId || '9555838550@ptsbi',
            merchantName: data.merchantName || 'LIM WHITES',
            hasPhonePePg: Boolean(data.hasPhonePePg),
          });
        }
      })
      .catch(() => {});
  }, [isOpen, initialHoodieId, initialSize]);

  useEffect(() => {
    if (step !== 2 || !merchantConfig.upiId) {
      setQrDataUrl('');
      return;
    }
    const upiUri = `upi://pay?pa=${encodeURIComponent(
      merchantConfig.upiId
    )}&pn=${encodeURIComponent(merchantConfig.merchantName)}&am=3000&cu=INR&tn=${encodeURIComponent(
      'LIM WHITES VIP ACCESS'
    )}`;
    QRCode.toDataURL(upiUri, { width: 260, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [step, merchantConfig]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const selectedHoodie = HOODIES.find((h) => h.id === hoodieId) || HOODIES[0];
  const currentValuation = selectedHoodie.sizePrices[size] || selectedHoodie.sizePrices.S;
  const upiDeepLink = merchantConfig.upiId
    ? `upi://pay?pa=${encodeURIComponent(merchantConfig.upiId)}&pn=${encodeURIComponent(
        merchantConfig.merchantName
      )}&am=3000&cu=INR&tn=${encodeURIComponent('LIM WHITES VIP ACCESS')}`
    : '';

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim() || value.trim().length < 2) {
          return 'Please enter your full name.';
        }
        return '';
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'phone': {
        const digits = value.replace(/\D/g, '');
        if (digits.length !== 10) {
          return 'Enter your 10-digit mobile number (SMS confirmation is sent here).';
        }
        return '';
      }
      case 'address':
        if (!value.trim() || value.trim().length < 8) {
          return 'Please enter your complete delivery address.';
        }
        return '';
      case 'city':
        if (!value.trim()) return 'City is required.';
        return '';
      case 'state':
        if (!value.trim()) return 'State is required.';
        return '';
      case 'pincode':
        if (!/^\d{6}$/.test(value.trim())) {
          return 'Enter a valid 6-digit PIN code.';
        }
        return '';
      case 'acceptTerms':
        if (!value) {
          return 'Please accept the Terms & Conditions to proceed.';
        }
        return '';
      case 'utrNumber': {
        const clean = value.replace(/\D/g, '');
        if (clean.length !== 12) {
          return 'Enter the exact 12-digit UTR / UPI Reference Number from PhonePe / GPay / Paytm.';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setApiError('');
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  };

  const applicantPayload = () => ({
    hoodieId: selectedHoodie.id,
    hoodieName: selectedHoodie.name,
    hoodieSku: selectedHoodie.sku,
    hoodieImage: selectedHoodie.image,
    colorway: selectedHoodie.colorway,
    stock: selectedHoodie.stock,
    size,
    sizeValuation: currentValuation,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.replace(/\D/g, ''),
    instagram: form.instagram.trim(),
    collectorTier: form.collectorTier,
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    pincode: form.pincode.trim(),
  });

  const handleStep1Next = async (e) => {
    e.preventDefault();
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'pincode',
      'acceptTerms',
    ];
    const newErrors = {};
    const newTouched = {};
    requiredFields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // If full PhonePe PG API keys are configured, redirect directly to PhonePe Gateway
    if (merchantConfig.hasPhonePePg) {
      setSubmitting(true);
      setApiError('');
      try {
        const res = await fetch('/api/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicantPayload()),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        setSubmitting(false);
        setApiError(data.error || 'PhonePe gateway unavailable.');
        return;
      } catch {
        setSubmitting(false);
        setApiError('Server connection error. Please try again.');
        return;
      }
    }

    // Otherwise open Step 2: Scannable ₹3,000 PhonePe/UPI QR + 12-Digit UTR Entry
    setStep(2);
  };

  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    const err = validateField('utrNumber', form.utrNumber);
    setTouched((prev) => ({ ...prev, utrNumber: true }));
    setErrors((prev) => ({ ...prev, utrNumber: err }));
    if (err) return;

    setSubmitting(true);
    setApiError('');

    try {
      const res = await fetch('/api/upi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...applicantPayload(),
          utrNumber: form.utrNumber.replace(/\D/g, ''),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.application) {
        setSubmitting(false);
        setApiError(data.error || 'Could not submit UTR. Please check your 12-digit UTR.');
        return;
      }

      setSubmitting(false);
      setSubmittedRecord(data.application);
      setStep(3);
      if (onPendingSubmitted) onPendingSubmitted(data.application);
    } catch {
      setSubmitting(false);
      setApiError('Server is unavailable right now. Please ensure the server is running.');
    }
  };

  const handleCopyUpi = () => {
    if (!merchantConfig.upiId) return;
    navigator.clipboard.writeText(merchantConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-form-title"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative bg-white w-full max-w-5xl max-h-[94vh] overflow-y-auto border border-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header + 3-Step Indicator */}
        <div className="sticky top-0 z-20 bg-black text-white px-5 sm:px-8 py-4 border-b border-white/15">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                LIM WHITES VERIFIED VIP ACCESS PORTAL
              </div>
              <h2
                id="vip-form-title"
                className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide"
              >
                {step === 1
                  ? 'STEP 1: APPLICANT DETAILS'
                  : step === 2
                  ? 'STEP 2: PAY ₹3,000 ON PHONEPE / UPI & ENTER UTR'
                  : 'APPLICATION LOGGED — VERIFYING ₹3,000 UTR'}
              </h2>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              aria-label="Close VIP application form"
              className="w-10 h-10 border border-white/25 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div
              className={`py-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-between ${
                step === 1 ? 'bg-[#D4AF37] text-black' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              <span>01 // DETAILS</span>
              <span>{step > 1 ? 'DONE ✓' : 'ACTIVE'}</span>
            </div>
            <div
              className={`py-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-between ${
                step === 2
                  ? 'bg-[#5F259F] text-white'
                  : step > 2
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 text-zinc-400'
              }`}
            >
              <span>02 // PAY ₹3,000 + UTR</span>
              <span>{step > 2 ? 'SENT ✓' : step === 2 ? 'ACTIVE' : 'NEXT'}</span>
            </div>
            <div
              className={`py-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-between ${
                step === 3 ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-zinc-400'
              }`}
            >
              <span>03 // VERIFY &amp; SMS</span>
              <span>{step === 3 ? 'PENDING CHECK' : 'AUTO'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Summary Panel */}
          <div className="lg:col-span-5 bg-[#F5F5F5] p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-black/15 space-y-5">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600 block mb-2">
                SELECTED LIMITED ARCHIVE PIECE
              </span>
              <label htmlFor="vip-hoodie-select" className="sr-only">
                Choose BAPE collab hoodie
              </label>
              <select
                id="vip-hoodie-select"
                disabled={step > 1}
                value={hoodieId}
                onChange={(e) => setHoodieId(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-black font-bold text-xs uppercase tracking-[0.06em] text-black focus:outline-none cursor-pointer disabled:opacity-75"
              >
                {HOODIES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.sku} — {h.shortName} (STOCK: 09)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-black/15 p-4 flex gap-4 items-center">
              <img
                src={selectedHoodie.image}
                alt={selectedHoodie.name}
                className="w-24 h-28 object-cover bg-[#ECEFF1] border border-black/10 shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-black text-white font-mono text-[10px] font-bold px-2 py-0.5">
                    STOCK: 0{selectedHoodie.stock}
                  </span>
                  <span className="bg-white text-black border border-black/25 font-mono text-[10px] font-bold px-2 py-0.5">
                    NOT FOR SALE
                  </span>
                </div>
                <h3 className="font-display text-xl font-extrabold uppercase text-black leading-tight">
                  {selectedHoodie.name}
                </h3>
                <p className="text-xs text-zinc-600">{selectedHoodie.colorway}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.12em] mb-2">
                <span className="font-bold text-black">SELECTED SIZE</span>
                <span className="text-zinc-600">₹35K – ₹45K TIER</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {SIZE_OPTIONS.map((sz) => {
                  const isSel = size === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={step > 1}
                      onClick={() => setSize(sz)}
                      className={`py-2.5 border text-center transition-colors cursor-pointer disabled:cursor-default ${
                        isSel
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-black/25 hover:border-black'
                      }`}
                    >
                      <span className="block font-mono text-xs font-bold">{sz}</span>
                      <span
                        className={`block font-mono text-[9px] mt-0.5 ${
                          isSel ? 'text-[#D4AF37]' : 'text-zinc-500'
                        }`}
                      >
                        ₹{(selectedHoodie.sizePrices[sz] / 1000).toFixed(1).replace('.0', '')}k
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-black p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-600 uppercase">
                  OWNERSHIP VALUATION (SIZE {size})
                </span>
                <span className="font-mono font-bold text-black">
                  {formatINR(currentValuation)}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 border-b border-black/10 pb-2.5">
                Payable only upon official VIP allotment from the 09 numbered units.
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-mono text-xs font-bold uppercase text-black">
                  VIP ENTRY FEE (DUE NOW)
                </span>
                <span className="font-display text-3xl font-extrabold text-black">
                  {formatINR(VIP_APPLICATION_FEE)}
                </span>
              </div>
              <div className="bg-[#F5F5F5] border border-black/15 px-3 py-2 text-[11px] font-mono text-zinc-700">
                VIP Digital Pass &amp; SMS activate once your ₹3,000 payment UTR is verified.
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 p-5 sm:p-7">
            {step === 1 && (
              <form onSubmit={handleStep1Next} noValidate className="space-y-5">
                <div className="border-b border-black/15 pb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    APPLICANT CREDENTIALS &amp; DISPATCH DETAILS
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="vip-fullName"
                    className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                  >
                    Full Name *{' '}
                    <span className="font-normal normal-case text-zinc-500">
                      (Printed on your Digital Thank You Card)
                    </span>
                  </label>
                  <input
                    id="vip-fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g. Aarav Singhania"
                    className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                      errors.fullName ? 'border-red-600' : 'border-black/30 focus:border-black'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="vip-email"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="vip-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="aarav@domain.com"
                      className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                        errors.email ? 'border-red-600' : 'border-black/30 focus:border-black'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="vip-phone"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      Mobile / SMS Number (+91) *
                    </label>
                    <input
                      id="vip-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('phone')}
                      placeholder="9876543210"
                      className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                        errors.phone ? 'border-red-600' : 'border-black/30 focus:border-black'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="vip-tier"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      VIP Collector Profile
                    </label>
                    <select
                      id="vip-tier"
                      value={form.collectorTier}
                      onChange={(e) => handleChange('collectorTier', e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-black/30 focus:border-black text-sm text-black focus:outline-none cursor-pointer"
                    >
                      {COLLECTOR_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="vip-instagram"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      Instagram Handle{' '}
                      <span className="font-normal text-zinc-500">(Optional)</span>
                    </label>
                    <input
                      id="vip-instagram"
                      type="text"
                      value={form.instagram}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      placeholder="@collector_handle"
                      className="w-full h-11 px-3.5 bg-white border border-black/30 focus:border-black text-sm text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="vip-address"
                    className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                  >
                    Street Address / Apartment / Landmark *
                  </label>
                  <input
                    id="vip-address"
                    type="text"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    placeholder="House / Flat No., Tower, Street, Area"
                    className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                      errors.address ? 'border-red-600' : 'border-black/30 focus:border-black'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="vip-city"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      City *
                    </label>
                    <input
                      id="vip-city"
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                      placeholder="Mumbai"
                      className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                        errors.city ? 'border-red-600' : 'border-black/30 focus:border-black'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="vip-state"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      State *
                    </label>
                    <input
                      id="vip-state"
                      type="text"
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      onBlur={() => handleBlur('state')}
                      placeholder="Maharashtra"
                      className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                        errors.state ? 'border-red-600' : 'border-black/30 focus:border-black'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="vip-pincode"
                      className="block text-xs font-bold uppercase tracking-[0.1em] text-black mb-1.5"
                    >
                      PIN Code *
                    </label>
                    <input
                      id="vip-pincode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('pincode')}
                      placeholder="400001"
                      className={`w-full h-11 px-3.5 bg-white border text-sm text-black focus:outline-none ${
                        errors.pincode ? 'border-red-600' : 'border-black/30 focus:border-black'
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Legal T&C */}
                <div className="bg-[#F7F7F7] border border-black/20 p-4 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black">
                        TERMS &amp; ALLOTMENT NOTICE
                      </h4>
                      <p className="text-xs text-zinc-700 leading-relaxed mt-1">
                        Once VIP Early Access is allotted, we will inform you directly on your
                        registered Email &amp; Mobile number. Stock is limited to 09 units per
                        piece; the ₹3,000 VIP application fee is non-refundable if VIP access or
                        allotment is not granted.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-black cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-semibold text-black leading-relaxed">
                      I accept the Terms &amp; Conditions and understand allotment confirmation will
                      be shared on my contact details.{' '}
                      <button
                        type="button"
                        onClick={onOpenTerms}
                        className="underline text-zinc-700 hover:text-black cursor-pointer"
                      >
                        View Terms
                      </button>
                    </span>
                  </label>

                  {errors.acceptTerms && (
                    <p className="text-xs text-red-700 font-semibold">{errors.acceptTerms}</p>
                  )}
                </div>

                {apiError && (
                  <div className="bg-amber-50 border border-amber-400 p-3 text-xs text-amber-950">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-[#5F259F] hover:bg-[#4b1c80] text-white font-bold text-xs uppercase tracking-[0.16em] transition-colors flex items-center justify-between cursor-pointer disabled:opacity-75"
                >
                  <span className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4" />
                    NEXT: PAY ₹3,000 VIA PHONEPE / UPI QR
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {step === 2 && (
              /* STEP 2: PHONEPE / UPI QR (₹3,000 LOCKED) + 12-DIGIT UTR ENTRY */
              <form onSubmit={handleSubmitUtr} noValidate className="space-y-5">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 hover:text-black cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  BACK TO EDIT DETAILS
                </button>

                <div className="bg-[#5F259F] text-white p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-purple-200">
                      OFFICIAL UPI / PHONEPE CHECKOUT
                    </div>
                    <div className="font-display text-3xl font-extrabold uppercase">
                      {merchantConfig.merchantName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase text-purple-200">
                      AUTO-LOCKED AMOUNT
                    </div>
                    <div className="font-display text-4xl font-extrabold">₹3,000</div>
                  </div>
                </div>

                {/* Payment Options: QR Open, Others Under Maintenance */}
                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                    SELECT PAYMENT METHOD
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 border-2 border-[#5F259F] bg-[#5F259F]/5 text-left">
                      <div className="flex items-center justify-between mb-1.5">
                        <QrCode className="w-4 h-4 text-[#5F259F]" />
                        <span className="bg-emerald-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase">
                          OPEN
                        </span>
                      </div>
                      <span className="block text-xs font-bold text-black">UPI QR / Apps</span>
                      <span className="block text-[10px] text-zinc-600 mt-0.5">
                        ₹3,000 Auto-Detect
                      </span>
                    </div>

                    {[
                      { label: 'Credit / Debit Card', icon: CreditCard },
                      { label: 'NetBanking', icon: Building2 },
                      { label: 'Wallets / Pay Later', icon: Wallet },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <div
                          key={opt.label}
                          aria-disabled="true"
                          title="Currently under maintenance — please pay via UPI QR"
                          className="p-3 border border-black/15 bg-zinc-100 text-left opacity-70 cursor-not-allowed select-none"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Icon className="w-4 h-4 text-zinc-500" />
                            <span className="bg-zinc-700 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 uppercase">
                              MAINTENANCE
                            </span>
                          </div>
                          <span className="block text-xs font-bold text-zinc-700">{opt.label}</span>
                          <span className="block text-[10px] text-zinc-500 mt-0.5">
                            Under Maintenance
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!merchantConfig.upiId ? (
                  <div className="bg-amber-50 border border-amber-400 p-5 space-y-2 text-xs text-amber-950">
                    <div className="flex items-center gap-2 font-mono font-bold uppercase">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      UPI ID NOT CONFIGURED YET
                    </div>
                    <p className="leading-relaxed">
                      Please configure your Merchant UPI ID inside your private Owner Desk (
                      <strong>/lw-concierge</strong>) so customers see your live ₹3,000 PhonePe QR
                      code here.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#F7F7F7] border border-black/20 p-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white border border-black/15 p-3">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Scan to pay ₹3,000 via PhonePe or UPI"
                          className="w-44 h-44 object-contain"
                        />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-xs font-mono text-zinc-500">
                          Generating QR...
                        </div>
                      )}
                      <span className="font-mono text-[10px] text-zinc-600 uppercase mt-2">
                        SCAN WITH PHONEPE / GPAY / PAYTM
                      </span>
                    </div>

                    <div className="sm:col-span-7 space-y-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                          MERCHANT UPI ID
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="flex-1 bg-white border border-black/20 px-3 py-2 font-mono text-xs font-bold text-black select-all">
                            {merchantConfig.upiId}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-3 py-2 bg-black text-white font-mono text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            {copiedUpi ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                COPIED
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                COPY
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <a
                        href={upiDeepLink}
                        className="w-full py-3 px-4 bg-[#5F259F] hover:bg-[#4b1c80] text-white font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>OPEN PHONEPE / UPI APP (₹3,000)</span>
                      </a>

                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Pay exactly <strong>₹3,000</strong> via PhonePe, Google Pay, or Paytm, then
                        copy your <strong>12-digit UTR / Reference Number</strong> from your payment
                        receipt and enter it below.
                      </p>
                    </div>
                  </div>
                )}

                {/* 12-Digit UTR Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="vip-utr"
                    className="block text-xs font-bold uppercase tracking-[0.1em] text-black"
                  >
                    Enter 12-Digit UTR / UPI Transaction Reference Number *
                  </label>
                  <input
                    id="vip-utr"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={form.utrNumber}
                    onChange={(e) => handleChange('utrNumber', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('utrNumber')}
                    placeholder="e.g. 633012345678 (12 digits)"
                    className={`w-full h-12 px-4 bg-white border font-mono text-base tracking-widest text-black focus:outline-none ${
                      errors.utrNumber ? 'border-red-600' : 'border-black focus:border-[#5F259F]'
                    }`}
                  />
                  {errors.utrNumber && (
                    <p className="text-xs text-red-600 font-medium">{errors.utrNumber}</p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Your Digital VIP Card and SMS activate only after our team verifies this UTR
                    against the ₹3,000 credit.
                  </p>
                </div>

                {apiError && (
                  <div className="bg-red-50 border border-red-400 p-3 text-xs text-red-800 font-medium">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !merchantConfig.upiId}
                  className="w-full py-4 px-6 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>SUBMITTING UTR FOR VERIFICATION...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#D4AF37]" />
                      <span>SUBMIT ₹3,000 UTR &amp; REGISTER APPLICATION</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 3 && submittedRecord && (
              /* STEP 3: HONEST PENDING UTR VERIFICATION RECEIPT (NO FAKE PASS YET) */
              <div className="space-y-5 py-2">
                <div className="bg-[#111111] text-white p-6 border border-black space-y-3">
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                    <Clock className="w-3.5 h-3.5" />
                    PAYMENT VERIFICATION IN PROGRESS
                  </div>
                  <h3 className="font-display text-4xl font-extrabold uppercase">
                    THANK YOU, {submittedRecord.fullName}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Your application has been logged under{' '}
                    <strong className="text-white">{submittedRecord.applicationId}</strong> with
                    12-digit UTR{' '}
                    <strong className="font-mono text-[#D4AF37]">
                      {submittedRecord.utrNumber}
                    </strong>
                    .
                  </p>
                </div>

                <div className="bg-[#F5F5F5] border border-black/15 p-5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono text-zinc-600 uppercase">APPLICATION ID</span>
                    <span className="font-mono font-bold text-black">
                      {submittedRecord.applicationId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-zinc-600 uppercase">SUBMITTED UTR</span>
                    <span className="font-mono font-bold text-black">
                      {submittedRecord.utrNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-zinc-600 uppercase">HOODIE &amp; SIZE</span>
                    <span className="font-bold text-black">
                      {submittedRecord.hoodieSku} • Size {submittedRecord.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-zinc-600 uppercase">STATUS</span>
                    <span className="font-mono font-bold text-amber-700">
                      AWAITING ₹3,000 UTR CONFIRMATION
                    </span>
                  </div>
                </div>

                <div className="border border-black/15 p-4 text-xs text-zinc-700 leading-relaxed">
                  <strong className="text-black block uppercase font-mono text-[11px] mb-1">
                    WHAT HAPPENS NEXT?
                  </strong>
                  Our team matches your UTR (<strong>{submittedRecord.utrNumber}</strong>) with the
                  ₹3,000 PhonePe/UPI credit. As soon as confirmed, you will receive an{' '}
                  <strong>SMS on +91 {submittedRecord.phone}</strong> and you can unlock your
                  official <strong>Digital Thank You Card</strong> anytime using{' '}
                  <strong>{submittedRecord.applicationId}</strong> in the footer&apos;s{' '}
                  <em>Verify Pass</em> box.
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-[0.16em] hover:bg-zinc-800 cursor-pointer"
                >
                  DONE — RETURN TO ARCHIVE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

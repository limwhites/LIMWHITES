import React, { useEffect, useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Loader2,
  ArrowRight,
  AlertCircle,
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
}) {
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
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [redirecting, setRedirecting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialHoodieId) setHoodieId(initialHoodieId);
      if (initialSize) setSize(initialSize);
      setErrors({});
      setApiError('');
      setRedirecting(false);
    }
  }, [isOpen, initialHoodieId, initialSize]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !redirecting) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, redirecting, onClose]);

  if (!isOpen) return null;

  const selectedHoodie = HOODIES.find((h) => h.id === hoodieId) || HOODIES[0];
  const currentValuation = selectedHoodie.sizePrices[size] || selectedHoodie.sizePrices.S;

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim() || value.trim().length < 2) {
          return 'Please enter your full name (printed on your Digital VIP Card).';
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
          return 'Please enter your complete delivery address for insured vault dispatch.';
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
          return 'Please accept the Terms & Conditions to proceed to PhonePe.';
        }
        return '';
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

  const handleProceedToPhonePe = async (e) => {
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

    setRedirecting(true);
    setApiError('');

    try {
      const res = await fetch('/api/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.redirectUrl) {
        setRedirecting(false);
        setApiError(
          data.error ||
            'Unable to connect to PhonePe Payment Gateway. Ensure PhonePe Merchant credentials are configured on the server.'
        );
        return;
      }

      // Redirect customer to real PhonePe Payment Gateway URL for ₹3,000 payment
      window.location.href = data.redirectUrl;
    } catch {
      setRedirecting(false);
      setApiError(
        'Network or server error while initiating PhonePe ₹3,000 checkout. Please verify the server is running.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-form-title"
      onClick={() => !redirecting && onClose()}
    >
      <div
        className="relative bg-white w-full max-w-5xl max-h-[94vh] overflow-y-auto border border-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header + 2-Step Indicator */}
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
                VIP EARLY ACCESS APPLICATION (₹3,000 PHONEPE)
              </h2>
            </div>
            <button
              type="button"
              disabled={redirecting}
              onClick={onClose}
              aria-label="Close VIP application form"
              className="w-10 h-10 border border-white/25 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="py-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] bg-[#D4AF37] text-black flex items-center justify-between">
              <span>01 // DETAILS</span>
              <span>ACTIVE</span>
            </div>
            <div className="py-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] bg-white/10 text-zinc-300 flex items-center justify-between">
              <span>02 // PHONEPE ₹3,000</span>
              <span>NEXT</span>
            </div>
            <div className="py-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] bg-white/10 text-zinc-400 flex items-center justify-between">
              <span>03 // VERIFY &amp; PASS</span>
              <span>AUTO</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleProceedToPhonePe} noValidate className="grid grid-cols-1 lg:grid-cols-12">
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
                value={hoodieId}
                onChange={(e) => setHoodieId(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-black font-bold text-xs uppercase tracking-[0.06em] text-black focus:outline-none cursor-pointer"
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
                      onClick={() => setSize(sz)}
                      className={`py-2.5 border text-center transition-colors cursor-pointer ${
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
                  PHONEPE ENTRY FEE (DUE NOW)
                </span>
                <span className="font-display text-3xl font-extrabold text-black">
                  {formatINR(VIP_APPLICATION_FEE)}
                </span>
              </div>
              <div className="bg-[#F5F5F5] border border-black/15 px-3 py-2 text-[11px] font-mono text-zinc-700">
                Real-time PhonePe payment verification + instant SMS confirmation to your mobile.
              </div>
            </div>
          </div>

          {/* Right Panel: Applicant Form */}
          <div className="lg:col-span-7 p-5 sm:p-7 space-y-5">
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

            {/* Clean Legal T&C */}
            <div className="bg-[#F7F7F7] border border-black/20 p-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black">
                    TERMS &amp; ALLOTMENT NOTICE
                  </h4>
                  <p className="text-xs text-zinc-700 leading-relaxed mt-1">
                    Once VIP Early Access is allotted, we will inform you directly on your
                    registered Email &amp; Mobile number. Stock is limited to 09 units per piece;
                    the ₹3,000 VIP application fee is non-refundable if VIP access or allotment is
                    not granted.
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
                  I accept the Terms &amp; Conditions and understand allotment confirmation will be
                  shared on my contact details.{' '}
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
              <div className="bg-amber-50 border border-amber-400 p-4 flex items-start gap-3 text-xs text-amber-950">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-mono uppercase text-[11px] mb-0.5">
                    PHONEPE GATEWAY REQUIRED
                  </strong>
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {/* Next -> Redirect to Official PhonePe Payment Gateway */}
            <button
              type="submit"
              disabled={redirecting}
              className="w-full py-4 px-6 bg-[#5F259F] hover:bg-[#4b1c80] text-white font-bold text-xs uppercase tracking-[0.16em] transition-colors flex items-center justify-between cursor-pointer disabled:opacity-75"
            >
              {redirecting ? (
                <span className="flex items-center gap-2.5 mx-auto">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  REDIRECTING TO PHONEPE GATEWAY (₹3,000)...
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4" />
                    NEXT: PAY ₹3,000 VIA PHONEPE GATEWAY
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] font-mono text-center text-zinc-500">
              SECURED BY PHONEPE FOR BUSINESS • AUTO-REDIRECTS BACK FOR PASS VERIFICATION
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

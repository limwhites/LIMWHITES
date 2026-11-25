import React, { useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '../data/hoodies';
import { downloadThankYouCardPng } from '../utils/cardExporter';

export default function DigitalThankYouCardModal({ application, onClose }) {
  useEffect(() => {
    if (!application) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [application, onClose]);

  if (!application) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="digital-card-heading"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-black max-h-[94vh] overflow-y-auto p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-black/15">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              VIP APPLICATION REGISTERED • DIGITAL PASS ISSUED
            </div>
            <h2
              id="digital-card-heading"
              className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-black leading-none"
            >
              OFFICIAL DIGITAL THANK YOU CARD
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close digital thank you card"
            className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THE COLLECTIBLE DIGITAL VIP THANK YOU CARD */}
        <div className="relative bg-gradient-to-br from-[#09090B] via-[#141418] to-[#050507] text-white p-6 sm:p-9 border-2 border-[#D4AF37]/60 overflow-hidden shadow-2xl">
          {/* Decorative Adidas-inspired subtle 3 diagonal background bars */}
          <div
            className="pointer-events-none absolute -right-12 top-0 bottom-0 flex gap-6 opacity-[0.05]"
            aria-hidden="true"
          >
            <div className="w-8 h-[150%] bg-white -rotate-12 -translate-y-12" />
            <div className="w-8 h-[150%] bg-white -rotate-12 -translate-y-12" />
            <div className="w-8 h-[150%] bg-white -rotate-12 -translate-y-12" />
          </div>

          {/* Top Gold Strip */}
          <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#F7E8A4] to-[#B48A3E] mb-6" />

          {/* Card Header */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-[0.06em] uppercase">
                LIM WHITES × BAPE®
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                MOST TRUSTABLE VIP EARLY ACCESS PASS
              </div>
            </div>
            <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/60 px-3.5 py-2 text-left sm:text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#F5E6A8]">
                APPLICATION REFERENCE
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {application.applicationId}
              </div>
            </div>
          </div>

          {/* Personalized Customer Thank You */}
          <div className="relative py-6 border-b border-white/15">
            <div className="flex items-center gap-2 font-mono text-xs text-[#D4AF37] uppercase tracking-[0.16em] mb-1">
              <Sparkles className="w-4 h-4" />
              PERSONALIZED COLLECTOR ACKNOWLEDGEMENT
            </div>
            <h3 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
              THANK YOU, {application.fullName}
            </h3>
            <p className="text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Your VIP Early Access application has been officially verified and logged in the{' '}
              <strong className="text-white">LIM WHITES</strong> priority 09-unit registry under
              your name. Our concierge team will notify you on{' '}
              <span className="text-white font-semibold">{application.email}</span> and{' '}
              <span className="text-white font-semibold">+91 {application.phone}</span> regarding
              your allotment status.
            </p>
          </div>

          {/* Card Two-Column Details Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {/* Left: Reserved Hoodie Box */}
            <div className="bg-white/5 border border-white/15 p-4 sm:p-5 space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-bold">
                SELECTED EDITION (STOCK: 0{application.stock} • NOT FOR SALE)
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={application.hoodieImage}
                  alt={application.hoodieName}
                  className="w-20 h-24 object-cover bg-[#ECEFF1] border border-white/20 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-zinc-400">{application.hoodieSku}</div>
                  <div className="font-display text-xl font-bold uppercase text-white leading-tight">
                    {application.hoodieName}
                  </div>
                  <div className="text-xs text-zinc-300 mt-0.5">{application.colorway}</div>
                </div>
              </div>

              <div className="divide-y divide-white/10 border-t border-white/10 pt-2 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="font-mono text-zinc-400">CHOSEN SIZE</span>
                  <span className="font-mono font-bold text-white">SIZE {application.size}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-mono text-zinc-400">SIZE VALUATION</span>
                  <span className="font-mono font-bold text-white">
                    {formatINR(application.sizeValuation)}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-mono text-zinc-400">VIP ACCESS FEE PAID</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatINR(application.feePaid)} (VERIFIED)
                  </span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="font-mono text-zinc-400">PAYMENT METHOD</span>
                  <span className="font-mono font-bold text-white text-right">
                    {application.paymentMethodLabel}
                  </span>
                </div>
                {application.paymentReference && (
                  <div className="py-2 flex justify-between gap-2">
                    <span className="font-mono text-zinc-400">PHONEPE REF ID</span>
                    <span className="font-mono font-bold text-[#D4AF37] text-right">
                      {application.paymentReference}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Customer Submitted Credentials */}
            <div className="bg-white/5 border border-white/15 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-bold mb-3">
                  VERIFIED APPLICANT DETAILS
                </div>
                <dl className="divide-y divide-white/10 text-xs">
                  <div className="py-2 flex justify-between gap-3">
                    <dt className="font-mono text-zinc-400 shrink-0">APPLICANT NAME</dt>
                    <dd className="font-bold text-white text-right">{application.fullName}</dd>
                  </div>
                  <div className="py-2 flex justify-between gap-3">
                    <dt className="font-mono text-zinc-400 shrink-0">EMAIL</dt>
                    <dd className="font-semibold text-white text-right break-all">
                      {application.email}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between gap-3">
                    <dt className="font-mono text-zinc-400 shrink-0">MOBILE</dt>
                    <dd className="font-mono font-semibold text-white text-right">
                      +91 {application.phone}
                    </dd>
                  </div>
                  {application.instagram && (
                    <div className="py-2 flex justify-between gap-3">
                      <dt className="font-mono text-zinc-400 shrink-0">SOCIAL HANDLE</dt>
                      <dd className="font-mono text-white text-right">{application.instagram}</dd>
                    </div>
                  )}
                  <div className="py-2 flex justify-between gap-3">
                    <dt className="font-mono text-zinc-400 shrink-0">PROFILE TIER</dt>
                    <dd className="font-semibold text-white text-right">
                      {application.collectorTier}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between gap-3">
                    <dt className="font-mono text-zinc-400 shrink-0">DELIVERY ADDRESS</dt>
                    <dd className="text-zinc-200 text-right">
                      {application.address}, {application.city}, {application.state} -{' '}
                      {application.pincode}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between gap-3">
                    <dt className="font-mono text-zinc-400 shrink-0">TIMESTAMP</dt>
                    <dd className="font-mono text-zinc-300 text-right">
                      {application.submittedAtFormatted}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Card Bottom Stamp & Barcode */}
          <div className="relative pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-white/5 border border-white/15 px-3.5 py-2.5 text-[11px] text-zinc-300 leading-relaxed max-w-xl">
              <strong className="font-mono text-[#D4AF37] uppercase block">
                VIP ALLOTMENT NOTICE • T&amp;C ACCEPTED
              </strong>
              Once VIP Early Access is allotted, we will inform you directly on your registered
              contact. Application fee (₹3,000) is non-refundable if not allotted.
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="font-mono text-[10px] text-[#D4AF37] uppercase flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  LIM WHITES VERIFIED
                </div>
                <div className="font-mono text-[10px] text-zinc-400 mt-0.5">
                  {application.applicationId}
                </div>
              </div>
              {/* Crisp SVG Barcode */}
              <svg
                width="86"
                height="36"
                viewBox="0 0 86 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="bg-white p-1"
              >
                {[2, 6, 9, 14, 17, 21, 26, 29, 34, 39, 43, 47, 52, 56, 61, 66, 70, 75, 79].map(
                  (x, i) => (
                    <rect
                      key={x}
                      x={x}
                      y="2"
                      width={i % 3 === 0 ? 3 : 1.5}
                      height="32"
                      fill="#000000"
                    />
                  )
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Actions Below Card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => downloadThankYouCardPng(application)}
              className="px-6 py-3.5 bg-black text-white font-bold text-xs uppercase tracking-[0.16em] hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>DOWNLOAD DIGITAL CARD (.PNG)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-3.5 border border-black text-black font-bold text-xs uppercase tracking-[0.16em] hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / SAVE PDF</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 bg-[#ECEFF1] text-black font-bold text-xs uppercase tracking-[0.16em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>BACK TO ARCHIVE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

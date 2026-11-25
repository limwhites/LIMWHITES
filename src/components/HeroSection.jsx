import React from 'react';
import { ArrowRight, ShieldCheck, Lock, Sparkles, CheckCircle2, Flame } from 'lucide-react';

export default function HeroSection({ onExplore, onOpenApply }) {
  return (
    <section className="relative bg-[#0B0B0D] text-white overflow-hidden">
      {/* Background campaign image with dark editorial gradient mask */}
      <div className="absolute inset-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-vault.jpg`}
          alt="LIM WHITES x BAPE Vault Archive Collection"
          className="w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 md:py-24">
        <div className="max-w-3xl space-y-6">
          {/* Trust & 2-Day Window Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-3.5 py-2">
              <Sparkles className="w-4 h-4" strokeWidth={2.2} />
              <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.16em]">
                APPLY NOW • OFFER VALID FOR 2 DAYS ONLY
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-2">
              <Flame className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white">
                HIGH DEMAND • ZERO RESTOCKS
              </span>
            </div>
          </div>

          {/* Massive Adidas-inspired Flagship Display Typography */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-[84px] font-extrabold uppercase leading-[0.92] tracking-[0.01em]">
            LIM WHITES × BAPE®
            <span className="block text-[#D4AF37] mt-1">OWN ONE OF ONLY 09</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-200 max-w-2xl leading-relaxed">
            Never sold in retail stores—yet{' '}
            <strong className="text-white">
              you can personally own and wear one of these 5 archival hoodies
            </strong>
            . Strictly <strong className="text-white">09 numbered pieces per design</strong>{' '}
            (#01/09–#09/09). Apply for VIP Early Access in{' '}
            <strong className="text-white">60 seconds</strong> to unlock direct ownership priority.
          </p>

          {/* Key Capsule Rules Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 max-w-2xl">
            <div className="bg-white/5 border border-white/15 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                STRICT EDITION CAP
              </div>
              <div className="font-display text-2xl font-bold tracking-wide text-white mt-0.5">
                09 UNITS ONLY
              </div>
            </div>
            <div className="bg-white/5 border border-white/15 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                PUBLIC RETAIL
              </div>
              <div className="font-display text-2xl font-bold tracking-wide text-white mt-0.5">
                NOT FOR SALE
              </div>
            </div>
            <div className="bg-white/5 border border-white/15 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                OWNERSHIP TIER
              </div>
              <div className="font-display text-2xl font-bold tracking-wide text-white mt-0.5">
                ₹35K – ₹45K
              </div>
            </div>
            <div className="bg-white/5 border border-white/15 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                VIP ENTRY FEE
              </div>
              <div className="font-display text-2xl font-bold tracking-wide text-[#D4AF37] mt-0.5">
                ₹3,000 ONLY
              </div>
            </div>
          </div>

          {/* Adidas-style sharp layered CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
            <button
              type="button"
              onClick={onOpenApply}
              className="group inline-flex items-center justify-between gap-5 bg-[#D4AF37] text-black px-7 py-4 font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#e5c14d] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" strokeWidth={2.2} />
                APPLY IN 60 SECONDS (₹3,000)
              </span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </button>

            <button
              type="button"
              onClick={onExplore}
              className="group relative inline-flex items-center justify-between gap-5 bg-white text-black px-7 py-4 font-bold text-xs uppercase tracking-[0.18em] hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <span>INSPECT THE 05 HOODIES</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </button>
          </div>

          {/* 3-Step Fast Ownership Assurance Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-2xl text-xs">
            <div className="flex items-start gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white block">1. Pick Your Hoodie &amp; Size</strong>
                Choose S–XXL &amp; see exact ownership tier.
              </span>
            </div>
            <div className="flex items-start gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white block">2. Lock VIP Entry (₹3,000)</strong>
                Instant Digital VIP Pass in 60 seconds.
              </span>
            </div>
            <div className="flex items-start gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white block">3. Get Allotted &amp; Own It</strong>
                We contact you directly for vault delivery.
              </span>
            </div>
          </div>

          <p className="font-mono text-[11px] text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            Upon VIP Early Access allotment, our team will notify you directly on your registered
            contact details.
          </p>
        </div>
      </div>
    </section>
  );
}

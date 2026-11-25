import React, { useEffect, useState } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, ChevronDown, AlertCircle, Check } from 'lucide-react';
import {
  SIZE_OPTIONS,
  SIZE_DESCRIPTIONS,
  VIP_APPLICATION_FEE,
  formatINR,
} from '../data/hoodies';

export default function ProductDetailModal({
  hoodie,
  selectedSize,
  onSelectSize,
  onClose,
  onApplyVip,
}) {
  const [activeTab, setActiveTab] = useState('studio');
  const [openAccordion, setOpenAccordion] = useState('highlights');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!hoodie) return null;

  const activePrice = hoodie.sizePrices[selectedSize];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-black grid grid-cols-1 lg:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product detail view"
          className="sticky lg:absolute top-3 right-3 z-20 ml-auto mr-3 mt-3 lg:m-0 w-10 h-10 bg-white border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Studio Media & Spec Matrix */}
        <div className="lg:col-span-7 bg-[#ECEFF1] p-5 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black/15">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-black text-white font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-[0.14em]">
                  STOCK: 0{hoodie.stock} / 09
                </span>
                <span className="bg-white text-black border border-black/25 font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-[0.14em]">
                  NOT FOR SALE
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-zinc-700">
                {hoodie.serialRange}
              </span>
            </div>

            {activeTab === 'studio' && (
              <div className="relative bg-white/60 border border-black/10 aspect-[4/4.2] flex items-center justify-center overflow-hidden">
                <img
                  src={hoodie.image}
                  alt={hoodie.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-4 left-4 bg-black text-white font-mono text-[11px] px-3 py-1.5 uppercase tracking-[0.14em]">
                  {hoodie.gsm}
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="bg-white border border-black/15 p-6 space-y-4">
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
                  OFFICIAL SIZE-BASED VALUATION SCHEDULE (₹35,000 – ₹45,000)
                </div>
                <h3 className="font-display text-3xl font-extrabold uppercase text-black">
                  LARGER SIZE ALLOCATION PRICING
                </h3>
                <p className="text-sm text-zinc-600">
                  Select any size row below to update your reservation valuation. Pricing steps up
                  from Small to XXL based on vault pattern scarcity.
                </p>
                <div className="divide-y divide-black/10 border border-black/15">
                  {SIZE_OPTIONS.map((sz) => {
                    const isSel = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onSelectSize(hoodie.id, sz)}
                        className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isSel ? 'bg-black text-white' : 'bg-white hover:bg-zinc-50 text-black'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-sm font-bold">SIZE {sz}</span>
                          <span
                            className={`block text-xs ${
                              isSel ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {SIZE_DESCRIPTIONS[sz]}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-2xl font-bold">
                            {formatINR(hoodie.sizePrices[sz])}
                          </span>
                          <span
                            className={`block font-mono text-[10px] uppercase ${
                              isSel ? 'text-[#D4AF37]' : 'text-zinc-500'
                            }`}
                          >
                            {isSel ? 'SELECTED' : 'CLICK TO SELECT'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-white border border-black/15 p-6 space-y-4">
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
                  PROVENANCE &amp; TECHNICAL ARCHIVE DOSSIER
                </div>
                <h3 className="font-display text-3xl font-extrabold uppercase text-black">
                  {hoodie.sku} // AUTHENTICITY SPEC
                </h3>
                <dl className="divide-y divide-black/10 border-y border-black/10 text-sm">
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="font-mono text-xs text-zinc-500 uppercase">COLLABORATION</dt>
                    <dd className="font-bold text-black text-right">LIM WHITES × BAPE®</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="font-mono text-xs text-zinc-500 uppercase">EDITION CAP</dt>
                    <dd className="font-bold text-black text-right">09 NUMBERED UNITS ONLY</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="font-mono text-xs text-zinc-500 uppercase">FABRIC WEIGHT</dt>
                    <dd className="font-bold text-black text-right">{hoodie.gsm}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="font-mono text-xs text-zinc-500 uppercase">COLORWAY</dt>
                    <dd className="font-bold text-black text-right">{hoodie.colorway}</dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="font-mono text-xs text-zinc-500 uppercase">SALE POLICY</dt>
                    <dd className="font-bold text-black text-right">
                      NOT FOR SALE (VIP ACCESS ONLY)
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Left view switch tabs */}
          <div className="grid grid-cols-3 gap-2 pt-5">
            {[
              { id: 'studio', label: '01 STUDIO VIEW' },
              { id: 'pricing', label: '02 SIZE PRICING' },
              { id: 'specs', label: '03 ARCHIVE SPECS' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black/20 hover:border-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Adidas PDP Purchase/Allocation Panel */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-1">
                {hoodie.editionTag} • {hoodie.sku}
              </div>
              <h2
                id="pdp-title"
                className="font-display text-3xl sm:text-4xl font-extrabold uppercase leading-none text-black"
              >
                {hoodie.name}
              </h2>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{hoodie.description}</p>
            </div>

            {/* Ownership Clarity + Stock 09 Info Strip */}
            <div className="bg-[#F5F5F5] border border-black/15 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-black uppercase font-mono block">
                    09 NUMBERED PIECES • YOU CAN OWN THIS EDITION
                  </strong>
                  <span className="text-zinc-700">
                    Not sold publicly—apply for VIP Early Access (₹3,000) to claim priority to
                    purchase &amp; own one of these 09 serialized pieces directly.
                  </span>
                </div>
              </div>

              {/* 01/09 to 09/09 Collector Serial Slots */}
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
                  <span>VAULT SERIAL SLOTS (#01/09 – #09/09)</span>
                  <span className="text-black font-bold">ZERO RESTOCKS</span>
                </div>
                <div className="grid grid-cols-9 gap-1">
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09'].map((num) => (
                    <div
                      key={num}
                      className="bg-black text-white font-mono text-[10px] font-bold py-1 text-center"
                    >
                      #{num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Size Matrix with Live Price Inside Each Tile */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-black">
                  SELECT SIZE (VALUATION INCREASES WITH SIZE)
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {SIZE_OPTIONS.map((sz) => {
                  const isActive = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onSelectSize(hoodie.id, sz)}
                      aria-pressed={isActive}
                      className={`py-2.5 px-2 border text-center transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-black/25 hover:border-black'
                      }`}
                    >
                      <span className="block font-mono text-sm font-bold">{sz}</span>
                      <span
                        className={`block font-mono text-[10px] mt-0.5 ${
                          isActive ? 'text-[#D4AF37]' : 'text-zinc-600'
                        }`}
                      >
                        {formatINR(hoodie.sizePrices[sz])}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="font-mono text-[11px] text-zinc-600 mt-2">
                Fit Guide: {SIZE_DESCRIPTIONS[selectedSize]}
              </p>
            </div>

            {/* Price Summary Box */}
            <div className="border-y border-black/15 py-4 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-600">
                  HOODIE ALLOCATION VALUATION (SIZE {selectedSize})
                </span>
                <span className="font-display text-3xl font-extrabold text-black">
                  {formatINR(activePrice)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-600">
                  VIP EARLY ACCESS APPLICATION FEE (DUE NOW)
                </span>
                <span className="font-display text-2xl font-extrabold text-[#B48A3E]">
                  {formatINR(VIP_APPLICATION_FEE)}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">
                * Upon VIP Early Access allotment, you will be notified directly on your contact.
                Fee is non-refundable if not allotted.
              </p>
            </div>

            {/* Primary Adidas-style Full-Width VIP Action Button */}
            <button
              type="button"
              onClick={() => onApplyVip(hoodie.id, selectedSize)}
              className="w-full py-4 px-6 bg-black text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                APPLY FOR VIP ACCESS — {formatINR(VIP_APPLICATION_FEE)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Seal */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-600">
              <ShieldCheck className="w-4 h-4 text-black shrink-0" />
              <span>LIM WHITES VERIFIED AUTHENTICITY • SERIALIZED 09-UNIT DROP</span>
            </div>

            {/* Accordions */}
            <div className="divide-y divide-black/15 border-t border-black/15 pt-1">
              {[
                {
                  id: 'highlights',
                  title: 'PRODUCT HIGHLIGHTS & FABRIC',
                  content: (
                    <ul className="space-y-1.5 text-xs text-zinc-600">
                      {hoodie.highlights.map((hl) => (
                        <li key={hl} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: 'nonrefundable',
                  title: 'VIP ALLOTMENT & TERMS',
                  content: (
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Stock is strictly limited to 09 units per hoodie. Once VIP Early Access is
                      allotted, our concierge informs you directly on your registered email &amp;
                      mobile. The ₹3,000 VIP application fee is non-refundable if VIP access or
                      stock allotment is not granted.
                    </p>
                  ),
                },
              ].map((acc) => {
                const isOpen = openAccordion === acc.id;
                return (
                  <div key={acc.id}>
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? '' : acc.id)}
                      className="w-full py-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-[0.12em] text-black cursor-pointer"
                    >
                      <span>{acc.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && <div className="pb-4">{acc.content}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

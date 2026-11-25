import React, { useMemo, useState } from 'react';
import { ArrowRight, Eye, Lock, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import { SIZE_OPTIONS, VIP_APPLICATION_FEE, formatINR } from '../data/hoodies';

const CATEGORIES = ['ALL', 'Shark Zip', 'Split Camo', 'Archive Crest'];

export default function CatalogSection({
  hoodies,
  searchQuery,
  setSearchQuery,
  selectedSizes,
  onSelectSize,
  onSelectGlobalSize,
  onOpenDetail,
  onOpenApply,
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  const [globalSize, setGlobalSize] = useState('S');

  const filteredHoodies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = hoodies.filter((h) => {
      const catMatch = activeCategory === 'ALL' || h.category === activeCategory;
      const queryMatch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.sku.toLowerCase().includes(q) ||
        h.colorway.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort(
        (a, b) => a.sizePrices[selectedSizes[a.id] || 'S'] - b.sizePrices[selectedSizes[b.id] || 'S']
      );
    } else if (sortBy === 'price-desc') {
      list = [...list].sort(
        (a, b) => b.sizePrices[selectedSizes[b.id] || 'S'] - a.sizePrices[selectedSizes[a.id] || 'S']
      );
    }

    return list;
  }, [hoodies, activeCategory, searchQuery, sortBy, selectedSizes]);

  const handleGlobalSizeChange = (sz) => {
    setGlobalSize(sz);
    onSelectGlobalSize(sz);
  };

  return (
    <section id="catalog" className="bg-white py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Adidas PLP Top Heading & Breadcrumb */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black/15 pb-8 mb-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">
              HOME / LIM WHITES ARCHIVE / BAPE® COLLABORATION (05)
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black">
              BAPE® COLLAB LIMITED HOODIES
              <span className="ml-3 font-mono text-sm font-bold align-middle text-zinc-500">
                [{filteredHoodies.length.toString().padStart(2, '0')}]
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 mt-2 max-w-2xl">
              Strictly <strong className="text-black">09 units</strong> per hoodie •{' '}
              <strong className="text-black">Not For General Sale</strong> • Valuation scales from{' '}
              <strong className="text-black">₹35,000 to ₹45,000</strong> by size. Apply for VIP
              Early Access at <strong className="text-black">₹3,000</strong>.
            </p>
          </div>

          {/* Global Size Switcher to demonstrate dynamic size-tiered pricing live */}
          <div className="bg-[#ECEFF1] p-4 border border-black/10 shrink-0">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-black flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                COMPARE ALL BY SIZE
              </span>
              <span className="font-mono text-[10px] text-zinc-600 uppercase">
                BIGGER SIZE = HIGHER TIER
              </span>
            </div>
            <div className="flex items-center gap-1.5" role="group" aria-label="Global size preview">
              {SIZE_OPTIONS.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleGlobalSizeChange(sz)}
                  className={`h-9 min-w-[44px] px-3 font-mono text-xs font-bold border transition-colors cursor-pointer ${
                    globalSize === sz
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black/20 hover:border-black'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter & Sort Toolbar (Adidas PLP style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black/20 hover:border-black'
                }`}
              >
                {cat === 'ALL' ? 'ALL 05 DROPS' : cat}
              </button>
            ))}

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-zinc-100 text-xs font-mono text-black border border-black/20 hover:bg-zinc-200 cursor-pointer"
              >
                SEARCH: &ldquo;{searchQuery.trim()}&rdquo;
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
            <label htmlFor="catalog-sort" className="sr-only">
              Sort archive hoodies
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 bg-white border border-black/25 text-xs font-bold uppercase tracking-[0.1em] text-black focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="default">SORT: ARCHIVE ORDER</option>
              <option value="price-asc">VALUATION: LOW TO HIGH</option>
              <option value="price-desc">VALUATION: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredHoodies.length === 0 ? (
          <div className="bg-[#ECEFF1] p-12 text-center border border-black/15">
            <p className="font-display text-3xl font-bold uppercase text-black mb-2">
              NO ARCHIVE HOODIES MATCH YOUR SEARCH
            </p>
            <p className="text-sm text-zinc-600 mb-6">
              Try clearing your filter or search query to inspect all 5 BAPE® Limited 09 pieces.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHoodies.map((hoodie) => {
              const currentSize = selectedSizes[hoodie.id] || 'S';
              const currentPrice = hoodie.sizePrices[currentSize];
              const minPrice = hoodie.sizePrices.S;
              const maxPrice = hoodie.sizePrices.XXL;

              return (
                <article
                  key={hoodie.id}
                  className="group border border-black/15 hover:border-black bg-white flex flex-col justify-between transition-colors"
                >
                  {/* Top Studio Media Container */}
                  <div>
                    <div
                      onClick={() => onOpenDetail(hoodie.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenDetail(hoodie.id);
                        }
                      }}
                      aria-label={`View details for ${hoodie.name}`}
                      className="relative bg-[#ECEFF1] aspect-[4/4.3] overflow-hidden cursor-pointer"
                    >
                      <img
                        src={hoodie.image}
                        alt={hoodie.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />

                      {/* Top Badges: Stock 09 + High Demand / Not For Sale */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
                        <span className="bg-black text-white font-mono text-[11px] font-bold px-2.5 py-1 tracking-[0.14em] uppercase">
                          ONLY 0{hoodie.stock} LEFT • NO RESTOCK
                        </span>
                        <span className="bg-white/95 text-black border border-black/20 font-mono text-[11px] font-bold px-2.5 py-1 tracking-[0.14em] uppercase">
                          NOT FOR SALE
                        </span>
                      </div>

                      {/* Bottom Studio Tag + Quick Inspect */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="bg-white/95 backdrop-blur-sm text-black font-mono text-[10px] font-bold px-2.5 py-1 tracking-[0.12em] uppercase border border-black/15">
                          {hoodie.editionTag}
                        </span>
                        <span className="bg-black/90 text-white font-mono text-[10px] font-bold px-2.5 py-1 tracking-[0.12em] uppercase inline-flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          <Eye className="w-3 h-3" />
                          INSPECT
                        </span>
                      </div>
                    </div>

                    {/* Product Info Body */}
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-500 mb-1">
                          <span>{hoodie.sku}</span>
                          <span>LIMITED 09 UNITS</span>
                        </div>
                        <h3
                          onClick={() => onOpenDetail(hoodie.id)}
                          className="font-display text-2xl font-extrabold uppercase tracking-tight text-black hover:underline cursor-pointer leading-tight"
                        >
                          {hoodie.name}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1">{hoodie.colorway}</p>
                      </div>

                      {/* Size Selector Matrix right on card */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.12em] mb-2">
                          <span className="text-zinc-600 font-bold">SELECT SIZE (PRICE TIER)</span>
                          <span className="text-black font-bold">
                            {formatINR(minPrice)} – {formatINR(maxPrice)}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {SIZE_OPTIONS.map((sz) => {
                            const active = currentSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => onSelectSize(hoodie.id, sz)}
                                aria-pressed={active}
                                className={`py-2 text-center border transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black border-black/20 hover:border-black'
                                }`}
                              >
                                <span className="block font-mono text-xs font-bold leading-none">
                                  {sz}
                                </span>
                                <span
                                  className={`block font-mono text-[9px] mt-1 leading-none ${
                                    active ? 'text-[#D4AF37]' : 'text-zinc-500'
                                  }`}
                                >
                                  ₹{(hoodie.sizePrices[sz] / 1000).toFixed(1).replace('.0', '')}k
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Valuation & VIP Application Fee Breakdown */}
                      <div className="bg-[#F5F5F5] border border-black/10 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                              SIZE {currentSize} OWNERSHIP TIER
                            </div>
                            <div className="font-display text-3xl font-extrabold text-black leading-none mt-0.5">
                              {formatINR(currentPrice)}
                            </div>
                            <div className="font-mono text-[10px] text-zinc-700 font-bold uppercase mt-1">
                              OWNABLE VIA VIP ALLOTMENT
                            </div>
                          </div>
                          <div className="text-right border-l border-black/15 pl-3">
                            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                              VIP ACCESS FEE
                            </div>
                            <div className="font-display text-2xl font-extrabold text-black leading-none mt-0.5">
                              {formatINR(VIP_APPLICATION_FEE)}
                            </div>
                            <div className="font-mono text-[10px] text-[#B48A3E] font-bold uppercase mt-1">
                              60-SEC ENTRY
                            </div>
                          </div>
                        </div>

                        {/* Visual 09-Unit Scarcity Bar */}
                        <div>
                          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-zinc-600 mb-1">
                            <span>EDITION CAP: 09 PIECES</span>
                            <span className="text-black font-bold">HIGH DEMAND</span>
                          </div>
                          <div className="grid grid-cols-9 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => (
                              <span
                                key={slot}
                                className="h-1.5 bg-black/85 block"
                                title={`Vault Serial #0${slot}/09`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTAs */}
                  <div className="px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(hoodie.id)}
                      className="sm:col-span-2 py-3.5 px-3 border border-black text-black text-xs font-bold uppercase tracking-[0.14em] hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      DETAILS
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenApply(hoodie.id, currentSize)}
                      className="sm:col-span-3 py-3.5 px-4 bg-black text-white text-xs font-bold uppercase tracking-[0.14em] hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>APPLY FOR VIP ACCESS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}

            {/* 6th Architectural Grid Slot: Balances 5 items cleanly on 3-column desktop */}
            {activeCategory === 'ALL' && !searchQuery.trim() && (
              <aside className="bg-black text-white border border-black p-7 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.16em]">
                    LIM WHITES CONCIERGE // VIP PROTOCOL
                  </div>
                  <h3 className="font-display text-4xl font-extrabold uppercase leading-none">
                    HOW VIP EARLY ACCESS WORKS
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Because only <strong className="text-white">09 pieces</strong> exist for each
                    of our 5 BAPE® Archive hoodies, public checkout is permanently locked.
                  </p>
                  <ul className="space-y-3 pt-2 text-xs font-mono text-zinc-200">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#D4AF37] font-bold">01.</span>
                      <span>Choose your hoodie &amp; preferred size (₹35,000 to ₹45,000 tier).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#D4AF37] font-bold">02.</span>
                      <span>Submit your verified VIP details &amp; ₹3,000 VIP application fee.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#D4AF37] font-bold">03.</span>
                      <span>
                        Instantly receive your personalized{' '}
                        <strong className="text-white">Digital VIP Thank You Card</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#D4AF37] font-bold">04.</span>
                      <span className="text-zinc-300">
                        Upon allotment, you are notified directly on your registered Email &amp;
                        Mobile.
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenApply(hoodies[0].id, selectedSizes[hoodies[0].id] || 'S')}
                  className="mt-8 w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>START VIP APPLICATION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </aside>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

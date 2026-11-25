import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, Ticket, Menu, X, Clock } from 'lucide-react';

const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
const OFFER_END_KEY = 'lim_whites_offer_end_ts_v1';

function useOfferCountdown() {
  const [remaining, setRemaining] = useState(TWO_DAYS_MS - 1000);

  useEffect(() => {
    let endTs;
    try {
      const saved = localStorage.getItem(OFFER_END_KEY);
      if (saved && Number(saved) > Date.now()) {
        endTs = Number(saved);
      } else {
        endTs = Date.now() + TWO_DAYS_MS;
        localStorage.setItem(OFFER_END_KEY, String(endTs));
      }
    } catch {
      endTs = Date.now() + TWO_DAYS_MS;
    }

    const update = () => {
      const diff = Math.max(0, endTs - Date.now());
      setRemaining(diff);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(2, '0');
  const mins = String(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
  const secs = String(Math.floor((remaining % (1000 * 60)) / 1000)).padStart(2, '0');
  return `${hours}H : ${mins}M : ${secs}S`;
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  passesCount,
  onOpenPasses,
  onOpenApply,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const countdown = useOfferCountdown();

  const navLinks = [
    { label: '05 DROPS', href: '#catalog' },
    { label: 'BAPE® COLLAB', href: '#catalog' },
    { label: 'TRUST & AUTH', href: '#trust' },
    { label: 'NON-REFUNDABLE T&C', href: '#policy' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-black/15">
      {/* Highlighted Moving Offer Row: APPLY NOW — OFFER VALID FOR 2 DAYS ONLY */}
      <div
        onClick={onOpenApply}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenApply();
          }
        }}
        aria-label="Apply Now - Offer Valid for 2 Days Only"
        className="bg-black text-white border-b border-[#D4AF37]/40 overflow-hidden cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee py-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-8 px-4">
                  <span className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-2.5 py-0.5 font-extrabold">
                    APPLY NOW • OFFER VALID FOR 2 DAYS ONLY
                  </span>
                  <span>LIM WHITES × BAPE® LIMITED ARCHIVE</span>
                  <span>STRICTLY 09 UNITS PER HOODIE</span>
                  <span className="text-[#D4AF37]">ARCHIVE ONLY • NOT FOR SALE</span>
                  <span>VIP EARLY ACCESS FEE: ₹3,000</span>
                  <span className="inline-flex items-center gap-2 bg-white text-black px-2.5 py-0.5 font-extrabold">
                    APPLY NOW • OFFER VALID FOR 2 DAYS ONLY
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 font-mono text-[11px] font-extrabold tracking-[0.14em] shrink-0">
            <Clock className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>2 DAYS ONLY • {countdown}</span>
          </div>
        </div>
      </div>

      {/* Main utility + nav header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Brand Emblem & Wordmark */}
        <a
          href="#"
          className="flex items-center gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label="LIM WHITES Home"
        >
          <svg
            width="36"
            height="28"
            viewBox="0 0 36 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <polygon points="3,26 9,26 14,15 8,15" fill="#000000" />
            <polygon points="13,26 19,26 26,9 20,9" fill="#000000" />
            <polygon points="23,26 29,26 35,3 29,3" fill="#000000" />
          </svg>
          <div className="leading-none">
            <div className="font-display text-2xl md:text-[26px] font-extrabold tracking-[0.06em] uppercase text-black">
              LIM WHITES
            </div>
            <div className="font-mono text-[9px] tracking-[0.22em] text-zinc-600 uppercase flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-black" strokeWidth={2} />
              VIP ARCHIVE VAULT
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-bold tracking-[0.14em] uppercase text-black hover:text-zinc-600 transition-colors py-2 border-b-2 border-transparent hover:border-black"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenApply}
            className="text-xs font-bold tracking-[0.14em] uppercase bg-black text-white px-4 py-2 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            APPLY VIP ACCESS
          </button>
        </nav>

        {/* Right Controls: Search + VIP Pass Vault */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center bg-[#ECEFF1] border border-transparent focus-within:border-black px-3 h-10 w-44 md:w-56 transition-colors">
            <Search className="w-4 h-4 text-zinc-600 shrink-0" strokeWidth={1.75} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BAPE drops..."
              aria-label="Search BAPE collab hoodies"
              className="w-full bg-transparent pl-2.5 text-xs font-medium text-black placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onOpenPasses}
            className="relative h-10 px-3 sm:px-4 border border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase cursor-pointer"
            aria-label="Open My VIP Passes"
          >
            <Ticket className="w-4 h-4" strokeWidth={1.75} />
            <span className="hidden md:inline">MY VIP PASS</span>
            {passesCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#D4AF37] text-black font-mono text-[11px] font-bold">
                {passesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden h-10 w-10 border border-black/20 flex items-center justify-center text-black cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-black/15 px-4 py-5 space-y-4">
          <div className="bg-[#D4AF37] text-black px-3 py-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] flex items-center justify-between">
            <span>APPLY NOW • 2 DAYS ONLY</span>
            <span>{countdown}</span>
          </div>
          <div className="flex items-center bg-[#ECEFF1] px-3 h-11">
            <Search className="w-4 h-4 text-zinc-600 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BAPE hoodies, SKU..."
              aria-label="Search hoodies on mobile"
              className="w-full bg-transparent pl-2.5 text-sm text-black focus:outline-none"
            />
          </div>
          <div className="flex flex-col divide-y divide-black/10">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-bold tracking-[0.14em] uppercase text-black"
              >
                {item.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenApply();
            }}
            className="w-full py-3.5 bg-black text-white text-xs font-bold tracking-[0.18em] uppercase cursor-pointer"
          >
            APPLY FOR VIP ACCESS (₹3,000 FEE)
          </button>
        </div>
      )}
    </header>
  );
}

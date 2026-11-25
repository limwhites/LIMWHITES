import React, { useState } from 'react';
import { ShieldCheck, Search, ArrowRight } from 'lucide-react';

export default function Footer({
  passes,
  onLookupPass,
  onOpenTerms,
  onOpenPrivacy,
  onOpenContact,
  onOpenApply,
}) {
  const [lookupId, setLookupId] = useState('');
  const [lookupMsg, setLookupMsg] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    const query = lookupId.trim().toLowerCase();
    if (!query) {
      setLookupMsg('Enter your Application ID (e.g. LW-VIP-2026-...) or email address.');
      return;
    }

    // First check server for live approval status
    try {
      const res = await fetch(`/api/pass-lookup?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.application;
        if (found) {
          if (found.paymentStatus === 'PAID') {
            setLookupMsg('');
            onLookupPass(found);
            return;
          }
          if (found.paymentStatus === 'UTR_SUBMITTED') {
            setLookupMsg(
              `UTR ${found.utrNumber} is currently under payment verification. Once approved, your Digital Card unlocks here.`
            );
            return;
          }
          setLookupMsg('Payment for this entry could not be verified.');
          return;
        }
      }
    } catch {
      // Fallback to locally stored verified passes
    }

    const foundLocal = passes.find(
      (p) =>
        (p.paymentStatus === 'PAID' || !p.paymentStatus) &&
        (p.applicationId.toLowerCase() === query || p.email.toLowerCase() === query)
    );
    if (foundLocal) {
      setLookupMsg('');
      onLookupPass(foundLocal);
    } else {
      setLookupMsg(
        'No verified VIP Pass found for that ID or Email. Please ensure your ₹3,000 UTR is verified.'
      );
    }
  };

  return (
    <footer className="bg-black text-white border-t border-white/15">
      {/* Top Retrieval & CTA Band */}
      <div className="bg-[#111111] border-b border-white/10 py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF37] mb-1">
              INSTANT PASS VERIFICATION
            </div>
            <h3 className="font-display text-3xl font-extrabold uppercase tracking-wide">
              RETRIEVE YOUR DIGITAL THANK YOU CARD
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Already applied? Enter your Application ID or Email to reopen and download your
              personalized VIP Pass.
            </p>
          </div>

          <form onSubmit={handleLookup} className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex items-center bg-white text-black min-w-[260px] sm:min-w-[320px]">
                <Search className="w-4 h-4 text-zinc-500 ml-3 shrink-0" />
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => {
                    setLookupId(e.target.value);
                    setLookupMsg('');
                  }}
                  placeholder="LW-VIP-2026-XXXX or email"
                  aria-label="Lookup VIP pass by application ID or email"
                  className="w-full h-11 px-3 text-xs font-mono text-black focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.16em] hover:bg-[#e5c14d] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>VERIFY PASS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {lookupMsg && <p className="text-xs text-red-400 font-mono mt-2">{lookupMsg}</p>}
          </form>
        </div>
      </div>

      {/* Adidas-style Structured Columns */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="font-display text-3xl font-extrabold tracking-[0.06em] uppercase">
            LIM WHITES
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Most Trustable VIP Early Access Vault for Limited Streetwear Collaborations. Every
            piece is serialized 01/09–09/09 and strictly Not For General Sale.
          </p>
          <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            VERIFIED AUTHENTIC ARCHIVE
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white mb-4">
            BAPE® COLLECTION
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <a href="#catalog" className="hover:text-white transition-colors">
                Navy Waffle Camo Shark Zip
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white transition-colors">
                Crimson Split 1st Camo Shark
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white transition-colors">
                Heather Grey X-Crest Zip
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white transition-colors">
                Multi-Camo Pop Shark Zip
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white transition-colors">
                Dual Split Purple-Gold Shark
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white mb-4">
            VIP PROGRAM
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <button
                type="button"
                onClick={onOpenApply}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Apply for VIP Access (₹3,000)
              </button>
            </li>
            <li>
              <a href="#trust" className="hover:text-white transition-colors">
                Why LIM WHITES is Trustable
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white transition-colors">
                Size Valuation (₹35K – ₹45K)
              </a>
            </li>
            <li>
              <a href="#policy" className="hover:text-white transition-colors">
                09-Unit Allotment Rules
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white mb-4">
            LEGAL &amp; CONTACT
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            Support: <span className="text-white">concierge@limwhites.com</span>
            <br />
            Bandra West, Mumbai 400050, India
          </p>
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-xs font-mono uppercase underline text-[#D4AF37] hover:text-white cursor-pointer"
            >
              Terms &amp; Conditions →
            </button>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-xs font-mono uppercase underline text-zinc-300 hover:text-white cursor-pointer"
            >
              Privacy Policy →
            </button>
            <button
              type="button"
              onClick={onOpenContact}
              className="text-xs font-mono uppercase underline text-zinc-300 hover:text-white cursor-pointer"
            >
              Contact Us →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500">
          <div>© 2026 LIM WHITES ARCHIVE. ALL RIGHTS RESERVED.</div>
          <div>STOCK: 09 PER EDITION • VIP EARLY ACCESS ONLY</div>
        </div>
      </div>
    </footer>
  );
}

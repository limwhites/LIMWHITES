import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl border border-black max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/15 mb-5">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              LIM WHITES TERMS &amp; CONDITIONS
            </div>
            <h2 id="terms-title" className="font-display text-3xl font-extrabold uppercase text-black">
              VIP EARLY ACCESS TERMS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms and conditions"
            className="w-9 h-9 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
          <div className="bg-[#F5F5F5] border-l-4 border-black p-4 text-zinc-900">
            <h3 className="font-mono text-xs font-bold uppercase text-black mb-1">
              1. ALLOTMENT NOTIFICATION
            </h3>
            Once VIP Early Access is allotted to you, our concierge team will inform you directly on
            your registered contact details (Email, Mobile/WhatsApp, or Instagram).
          </div>

          <div>
            <h3 className="font-bold text-black uppercase text-xs tracking-wider mb-1">
              2. VIP APPLICATION FEE POLICY
            </h3>
            <p>
              The ₹3,000 VIP Early Access application fee covers priority collector verification and
              registration into the 09-unit round. This fee is non-refundable and will not be
              returned or refunded if VIP access or stock allotment is not granted.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black uppercase text-xs tracking-wider mb-1">
              3. LIMITED STOCK (09 UNITS) &amp; SIZE VALUATION
            </h3>
            <p>
              Each hoodie is strictly limited to 09 numbered units and marked Not For Sale directly.
              Size-based valuation ranges from ₹35,000 to ₹45,000 depending on selected size and is
              settled only upon confirmed allotment.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 font-mono text-xs text-black">
            <ShieldCheck className="w-4 h-4" />
            <span>LIM WHITES ARCHIVE • VERIFIED AUTHENTICITY</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          CLOSE TERMS
        </button>
      </div>
    </div>
  );
}

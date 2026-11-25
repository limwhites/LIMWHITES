import React, { useEffect } from 'react';
import { X, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyContactModal({ mode, onClose }) {
  useEffect(() => {
    if (!mode) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, onClose]);

  if (!mode) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl border border-black max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/15 mb-5">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              LIM WHITES OFFICIAL CHARTER
            </div>
            <h2
              id="policy-modal-title"
              className="font-display text-3xl font-extrabold uppercase text-black"
            >
              {mode === 'privacy' ? 'PRIVACY POLICY' : 'CONTACT US — LIM WHITES'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'privacy' ? (
          <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
            <p>
              <strong>LIM WHITES</strong> collects applicant details (Full Name, Email, Mobile
              Number, and Delivery Address) solely to process VIP Early Access applications, send
              SMS/email allotment notifications, and arrange insured courier delivery upon stock
              allotment.
            </p>
            <p>
              All ₹3,000 VIP Early Access fee payments are processed securely via{' '}
              <strong>PhonePe Payment Gateway</strong>. LIM WHITES does not store card numbers, UPI
              PINs, or banking credentials on our servers.
            </p>
            <p>
              We do not sell or rent applicant contact data to third-party marketers. For data
              deletion or support inquiries, write to{' '}
              <strong className="text-black">concierge@limwhites.com</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-zinc-700">
            <p>
              Reach our VIP Concierge &amp; Order Support team for questions regarding limited
              09-unit archive drops, PhonePe payment verification, or allotment updates:
            </p>
            <div className="bg-[#F5F5F5] border border-black/15 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong className="uppercase font-mono block text-black">SUPPORT EMAIL</strong>
                  concierge@limwhites.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong className="uppercase font-mono block text-black">
                    VIP CONCIERGE HOURS
                  </strong>
                  Mon – Sat, 11:00 AM – 8:00 PM IST
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong className="uppercase font-mono block text-black">
                    REGISTERED OPERATIONS
                  </strong>
                  Bandra West, Mumbai, Maharashtra 400050, India
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-5 mt-5 border-t border-black/10 font-mono text-xs text-black">
          <ShieldCheck className="w-4 h-4" />
          <span>LIM WHITES ARCHIVE • PHONEPE VERIFIED MERCHANT FLOW</span>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { X, Ticket, Download, Eye, ArrowRight } from 'lucide-react';
import { formatINR } from '../data/hoodies';
import { downloadThankYouCardPng } from '../utils/cardExporter';

export default function VipPassesDrawer({
  isOpen,
  passes,
  onClose,
  onViewPass,
  onOpenApply,
}) {
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full border-l border-black flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="bg-black text-white px-6 py-5 flex items-center justify-between border-b border-white/15">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">
                LIM WHITES COLLECTOR VAULT
              </div>
              <h2
                id="vip-drawer-title"
                className="font-display text-2xl font-extrabold uppercase tracking-wide"
              >
                MY VIP DIGITAL PASSES ({passes.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close VIP passes drawer"
              className="w-9 h-9 border border-white/25 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {passes.length === 0 ? (
              <div className="bg-[#ECEFF1] border border-black/15 p-6 text-center space-y-4">
                <Ticket className="w-10 h-10 text-black mx-auto" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-black">
                    NO VIP APPLICATIONS YET
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Apply for VIP Early Access on any of our 5 limited BAPE® hoodies (Stock: 09) to
                    receive your personalized Digital Thank You Card here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApply();
                  }}
                  className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  APPLY FOR VIP ACCESS (₹3,000)
                </button>
              </div>
            ) : (
              passes.map((pass) => (
                <div key={pass.applicationId} className="border border-black p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-[10px] text-[#B48A3E] font-bold">
                        {pass.applicationId}
                      </div>
                      <h3 className="font-display text-xl font-extrabold uppercase text-black">
                        {pass.fullName}
                      </h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold px-2 py-1 uppercase">
                      FEE VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-[#F5F5F5] p-2.5 border border-black/10">
                    <img
                      src={pass.hoodieImage}
                      alt={pass.hoodieName}
                      className="w-14 h-16 object-cover bg-[#ECEFF1] shrink-0"
                    />
                    <div className="min-w-0 text-xs">
                      <div className="font-bold text-black truncate">{pass.hoodieName}</div>
                      <div className="font-mono text-[11px] text-zinc-600 mt-0.5">
                        Size {pass.size} • Valuation {formatINR(pass.sizeValuation)}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500">
                        Fee Paid: {formatINR(pass.feePaid)} (Non-Refundable)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onViewPass(pass)}
                      className="py-2.5 bg-black text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-800 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      VIEW CARD
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadThankYouCardPng(pass)}
                      className="py-2.5 border border-black text-black font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-100 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      DOWNLOAD PNG
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-5 border-t border-black/15 bg-[#F5F5F5]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApply();
            }}
            className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>SUBMIT ANOTHER VIP APPLICATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

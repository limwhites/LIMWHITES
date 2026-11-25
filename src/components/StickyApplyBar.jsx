import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';

export default function StickyApplyBar({ hidden, onOpenApply }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (hidden || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-black/95 backdrop-blur-md text-white border-t border-[#D4AF37]/50 px-4 py-3">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="hidden md:inline-block bg-[#D4AF37] text-black font-mono text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-[0.14em]">
            2 DAYS ONLY
          </span>
          <div className="text-xs sm:text-sm font-medium">
            <strong className="uppercase tracking-wide text-white">
              Own a 01/09 BAPE® Archive Hoodie
            </strong>
            <span className="hidden sm:inline text-zinc-400">
              {' '}
              • Strictly 09 units per piece • VIP Entry ₹3,000
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenApply}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#D4AF37] hover:bg-[#e5c14d] text-black font-bold text-xs uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>APPLY IN 60 SEC</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

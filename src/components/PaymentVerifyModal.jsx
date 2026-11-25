import React, { useEffect, useState } from 'react';
import { Loader2, XCircle, RotateCcw, ShieldAlert, X } from 'lucide-react';

export default function PaymentVerifyModal({ txnId, onVerified, onRetry, onClose }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'failed'
  const [message, setMessage] = useState('Verifying your ₹3,000 transaction directly with PhonePe...');

  useEffect(() => {
    if (!txnId) return;
    let cancelled = false;

    async function verify() {
      setStatus('checking');
      setMessage('Verifying your ₹3,000 transaction directly with PhonePe...');
      try {
        const res = await fetch(`/api/phonepe/verify?txnId=${encodeURIComponent(txnId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.verified && data.application) {
          onVerified(data.application);
        } else {
          setStatus('failed');
          setMessage(
            data.message ||
              data.error ||
              'Payment could not be verified. Only verified ₹3,000 PhonePe payments receive VIP Early Access.'
          );
        }
      } catch {
        if (cancelled) return;
        setStatus('failed');
        setMessage('Unable to verify PhonePe transaction right now. Please retry verification.');
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [txnId, onVerified]);

  if (!txnId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-title"
    >
      <div className="bg-white w-full max-w-md border border-black p-6 sm:p-8 text-center space-y-5 relative">
        {status === 'failed' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment verification"
            className="absolute top-3 right-3 w-9 h-9 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {status === 'checking' ? (
          <>
            <div className="w-14 h-14 bg-[#5F259F]/10 border border-[#5F259F]/30 mx-auto flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-[#5F259F] animate-spin" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                PHONEPE LIVE STATUS CHECK
              </div>
              <h2 id="verify-title" className="font-display text-3xl font-extrabold uppercase mt-1">
                VERIFYING PAYMENT...
              </h2>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{message}</p>
            </div>
            <div className="font-mono text-[11px] text-zinc-500 bg-[#F5F5F5] p-2.5">
              TXN REF: {txnId}
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-red-50 border border-red-200 mx-auto flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-600 font-bold">
                PAYMENT NOT COMPLETED
              </div>
              <h2 id="verify-title" className="font-display text-3xl font-extrabold uppercase mt-1">
                VIP ACCESS NOT ISSUED
              </h2>
              <p className="text-xs text-zinc-700 mt-2 leading-relaxed">{message}</p>
            </div>
            <div className="bg-[#F5F5F5] border border-black/15 p-3 text-left text-[11px] text-zinc-600 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <span>
                Digital Thank You Card and SMS confirmation are generated only after PhonePe
                confirms ₹3,000 payment success.
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={onRetry}
                className="w-full py-3.5 bg-[#5F259F] hover:bg-[#4b1c80] text-white text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY ₹3,000 PHONEPE PAYMENT</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 border border-black text-black text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-100 cursor-pointer"
              >
                BACK TO WEBSITE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

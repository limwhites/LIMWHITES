import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Award, Lock, ChevronDown, FileText } from 'lucide-react';

const TRUST_PILLARS = [
  {
    icon: Fingerprint,
    code: '01 // SERIALIZED 09/09',
    title: 'NUMBERED VAULT TAGS',
    desc: 'Every hoodie carries a laser-etched metallic serial from #01/09 to #09/09 linked to the collector’s VIP Application ID.',
  },
  {
    icon: ShieldCheck,
    code: '02 // NFC AUTHENTICATED',
    title: 'MOST TRUSTABLE PROVENANCE',
    desc: 'Verified BAPE® woven labels, GSM stitch audit, and tamper-proof LIM WHITES cryptographic tag prior to insured dispatch.',
  },
  {
    icon: Award,
    code: '03 // VIP EARLY ACCESS',
    title: 'CURATED FOR VIP PERSONS',
    desc: 'Zero bot traffic, zero public cart racing. Every ₹3,000 VIP application receives dedicated concierge review.',
  },
  {
    icon: Lock,
    code: '04 // SIZE-TIERED VALUATION',
    title: 'TRANSPARENT ₹35K–₹45K PRICING',
    desc: 'Allocation valuation scales cleanly by garment size from Small (₹35,000+) to Double XL (up to ₹45,000).',
  },
];

const FAQS = [
  {
    q: 'Why does every hoodie say "NOT FOR SALE" with Stock 09?',
    a: 'All 5 LIM WHITES × BAPE® Archive Hoodies are ultra-limited collector editions strictly capped at 09 units per piece. Access is granted exclusively through our VIP Early Access allotment program.',
  },
  {
    q: 'How will I know once my VIP Early Access is allotted?',
    a: 'As soon as your VIP Early Access is allotted from the 09-unit round, our team informs you directly via your registered Email, Phone/WhatsApp, or Instagram handle.',
  },
  {
    q: 'How does the ₹35,000 to ₹45,000 size-based pricing work?',
    a: 'Each hoodie starts around ₹35,000 for Size S and steps upward as you choose larger sizes (M, L, XL, up to ₹45,000 for XXL). You only settle the garment valuation after your VIP allotment is confirmed.',
  },
  {
    q: 'What does the ₹3,000 VIP Access fee cover?',
    a: 'The ₹3,000 VIP Early Access fee confirms your priority collector entry and issues your personalized Digital Thank You Card immediately. Per our standard terms, this application fee is non-refundable if VIP access or stock allotment is not granted.',
  },
];

export default function TrustSection({ onOpenTerms, onOpenApply }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* Trust & Credibility Section */}
      <section id="trust" className="bg-[#F7F7F7] border-y border-black/10 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-600 mb-2">
                WHY LIM WHITES IS MOST TRUSTABLE
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-black">
                AUTHENTICATED VIP ALLOCATION PROTOCOL
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenApply}
              className="self-start md:self-auto bg-black text-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              ENTER VIP APPLICATION →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.code}
                  className="bg-white border border-black/15 p-6 flex flex-col justify-between hover:border-black transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-zinc-500">
                        {pillar.code}
                      </span>
                      <div className="w-10 h-10 bg-[#ECEFF1] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-black" strokeWidth={1.6} />
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-black mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compact Terms & Conditions + FAQ Section */}
      <section id="policy" className="bg-white py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Clean, Compact Legal T&C Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#111111] text-white p-7 sm:p-9 h-full flex flex-col justify-between border border-black">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#D4AF37] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.16em] mb-5">
                  <FileText className="w-3.5 h-3.5" />
                  TERMS &amp; CONDITIONS
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-none mb-4">
                  VIP ACCESS TERMS &amp; ALLOTMENT
                </h2>
                <ul className="space-y-3 text-sm text-zinc-300 leading-relaxed mb-6">
                  <li>
                    • <strong className="text-white">Contact Notification:</strong> Once your VIP
                    Early Access is allotted, you will be informed directly on your registered
                    Email &amp; Mobile number.
                  </li>
                  <li>
                    • <strong className="text-white">Limited 09 Units:</strong> All 5 archive
                    hoodies are strictly capped at 09 units per piece and marked Not For General
                    Sale.
                  </li>
                  <li>
                    • <strong className="text-white">Application Fee Policy:</strong> The ₹3,000 VIP
                    Early Access application fee is non-refundable if VIP access or stock allotment
                    is not granted.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onOpenTerms}
                className="w-full py-3.5 border border-white/40 text-white hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
              >
                READ COMPLETE TERMS &amp; CONDITIONS
              </button>
            </div>
          </div>

          {/* Adidas-style Interactive FAQ Accordion */}
          <div className="lg:col-span-7">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-600 mb-2">
              DROP BRIEFING &amp; SUPPORT
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-black mb-6">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            <div className="divide-y divide-black/15 border-y border-black/15">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer group"
                    >
                      <span className="font-bold text-base text-black group-hover:text-zinc-600 transition-colors">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-black shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-5 pr-8 text-sm text-zinc-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

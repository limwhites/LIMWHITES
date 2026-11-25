import React, { useEffect, useMemo, useState } from 'react';
import {
  Lock,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { formatINR } from '../data/hoodies';
import { OWNER_PIN_DEFAULT } from '../config/submission';

const STORAGE_KEY = 'lim_whites_vip_applications_v1';

export default function OwnerDesk() {
  const [pinInput, setPinInput] = useState('');
  const [unlockedPin, setUnlockedPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const fetchApplications = async (pin) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/applications', {
        headers: { 'x-owner-pin': pin },
      });
      if (res.status === 401) {
        setAuthError('Invalid Owner Passcode.');
        setLoading(false);
        return false;
      }
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setUnlockedPin(pin);
        setLoading(false);
        return true;
      }
    } catch {
      // Static fallback when no backend API is running
    }

    if (pin === OWNER_PIN_DEFAULT) {
      try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        setApplications(local);
      } catch {
        setApplications([]);
      }
      setUnlockedPin(pin);
      setLoading(false);
      return true;
    }

    setAuthError('Invalid Owner Passcode.');
    setLoading(false);
    return false;
  };

  useEffect(() => {
    if (unlockedPin) {
      fetchApplications(unlockedPin);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    await fetchApplications(pinInput.trim());
  };

  const handleStatusChange = async (applicationId, nextStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.applicationId === applicationId ? { ...a, status: nextStatus } : a))
    );
    try {
      await fetch(`/api/applications/${encodeURIComponent(applicationId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-pin': unlockedPin,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Ignore if running statically
    }
  };

  const buildOutreachText = (app, mode) => {
    if (mode === 'allotted') {
      return `Hi ${app.fullName}, great news from LIM WHITES! Your VIP Early Access for ${app.hoodieName} (Size ${app.size} • ${app.applicationId}) has been ALLOTTED. Our concierge will share next steps for dispatch to ${app.city}.`;
    }
    return `Hi ${app.fullName}, thank you for applying to LIM WHITES × BAPE® VIP Early Access (${app.applicationId}). Sorry about this—due to strictly 09 units per piece, you were not selected in this round. Stay connected for our upcoming private vault drops.`;
  };

  const handleCopyDm = (app, mode) => {
    const text = buildOutreachText(app, mode);
    navigator.clipboard.writeText(text);
    setCopiedId(`${app.applicationId}-${mode}`);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const exportCsv = () => {
    const headers = [
      'Application ID',
      'Status',
      'Full Name',
      'Email',
      'Phone',
      'Instagram',
      'Hoodie SKU',
      'Hoodie Name',
      'Size',
      'Valuation INR',
      'Fee Paid INR',
      'Payment Ref',
      'Address',
      'City',
      'State',
      'PIN',
      'Submitted At',
    ];
    const rows = applications.map((a) =>
      [
        a.applicationId,
        a.status || 'Pending',
        a.fullName,
        a.email,
        `+91 ${a.phone}`,
        a.instagram || '',
        a.hoodieSku,
        a.hoodieName,
        a.size,
        a.sizeValuation,
        a.feePaid,
        a.paymentReference || a.paymentMethodLabel,
        a.address,
        a.city,
        a.state,
        a.pincode,
        a.submittedAtFormatted,
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lim-whites-vip-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      const st = a.status || 'Pending';
      const statusOk = filterStatus === 'ALL' || st === filterStatus;
      const queryOk =
        !q ||
        (a.fullName || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.phone || '').includes(q) ||
        (a.applicationId || '').toLowerCase().includes(q) ||
        (a.city || '').toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [applications, filterStatus, search]);

  if (!unlockedPin) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white text-black border border-black p-8 space-y-5"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-black" />
            LIM WHITES PRIVATE CONCIERGE DESK
          </div>
          <h1 className="font-display text-4xl font-extrabold uppercase">OWNER ACCESS</h1>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This private portal is unlinked from the public storefront. Enter your Owner Passcode
            to review VIP applicants, mark allotments, and send Email or DM updates.
          </p>
          <div>
            <label
              htmlFor="owner-pin"
              className="block font-mono text-xs font-bold uppercase mb-1.5"
            >
              Owner Passcode
            </label>
            <input
              id="owner-pin"
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter passcode"
              className="w-full h-11 px-3.5 border border-black text-sm focus:outline-none"
            />
            {authError && <p className="text-xs text-red-600 mt-1.5 font-semibold">{authError}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'VERIFYING...' : 'UNLOCK CONCIERGE DESK'}</span>
          </button>
        </form>
      </div>
    );
  }

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => (a.status || 'Pending') === 'Pending').length;
  const allottedCount = applications.filter((a) => a.status === 'Allotted').length;
  const notSelectedCount = applications.filter((a) => a.status === 'Not Selected').length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black">
      <header className="bg-black text-white px-6 py-5 border-b border-white/15">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">
              LIM WHITES • PRIVATE OWNER DESK
            </div>
            <h1 className="font-display text-3xl font-extrabold uppercase">
              VIP APPLICANTS &amp; ALLOTMENT REGISTRY
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchApplications(unlockedPin)}
              className="px-4 py-2.5 border border-white/30 text-xs font-mono uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              REFRESH
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="px-4 py-2.5 bg-[#D4AF37] text-black text-xs font-mono font-bold uppercase flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT CSV
            </button>
            <a
              href="/"
              className="px-4 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase"
            >
              VIEW STOREFRONT
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-zinc-500 uppercase">TOTAL APPLICATIONS</div>
            <div className="font-display text-4xl font-extrabold mt-1">{totalCount}</div>
          </div>
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-zinc-500 uppercase">PENDING REVIEW</div>
            <div className="font-display text-4xl font-extrabold mt-1">{pendingCount}</div>
          </div>
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-emerald-700 uppercase">VIP ALLOTTED</div>
            <div className="font-display text-4xl font-extrabold text-emerald-700 mt-1">
              {allottedCount}
            </div>
          </div>
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-zinc-500 uppercase">NOT SELECTED</div>
            <div className="font-display text-4xl font-extrabold text-zinc-700 mt-1">
              {notSelectedCount}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white border border-black/15 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'Pending', 'Allotted', 'Not Selected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase border cursor-pointer ${
                  filterStatus === st
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black/20'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-[#ECEFF1] px-3 h-10 w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-600" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, city, phone, ID..."
              className="w-full bg-transparent pl-2 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-black/15 p-10 text-center">
            <p className="font-display text-2xl font-bold uppercase">NO SUBMISSIONS YET</p>
            <p className="text-xs text-zinc-600 mt-1">
              Customer VIP applications submitted on the storefront appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => {
              const status = app.status || 'Pending';
              const mailSubject =
                status === 'Allotted'
                  ? `LIM WHITES VIP Access ALLOTTED — ${app.applicationId}`
                  : `LIM WHITES VIP Early Access Update — ${app.applicationId}`;
              const mailBody = buildOutreachText(
                app,
                status === 'Allotted' ? 'allotted' : 'not_selected'
              );
              const waText = encodeURIComponent(mailBody);

              return (
                <div key={app.applicationId} className="bg-white border border-black/20 p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-3">
                    <div>
                      <div className="font-mono text-xs text-[#B48A3E] font-bold">
                        {app.applicationId} • {app.submittedAtFormatted}
                      </div>
                      <h2 className="font-display text-2xl font-extrabold uppercase">
                        {app.fullName}
                      </h2>
                      <div className="text-xs text-zinc-600 font-mono mt-0.5">
                        {app.email} • +91 {app.phone}{' '}
                        {app.instagram ? `• IG: ${app.instagram}` : ''}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {['Pending', 'Allotted', 'Not Selected'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleStatusChange(app.applicationId, opt)}
                          className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase border cursor-pointer ${
                            status === opt
                              ? opt === 'Allotted'
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : opt === 'Not Selected'
                                ? 'bg-zinc-800 text-white border-zinc-800'
                                : 'bg-black text-white border-black'
                              : 'bg-white text-zinc-600 border-black/20 hover:border-black'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-[#F5F5F5] p-3 border border-black/10">
                      <div className="font-mono text-[10px] text-zinc-500 uppercase">
                        REQUESTED PIECE
                      </div>
                      <div className="font-bold mt-1">{app.hoodieName}</div>
                      <div className="font-mono text-zinc-700 mt-0.5">
                        Size {app.size} • Valuation {formatINR(app.sizeValuation)}
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] p-3 border border-black/10">
                      <div className="font-mono text-[10px] text-zinc-500 uppercase">
                        ₹3,000 PHONEPE &amp; SMS STATUS
                      </div>
                      <div
                        className={`font-bold mt-1 ${
                          app.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {app.paymentStatus === 'PAID'
                          ? `${formatINR(app.feePaid)} PAID & VERIFIED`
                          : app.paymentStatus || 'UNPAID'}
                      </div>
                      <div className="font-mono text-zinc-700 mt-0.5">
                        {app.paymentReference || app.merchantTransactionId || app.paymentMethodLabel}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 mt-0.5">
                        SMS: {app.smsStatus || 'pending'}
                      </div>
                    </div>
                    <div className="bg-[#F5F5F5] p-3 border border-black/10">
                      <div className="font-mono text-[10px] text-zinc-500 uppercase">
                        DELIVERY ADDRESS
                      </div>
                      <div className="mt-1 text-zinc-800">
                        {app.address}, {app.city}, {app.state} - {app.pincode}
                      </div>
                    </div>
                  </div>

                  {/* Direct 1-click Email / WhatsApp / IG DM Outreach */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`mailto:${app.email}?subject=${encodeURIComponent(
                        mailSubject
                      )}&body=${encodeURIComponent(mailBody)}`}
                      className="px-3.5 py-2 bg-black text-white text-[11px] font-mono font-bold uppercase inline-flex items-center gap-1.5 hover:bg-zinc-800"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {status === 'Allotted'
                        ? 'EMAIL ALLOTTED NOTICE'
                        : 'EMAIL SORRY (NOT SELECTED)'}
                    </a>

                    <a
                      href={`https://wa.me/91${app.phone}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-700 text-white text-[11px] font-mono font-bold uppercase inline-flex items-center gap-1.5 hover:bg-emerald-800"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WHATSAPP DM
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyDm(app, status === 'Allotted' ? 'allotted' : 'not_selected')
                      }
                      className="px-3.5 py-2 border border-black text-black text-[11px] font-mono font-bold uppercase inline-flex items-center gap-1.5 hover:bg-zinc-100 cursor-pointer"
                    >
                      {copiedId.startsWith(app.applicationId) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          COPIED DM TEXT
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          COPY DM MESSAGE
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

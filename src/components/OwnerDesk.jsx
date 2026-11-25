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
  CheckCircle2,
  XCircle,
  Settings,
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

  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('LIM WHITES');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const fetchAll = async (pin) => {
    setLoading(true);
    setAuthError('');
    try {
      const [appsRes, setRes] = await Promise.all([
        fetch('/api/applications', { headers: { 'x-owner-pin': pin } }),
        fetch('/api/settings', { headers: { 'x-owner-pin': pin } }),
      ]);

      if (appsRes.status === 401) {
        setAuthError('Invalid Owner Passcode.');
        setLoading(false);
        return false;
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData.settings) {
          setUpiId(setData.settings.upiId || '');
          setMerchantName(setData.settings.merchantName || 'LIM WHITES');
        }
      }
      setUnlockedPin(pin);
      setLoading(false);
      return true;
    } catch {
      // Static fallback
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
    if (unlockedPin) fetchAll(unlockedPin);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    await fetchAll(pinInput.trim());
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-pin': unlockedPin,
        },
        body: JSON.stringify({ upiId: upiId.trim(), merchantName: merchantName.trim() }),
      });
      if (res.ok) {
        setSettingsSavedMsg('Saved! Customers now see this ₹3,000 UPI QR code on checkout.');
        setTimeout(() => setSettingsSavedMsg(''), 4000);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleApproveUtr = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(applicationId)}/approve`, {
        method: 'POST',
        headers: { 'x-owner-pin': unlockedPin },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications) setApplications(data.applications);
      }
    } catch {
      // ignore
    }
  };

  const handleRejectUtr = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(applicationId)}/reject`, {
        method: 'POST',
        headers: { 'x-owner-pin': unlockedPin },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications) setApplications(data.applications);
      }
    } catch {
      // ignore
    }
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
      // Ignore
    }
  };

  const buildOutreachText = (app, mode) => {
    if (mode === 'allotted') {
      return `Hi ${app.fullName}, great news from LIM WHITES! Your VIP Early Access for ${app.hoodieName} (Size ${app.size} • ${app.applicationId}) has been ALLOTTED. Our concierge will share next steps for dispatch to ${app.city}.`;
    }
    return `Hi ${app.fullName}, thank you for applying to LIM WHITES × BAPE® VIP Early Access (${app.applicationId}). Sorry about this—due to strictly 09 units per piece, you were not selected in this round. Stay connected for our upcoming private vault drops.`;
  };

  const handleCopyDm = (app, mode) => {
    navigator.clipboard.writeText(buildOutreachText(app, mode));
    setCopiedId(`${app.applicationId}-${mode}`);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const exportCsv = () => {
    const headers = [
      'Application ID',
      'Payment Status',
      'UTR Number',
      'VIP Status',
      'SMS Status',
      'Full Name',
      'Email',
      'Phone',
      'Instagram',
      'Hoodie SKU',
      'Hoodie Name',
      'Size',
      'Valuation INR',
      'Fee INR',
      'Address',
      'City',
      'State',
      'PIN',
      'Submitted At',
    ];
    const rows = applications.map((a) =>
      [
        a.applicationId,
        a.paymentStatus || 'PAID',
        a.utrNumber || a.paymentReference || '',
        a.status || 'Pending',
        a.smsStatus || '',
        a.fullName,
        a.email,
        `+91 ${a.phone}`,
        a.instagram || '',
        a.hoodieSku,
        a.hoodieName,
        a.size,
        a.sizeValuation,
        a.feePaid,
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
      const statusOk =
        filterStatus === 'ALL' ||
        (filterStatus === 'Awaiting UTR Verification'
          ? a.paymentStatus === 'UTR_SUBMITTED'
          : st === filterStatus);
      const queryOk =
        !q ||
        (a.fullName || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.phone || '').includes(q) ||
        (a.utrNumber || '').includes(q) ||
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
            Private portal to configure your ₹3,000 UPI ID, verify customer UTR payments, trigger
            confirmation SMS, and send Allotted / Not Selected emails or DMs.
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
              placeholder="Enter passcode (default: LIMWHITES2026)"
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
  const utrPendingCount = applications.filter((a) => a.paymentStatus === 'UTR_SUBMITTED').length;
  const paidCount = applications.filter((a) => a.paymentStatus === 'PAID').length;
  const allottedCount = applications.filter((a) => a.status === 'Allotted').length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black">
      <header className="bg-black text-white px-6 py-5 border-b border-white/15">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">
              LIM WHITES • PRIVATE OWNER DESK
            </div>
            <h1 className="font-display text-3xl font-extrabold uppercase">
              UTR VERIFICATION, LEADS &amp; ALLOTMENT DESK
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchAll(unlockedPin)}
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
        {/* Merchant UPI QR Configuration Box */}
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border-2 border-black p-5 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              MERCHANT PHONEPE / UPI QR SETTINGS (SHOWN TO CUSTOMERS ON CHECKOUT)
            </div>
            {settingsSavedMsg && (
              <span className="text-xs font-mono font-bold text-emerald-700">
                {settingsSavedMsg}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label htmlFor="desk-upi" className="block font-mono text-[11px] font-bold uppercase mb-1">
                Your PhonePe / Business UPI ID
              </label>
              <input
                id="desk-upi"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@ybl or business@okaxis"
                className="w-full h-10 px-3 border border-black/30 focus:border-black font-mono text-xs focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="desk-mname" className="block font-mono text-[11px] font-bold uppercase mb-1">
                Display Name on UPI
              </label>
              <input
                id="desk-mname"
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="LIM WHITES"
                className="w-full h-10 px-3 border border-black/30 focus:border-black text-xs font-bold focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full h-10 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-zinc-800 cursor-pointer"
              >
                {savingSettings ? 'SAVING...' : 'SAVE UPI SETTINGS'}
              </button>
            </div>
          </div>
        </form>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-zinc-500 uppercase">TOTAL SUBMISSIONS</div>
            <div className="font-display text-4xl font-extrabold mt-1">{totalCount}</div>
          </div>
          <div className="bg-amber-50 border border-amber-300 p-4">
            <div className="font-mono text-[11px] text-amber-800 uppercase font-bold">
              AWAITING UTR CHECK
            </div>
            <div className="font-display text-4xl font-extrabold text-amber-800 mt-1">
              {utrPendingCount}
            </div>
          </div>
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-emerald-700 uppercase">VERIFIED PAID</div>
            <div className="font-display text-4xl font-extrabold text-emerald-700 mt-1">
              {paidCount}
            </div>
          </div>
          <div className="bg-white border border-black/15 p-4">
            <div className="font-mono text-[11px] text-zinc-500 uppercase">VIP ALLOTTED</div>
            <div className="font-display text-4xl font-extrabold text-black mt-1">
              {allottedCount}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white border border-black/15 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'Awaiting UTR Verification', 'Pending', 'Allotted', 'Not Selected'].map(
              (st) => (
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
              )
            )}
          </div>
          <div className="flex items-center bg-[#ECEFF1] px-3 h-10 w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-600" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, UTR, email, city, phone..."
              className="w-full bg-transparent pl-2 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-black/15 p-10 text-center">
            <p className="font-display text-2xl font-bold uppercase">NO SUBMISSIONS FOUND</p>
            <p className="text-xs text-zinc-600 mt-1">
              Customer VIP applications and 12-digit UTR entries appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => {
              const status = app.status || 'Pending';
              const isUtrSubmitted = app.paymentStatus === 'UTR_SUBMITTED';
              const isPaid = app.paymentStatus === 'PAID';
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
                <div
                  key={app.applicationId}
                  className={`bg-white border p-5 space-y-4 ${
                    isUtrSubmitted ? 'border-2 border-amber-500' : 'border-black/20'
                  }`}
                >
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

                    {/* UTR Approve / Reject OR Allotment Status Switcher */}
                    {isUtrSubmitted ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveUtr(app.applicationId)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          APPROVE ₹3,000 &amp; SEND SMS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectUtr(app.applicationId)}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          REJECT (UNPAID)
                        </button>
                      </div>
                    ) : (
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
                    )}
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
                        ₹3,000 UTR &amp; SMS STATUS
                      </div>
                      <div
                        className={`font-bold mt-1 ${
                          isPaid
                            ? 'text-emerald-700'
                            : isUtrSubmitted
                            ? 'text-amber-700'
                            : 'text-red-600'
                        }`}
                      >
                        {isPaid
                          ? '₹3,000 PAID & VERIFIED'
                          : isUtrSubmitted
                          ? `VERIFY UTR: ${app.utrNumber}`
                          : app.paymentStatus || 'UNPAID'}
                      </div>
                      <div className="font-mono text-zinc-700 mt-0.5">
                        UTR / Ref: {app.utrNumber || app.paymentReference || '-'}
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

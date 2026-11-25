import React, { useCallback, useEffect, useState } from 'react';
import { HOODIES } from './data/hoodies';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CatalogSection from './components/CatalogSection';
import TrustSection from './components/TrustSection';
import ProductDetailModal from './components/ProductDetailModal';
import VipApplicationModal from './components/VipApplicationModal';
import DigitalThankYouCardModal from './components/DigitalThankYouCardModal';
import VipPassesDrawer from './components/VipPassesDrawer';
import TermsModal from './components/TermsModal';
import PrivacyContactModal from './components/PrivacyContactModal';
import PaymentVerifyModal from './components/PaymentVerifyModal';
import Footer from './components/Footer';
import OwnerDesk from './components/OwnerDesk';
import StickyApplyBar from './components/StickyApplyBar';

const STORAGE_KEY = 'lim_whites_vip_applications_v1';

export default function App() {
  const isOwnerDesk =
    typeof window !== 'undefined' &&
    window.location.pathname.replace(/\/+$/, '').endsWith('/lw-concierge');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState(() =>
    HOODIES.reduce((acc, h) => {
      acc[h.id] = 'S';
      return acc;
    }, {})
  );

  const [detailHoodieId, setDetailHoodieId] = useState(null);
  const [applyModalState, setApplyModalState] = useState({
    isOpen: false,
    hoodieId: HOODIES[0].id,
    size: 'S',
  });
  const [pendingVerifyTxnId, setPendingVerifyTxnId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('phonepe_txn') || '';
  });
  const [activeDigitalCard, setActiveDigitalCard] = useState(null);
  const [passesDrawerOpen, setPassesDrawerOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [legalModalMode, setLegalModalMode] = useState(''); // 'privacy' | 'contact' | ''

  const [submittedPasses, setSubmittedPasses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submittedPasses));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [submittedPasses]);

  const clearTxnQueryParam = () => {
    setPendingVerifyTxnId('');
    if (typeof window !== 'undefined' && window.location.search.includes('phonepe_txn')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('phonepe_txn');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  };

  const handlePaymentVerified = useCallback((verifiedApplication) => {
    setSubmittedPasses((prev) => [
      verifiedApplication,
      ...prev.filter((p) => p.applicationId !== verifiedApplication.applicationId),
    ]);
    clearTxnQueryParam();
    setActiveDigitalCard(verifiedApplication);
  }, []);

  if (isOwnerDesk) {
    return <OwnerDesk />;
  }

  const handleSelectSize = (hoodieId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [hoodieId]: size }));
  };

  const handleSelectGlobalSize = (size) => {
    setSelectedSizes(
      HOODIES.reduce((acc, h) => {
        acc[h.id] = size;
        return acc;
      }, {})
    );
  };

  const handleOpenApply = (hoodieId = HOODIES[0].id, size) => {
    const resolvedSize = size || selectedSizes[hoodieId] || 'S';
    setDetailHoodieId(null);
    setApplyModalState({
      isOpen: true,
      hoodieId,
      size: resolvedSize,
    });
  };

  const handleExplore = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const activeDetailHoodie = HOODIES.find((h) => h.id === detailHoodieId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        passesCount={submittedPasses.length}
        onOpenPasses={() => setPassesDrawerOpen(true)}
        onOpenApply={() => handleOpenApply(HOODIES[0].id)}
      />

      <main className="flex-1">
        <HeroSection
          onExplore={handleExplore}
          onOpenApply={() => handleOpenApply(HOODIES[0].id)}
        />

        <CatalogSection
          hoodies={HOODIES}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSizes={selectedSizes}
          onSelectSize={handleSelectSize}
          onSelectGlobalSize={handleSelectGlobalSize}
          onOpenDetail={(id) => setDetailHoodieId(id)}
          onOpenApply={handleOpenApply}
        />

        <TrustSection
          onOpenTerms={() => setTermsModalOpen(true)}
          onOpenApply={() => handleOpenApply(HOODIES[0].id)}
        />
      </main>

      <Footer
        passes={submittedPasses}
        onLookupPass={(pass) => setActiveDigitalCard(pass)}
        onOpenTerms={() => setTermsModalOpen(true)}
        onOpenPrivacy={() => setLegalModalMode('privacy')}
        onOpenContact={() => setLegalModalMode('contact')}
        onOpenApply={() => handleOpenApply(HOODIES[0].id)}
      />

      <ProductDetailModal
        hoodie={activeDetailHoodie}
        selectedSize={activeDetailHoodie ? selectedSizes[activeDetailHoodie.id] || 'S' : 'S'}
        onSelectSize={handleSelectSize}
        onClose={() => setDetailHoodieId(null)}
        onApplyVip={(hId, sz) => handleOpenApply(hId, sz)}
      />

      <VipApplicationModal
        isOpen={applyModalState.isOpen}
        initialHoodieId={applyModalState.hoodieId}
        initialSize={applyModalState.size}
        onClose={() => setApplyModalState((prev) => ({ ...prev, isOpen: false }))}
        onOpenTerms={() => setTermsModalOpen(true)}
      />

      <PaymentVerifyModal
        txnId={pendingVerifyTxnId}
        onVerified={handlePaymentVerified}
        onRetry={() => {
          clearTxnQueryParam();
          handleOpenApply(HOODIES[0].id);
        }}
        onClose={clearTxnQueryParam}
      />

      <DigitalThankYouCardModal
        application={activeDigitalCard}
        onClose={() => setActiveDigitalCard(null)}
      />

      <VipPassesDrawer
        isOpen={passesDrawerOpen}
        passes={submittedPasses}
        onClose={() => setPassesDrawerOpen(false)}
        onViewPass={(pass) => {
          setPassesDrawerOpen(false);
          setActiveDigitalCard(pass);
        }}
        onOpenApply={() => handleOpenApply(HOODIES[0].id)}
      />

      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />

      <PrivacyContactModal mode={legalModalMode} onClose={() => setLegalModalMode('')} />

      <StickyApplyBar
        hidden={
          Boolean(detailHoodieId) ||
          applyModalState.isOpen ||
          Boolean(pendingVerifyTxnId) ||
          Boolean(activeDigitalCard) ||
          passesDrawerOpen ||
          termsModalOpen ||
          Boolean(legalModalMode)
        }
        onOpenApply={() => handleOpenApply(HOODIES[0].id)}
      />
    </div>
  );
}

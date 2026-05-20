import { useEffect, useState } from 'react';

const GA_ID = 'G-D4Y5X0YHY9';
const CONSENT_KEY = 'terminybhp.analyticsConsent';

function currentPagePath() {
  return `${window.location.pathname}${window.location.hash}`;
}

function updateGoogleConsent(value) {
  window[`ga-disable-${GA_ID}`] = value === 'denied';

  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

function loadGoogleAnalytics() {
  if (document.querySelector(`script[src*="${GA_ID}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { page_path: currentPagePath() });
}

export function openAnalyticsConsent() {
  window.dispatchEvent(new Event('terminybhp:analytics-consent'));
}

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(CONSENT_KEY);

    if (savedConsent === 'granted' || savedConsent === 'denied') {
      setConsent(savedConsent);
      return;
    }

    setShowBanner(true);
  }, []);

  useEffect(() => {
    const handleOpen = () => setShowBanner(true);
    window.addEventListener('terminybhp:analytics-consent', handleOpen);

    return () => window.removeEventListener('terminybhp:analytics-consent', handleOpen);
  }, []);

  useEffect(() => {
    if (consent !== 'granted') {
      return undefined;
    }

    loadGoogleAnalytics();

    const trackHashRoute = () => {
      if (window.gtag) {
        window.gtag('config', GA_ID, { page_path: currentPagePath() });
      }
    };

    window.addEventListener('hashchange', trackHashRoute);
    return () => window.removeEventListener('hashchange', trackHashRoute);
  }, [consent]);

  const saveConsent = (value) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    updateGoogleConsent(value);
    setConsent(value);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-5 py-4 shadow-2xl backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-slate-950">Analityka serwisu</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Używamy Google Analytics, żeby sprawdzać, które części wersji demo są używane i co warto rozwijać. Analityka uruchomi się tylko po Twojej zgodzie.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => saveConsent('denied')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900"
          >
            Nie zgadzam się
          </button>
          <button
            type="button"
            onClick={() => saveConsent('granted')}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
          >
            Zgadzam się
          </button>
        </div>
      </div>
    </div>
  );
}

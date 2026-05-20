"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-D4Y5X0YHY9";
const CONSENT_KEY = "terminybhp.analyticsConsent";

type ConsentValue = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function openAnalyticsConsent() {
  window.dispatchEvent(new Event("terminybhp:analytics-consent"));
}

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(CONSENT_KEY) as ConsentValue;

    if (savedConsent === "granted" || savedConsent === "denied") {
      setConsent(savedConsent);
      return;
    }

    setShowBanner(true);
  }, []);

  useEffect(() => {
    const handleOpen = () => setShowBanner(true);
    window.addEventListener("terminybhp:analytics-consent", handleOpen);

    return () => window.removeEventListener("terminybhp:analytics-consent", handleOpen);
  }, []);

  const saveConsent = (value: Exclude<ConsentValue, null>) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = value === "denied";

    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: value,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    setConsent(value);
    setShowBanner(false);
  };

  return (
    <>
      {consent === "granted" ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      ) : null}

      {showBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--slate-200)] bg-white/95 px-5 py-4 shadow-[0_-16px_40px_rgba(7,24,38,0.14)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black text-[var(--navy-950)]">Analityka strony</p>
              <p className="mt-1 text-sm leading-6 text-[var(--slate-700)]">
                Używamy Google Analytics, żeby anonimowo sprawdzać, które treści są czytane i jak rozwijać TerminyBHP.pl. Analityka uruchomi się tylko po Twojej zgodzie.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => saveConsent("denied")}
                className="rounded-[14px] border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]"
              >
                Nie zgadzam się
              </button>
              <button
                type="button"
                onClick={() => saveConsent("granted")}
                className="rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]"
              >
                Zgadzam się
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

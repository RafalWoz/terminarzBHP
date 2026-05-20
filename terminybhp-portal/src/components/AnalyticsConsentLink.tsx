"use client";

import { openAnalyticsConsent } from "@/components/AnalyticsConsent";

export function AnalyticsConsentLink() {
  return (
    <button type="button" onClick={openAnalyticsConsent} className="text-left hover:text-white">
      Ustawienia analityki
    </button>
  );
}

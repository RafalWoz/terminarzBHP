"use client";

import { useEffect } from "react";

export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.getRegistrations().then((registrations) =>
      Promise.all(
        registrations
          .filter((registration) => new URL(registration.scope).pathname === "/")
          .map((registration) => registration.unregister()),
      ),
    );
  }, []);

  return null;
}

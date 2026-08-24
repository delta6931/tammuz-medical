"use client";

/* Basic site measurement. Advertising features stay disabled. */
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    tmzTrack?: (name: string, parameters?: Record<string, unknown>) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-7NVF0SV5XN";

export function trackEvent(name: string, parameters: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", name, parameters);
  else window.dataLayer?.push({ event: name, ...parameters });
}

export function trackToolUse(
  toolName: string,
  action: string,
  locale: string,
  parameters: Record<string, unknown> = {},
) {
  trackEvent("tool_use", { tool_name: toolName, action, locale: locale.toLowerCase(), ...parameters });
}

function loadAnalytics() {
  if (GA_ID && !document.querySelector("script[data-tmz-ga]")) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.dataset.tmzGa = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  }
}

export function Analytics() {
  useEffect(() => {
    window.tmzTrack = trackEvent;
    loadAnalytics();
  }, []);

  return null;
}

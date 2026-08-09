"use client";

/* Privacy-first analytics: third-party scripts load only after consent. */
import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
    tmzTrack?: (name: string, parameters?: Record<string, unknown>) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CONSENT_KEY = "tmz_analytics_consent";

export function trackEvent(name: string, parameters: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event: name, ...parameters });
  window.gtag?.("event", name, parameters);
  window.fbq?.("trackCustom", name, parameters);
}

function loadAnalytics() {
  if (GA_ID && !document.querySelector("script[data-tmz-ga]")) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.dataset.tmzGa = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  }

  if (META_ID && !document.querySelector("script[data-tmz-meta]")) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    }) as NonNullable<Window["fbq"]>;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    fbq("init", META_ID);
    fbq("track", "PageView");
    const script = document.createElement("script");
    script.async = true;
    script.dataset.tmzMeta = "true";
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
}

export function Analytics() {
  const [choice, setChoice] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    window.tmzTrack = trackEvent;
    const saved = localStorage.getItem(CONSENT_KEY) as "accepted" | "declined" | null;
    setChoice(saved);
    if (saved === "accepted") loadAnalytics();
  }, []);

  function decide(next: "accepted" | "declined") {
    localStorage.setItem(CONSENT_KEY, next);
    setChoice(next);
    if (next === "accepted") loadAnalytics();
  }

  if (choice !== null || (!GA_ID && !META_ID)) return null;

  return (
    <aside className="consent" aria-label="Analytics privacy choice">
      <p>We use optional analytics to understand which pages help buyers. No analytics or advertising scripts load until you accept. <a href="/privacy">Privacy policy</a></p>
      <div>
        <button className="button primary" type="button" onClick={() => decide("accepted")}>Accept analytics</button>
        <button className="button" type="button" onClick={() => decide("declined")}>Decline</button>
      </div>
    </aside>
  );
}

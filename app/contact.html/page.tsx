import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  title: "Request a Dental Supply Quote | Turkey & Iraq | Tammuz Medical",
  description: "Send a product list or request sourcing guidance from Tammuz Global Medical.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() { return <SitePage page="contact" initialLocale="EN" canonicalPath="/contact" />; }

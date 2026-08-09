import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  title: "Verified European Dental Manufacturers | Tammuz Medical",
  description: "How Tammuz Global Medical evaluates European manufacturers, documentation and pre-shipment requirements.",
  alternates: { canonical: "/verified-manufacturers" },
  openGraph: { url: "/verified-manufacturers" },
};

export default function ManufacturersPage() { return <SitePage page="manufacturers" initialLocale="EN" canonicalPath="/verified-manufacturers" />; }

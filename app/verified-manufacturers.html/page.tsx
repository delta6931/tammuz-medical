import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  alternates: { canonical: "/verified-manufacturers.html" },
  openGraph: { url: "/verified-manufacturers.html" },
};

export default function ManufacturersPage() { return <SitePage page="manufacturers" />; }

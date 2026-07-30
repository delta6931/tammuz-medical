import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  alternates: { canonical: "/catalog.html" },
  openGraph: { url: "/catalog.html" },
};

export default function CatalogPage() { return <SitePage page="catalog" />; }

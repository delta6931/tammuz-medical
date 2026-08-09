import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  title: "AsaDental Dental Instruments Catalog | Tammuz Medical",
  description: "Search 2,959 AsaDental dental instrument references by product name, item code or clinical category.",
  alternates: { canonical: "/catalog" },
  openGraph: { url: "/catalog" },
};

export default function CatalogPage() { return <SitePage page="catalog" initialLocale="EN" canonicalPath="/catalog" />; }

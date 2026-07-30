import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  alternates: { canonical: "/index.html" },
  openGraph: { url: "/index.html" },
};

export default function IndexPage() { return <SitePage />; }

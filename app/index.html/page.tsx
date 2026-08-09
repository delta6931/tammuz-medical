import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function IndexPage() { return <SitePage initialLocale="EN" canonicalPath="/" />; }

import type { Metadata } from "next";
import { SitePage } from "./_components/SitePage";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { en: "/", tr: "/tr", ar: "/ar", "x-default": "/" } },
  openGraph: { url: "/" },
};

export default function Home() { return <SitePage initialLocale="EN" canonicalPath="/" />; }

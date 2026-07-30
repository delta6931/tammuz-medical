import type { Metadata } from "next";
import { SitePage } from "./_components/SitePage";

export const metadata: Metadata = {
  title: "Page Not Found | Tammuz Medical",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <SitePage page="not-found" />;
}

import type { Metadata } from "next";
import { SitePage } from "../_components/SitePage";

export const metadata: Metadata = {
  alternates: { canonical: "/contact.html" },
  openGraph: { url: "/contact.html" },
};

export default function ContactPage() { return <SitePage page="contact" />; }

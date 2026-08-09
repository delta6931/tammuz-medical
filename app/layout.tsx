import type { Metadata } from "next";
import { Analytics } from "./_components/Analytics";
import "./globals.css";

const title = "Tammuz Medical — Premium Medical & Dental Supplies | Turkey & Iraq";

export const metadata: Metadata = {
  metadataBase: new URL("https://tammuzmedical.com"),
  title,
  description: "European dental and medical supply for clinics, distributors and procurement teams in Turkey and Iraq.",
  openGraph: {
    title,
    description: "European dental and medical supply for clinics, distributors and procurement teams in Turkey and Iraq.",
    images: [{ url: "/assets/social/tammuz-medical-og.webp", width: 1200, height: 630, alt: "Tammuz Global Medical European dental supply for Turkey and Iraq" }],
  },
  twitter: { card: "summary_large_image", title, images: ["/assets/social/tammuz-medical-og.webp"] },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tammuzmedical.com/#organization",
        name: "Tammuz Global Medical",
        alternateName: "Tammuz Medical",
        url: "https://tammuzmedical.com",
        logo: "https://tammuzmedical.com/assets/brand/tammuz-global-medical.png",
        email: "info@tammuzmedical.com",
        telephone: "+905338877740",
        areaServed: ["Turkey", "Iraq"],
        sameAs: [
          "https://www.instagram.com/tammuzmedical",
          "https://www.facebook.com/share/1EwfKRBYuT/?mibextid=wwXIfr",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://tammuzmedical.com/#website",
        url: "https://tammuzmedical.com",
        name: "Tammuz Medical",
        publisher: { "@id": "https://tammuzmedical.com/#organization" },
        inLanguage: ["en", "tr", "ar"],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}

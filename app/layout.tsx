import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tammuzmedical.com"),
  title: "Tammuz Medical — Premium Medical & Dental Supplies | Turkey & Iraq",
  description: "Premium dental and medical supplies for clinics and distributors in Turkey and Iraq.",
  openGraph: { title: "Tammuz Medical — Premium Medical & Dental Supplies | Turkey & Iraq", description: "Premium dental supply, delivered with confidence.", images: [{ url: "/og.png", width: 1792, height: 936, alt: "Tammuz Medical premium dental supply" }] },
  twitter: { card: "summary_large_image", title: "Tammuz Medical — Premium Medical & Dental Supplies | Turkey & Iraq", images: ["/og.png"] },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

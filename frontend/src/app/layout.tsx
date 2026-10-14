import type { Metadata } from "next";
import "./globals.css";
import { NavbarComponent } from "@/components/NavbarComponent";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "SpamOut - Email Security Platform",
  description: "Advanced Email Spoofing & Phishing Detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <NavbarComponent />
          {children}
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

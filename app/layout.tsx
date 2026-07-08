import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import LenisProvider from "@/components/providers/LenisProvider";

/* ----------------------------------------------------------------
   Fonts — Poppins for headings, Inter for body text.
   CSS variables are consumed by @theme in globals.css.
   ---------------------------------------------------------------- */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* ----------------------------------------------------------------
   SEO Metadata
   ---------------------------------------------------------------- */
export const metadata: Metadata = {
  title: "LUXE — Premium Clothing & Accessories",
  description:
    "Shop premium clothing, leather wallets, bags, and accessories. Free shipping on orders over $50. Discover timeless style at LUXE.",
  keywords: [
    "luxury fashion",
    "premium accessories",
    "leather wallets",
    "designer bags",
    "clothing store",
  ],
};

/* ----------------------------------------------------------------
   Root Layout
   ---------------------------------------------------------------- */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LenisProvider>{children}</LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

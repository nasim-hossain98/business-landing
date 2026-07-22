import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import { CartProvider } from "@/components/providers/CartContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
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
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <CartProvider>
            <LenisProvider>{children}</LenisProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

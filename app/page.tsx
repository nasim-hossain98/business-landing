import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductsGrid from "@/components/ProductsGrid";
import Reviews from "@/components/Reviews";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

/**
 * Home page — assembles all landing page sections in order.
 * Each section is a self-contained client component.
 */
export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <Categories />
      <ProductsGrid />
      <Reviews />
      <TrustSection />
      <Footer />
    </main>
  );
}

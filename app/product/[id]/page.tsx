import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, CreditCard, ChevronLeft, Check, Quote } from "lucide-react";
import { products } from "@/data/products";
import { reviews } from "@/data/reviews";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Generate static routes at build time for all products
export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id.toString() === id);

  if (!product) {
    notFound();
  }

  // Filter reviews for this specific product, or fallback to the first 3 if none exist
  let productReviews = reviews.filter((r) => r.product === product.name);
  if (productReviews.length === 0) {
    productReviews = reviews.slice(0, 3);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6">
          {/* Back Button */}
          <div className="py-6">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-amber-500 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Collection
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left: Product Image */}
            <AnimatedSection className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 shadow-xl lg:sticky lg:top-32">
              {product.badge && (
                <div className="absolute top-6 left-6 z-10 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                  {product.badge}
                </div>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </AnimatedSection>

            {/* Right: Product Info */}
            <AnimatedSection delay={0.2} className="flex flex-col pt-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-amber-500 mb-2">
                {product.category}
              </p>
              <h1 className="font-heading text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800 text-zinc-200 dark:text-zinc-800"}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                ${product.price.toFixed(2)}
              </p>

              <div className="prose prose-zinc dark:prose-invert max-w-none mb-10">
                <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-10">
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-zinc-900 dark:border-white px-8 py-4 text-base font-semibold text-zinc-900 dark:text-white transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100">
                  <CreditCard size={20} />
                  Buy Now
                </button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>

      {/* Reviews Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
              Customer Reviews
            </h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
              See what our customers have to say about the {product.name}.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {productReviews.map((review, i) => (
              <AnimatedSection key={review.id} delay={i * 0.15}>
                <div className="h-full rounded-2xl bg-white dark:bg-zinc-800/80 p-8 shadow-sm border border-zinc-100 dark:border-zinc-700/50 hover:shadow-lg transition-shadow duration-300">
                  <Quote size={32} className="text-amber-500/20 mb-4" fill="currentColor" />
                  
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className={j < review.rating ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-700 text-zinc-200 dark:text-zinc-700"}
                      />
                    ))}
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                    "{review.quote}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white shadow-md">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {review.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Verified Buyer
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

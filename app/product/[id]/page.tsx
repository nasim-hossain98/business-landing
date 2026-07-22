import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronLeft, Check, Quote } from "lucide-react";
import { products } from "@/data/products";
import { reviews } from "@/data/reviews";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ProductActions from "@/components/ProductActions";

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

  let productReviews = reviews.filter((r) => r.product === product.name);
  if (productReviews.length === 0) {
    productReviews = reviews.slice(0, 3);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="py-6">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-500 transition-colors duration-300"
            >
              <ChevronLeft size={16} />
              Back to Collection
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <AnimatedSection direction="left" className="relative aspect-square overflow-hidden rounded-3xl bg-stone-100 dark:bg-stone-900 shadow-xl lg:sticky lg:top-32">
              {product.badge && (
                <div className="absolute top-6 left-6 z-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg tracking-wider uppercase">
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

            <AnimatedSection direction="right" delay={0.2} className="flex flex-col pt-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500 mb-3">
                {product.category}
              </p>
              <h1 className="font-heading text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl lg:text-7xl mb-5 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? "fill-amber-400" : "fill-stone-200 dark:fill-stone-800 text-stone-200 dark:text-stone-800"}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold text-stone-900 dark:text-white mb-8">
                ${product.price.toFixed(2)}
              </p>

              <div className="prose prose-stone dark:prose-invert max-w-none mb-10">
                <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-10">
                <h3 className="font-heading text-lg font-semibold text-stone-900 dark:text-white mb-4">
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <ProductActions product={product} />
            </AnimatedSection>
          </div>
        </div>
      </main>

      <section className="py-24 bg-cream-50 dark:bg-stone-950/80">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-14">
            <h2 className="font-heading text-4xl font-bold text-stone-900 dark:text-white sm:text-5xl">
              Customer Reviews
            </h2>
            <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
              See what our customers have to say about the {product.name}.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {productReviews.map((review, i) => (
              <AnimatedSection key={review.id} delay={i * 0.12} direction="up">
                <div className="h-full rounded-3xl bg-white dark:bg-stone-800/80 p-8 shadow-sm border border-stone-100 dark:border-stone-700/50 transition-all duration-500 hover:shadow-lg hover:border-amber-200/50 dark:hover:border-amber-600/30">
                  <Quote size={24} className="text-amber-500/20 mb-5" fill="currentColor" />
                  
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className={j < review.rating ? "fill-amber-400" : "fill-stone-200 dark:fill-stone-700 text-stone-200 dark:text-stone-700"}
                      />
                    ))}
                  </div>

                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6 text-[15px]">
                    &ldquo;{review.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white shadow-md">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-white text-sm">
                        {review.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
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

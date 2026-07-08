import type { Product } from "@/data/products";

/**
 * Shared category definitions used by both the homepage category cards
 * and the /category/[category] route. `slug` is what appears in the URL;
 * `dataCategory` is the value stored on Product.category in data/products.ts.
 */
export type Category = {
  slug: string;
  label: string;
  description: string;
  image: string;
  dataCategory: Product["category"];
};

export const categories: Category[] = [
  {
    slug: "clothes",
    label: "Clothes",
    description: "Premium apparel",
    image: "/images/cat-clothes.jpg",
    dataCategory: "clothes",
  },
  {
    slug: "wallets",
    label: "Wallets",
    description: "Leather essentials",
    image: "/images/cat-wallets.jpg",
    dataCategory: "wallets",
  },
  {
    slug: "bags",
    label: "Bags",
    description: "Carry in style",
    image: "/images/cat-bags.jpg",
    dataCategory: "bags",
  },
  {
    slug: "accessories",
    label: "Accessories",
    description: "Finishing touches",
    image: "/images/cat-others.jpg",
    dataCategory: "others",
  },
];

/** Look up a category by its URL slug, or undefined if not found. */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export type Product = {
  id: number;
  name: string;
  price: number;
  category: "clothes" | "wallets" | "bags" | "others";
  image: string;
  badge?: string;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Navy Blazer",
    price: 189.99,
    category: "clothes",
    image: "/images/product-1.jpg",
    badge: "New",
    description: "A tailored navy blazer crafted from premium Italian wool. This versatile piece effortlessly transitions from the boardroom to evening events, featuring a modern slim fit, notched lapels, and sophisticated horn buttons.",
    features: [
      "100% Premium Italian Wool",
      "Modern slim fit",
      "Two-button closure",
      "Fully lined interior"
    ],
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: 2,
    name: "Leather Bifold Wallet",
    price: 59.99,
    category: "wallets",
    image: "/images/product-2.jpg",
    badge: "Best Seller",
    description: "Handcrafted from full-grain leather, this minimalist bifold wallet offers exceptional durability and a sleek profile. Over time, the leather develops a rich, unique patina that tells your personal story.",
    features: [
      "Full-grain vegetable-tanned leather",
      "6 card slots and 1 bill compartment",
      "RFID blocking technology",
      "Slim profile design"
    ],
    rating: 4.9,
    reviewCount: 342
  },
  {
    id: 3,
    name: "Canvas Tote Bag",
    price: 79.99,
    category: "bags",
    image: "/images/product-3.jpg",
    description: "Your perfect everyday companion. This heavyweight canvas tote is designed to withstand daily wear and tear while maintaining a refined aesthetic. Features genuine leather handles and a spacious interior.",
    features: [
      "Heavyweight 18oz cotton canvas",
      "Genuine leather handles",
      "Interior zip pocket",
      "Water-resistant bottom"
    ],
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: 4,
    name: "Premium Cotton Tee",
    price: 39.99,
    category: "clothes",
    image: "/images/product-4.jpg",
    description: "The ultimate everyday t-shirt. Knitted from ultra-soft, breathable pima cotton, this tee offers a tailored fit that retains its shape wash after wash. An essential foundation for any wardrobe.",
    features: [
      "100% Peruvian Pima Cotton",
      "Pre-shrunk fabric",
      "Tagless neck label",
      "Tailored fit"
    ],
    rating: 4.6,
    reviewCount: 215
  },
  {
    id: 5,
    name: "Leather Crossbody Bag",
    price: 129.99,
    category: "bags",
    image: "/images/product-5.jpg",
    badge: "Popular",
    description: "An elegant crossbody bag designed for the modern professional. The structured silhouette and premium hardware make it a standout piece, while the thoughtfully organized interior keeps your essentials secure.",
    features: [
      "Premium smooth leather",
      "Adjustable shoulder strap",
      "Gold-tone hardware",
      "Multiple interior compartments"
    ],
    rating: 4.9,
    reviewCount: 156
  },
  {
    id: 6,
    name: "Minimalist Card Holder",
    price: 34.99,
    category: "wallets",
    image: "/images/product-6.jpg",
    description: "For those who prefer to carry only the essentials. This ultra-slim card holder fits perfectly in any pocket without adding bulk, crafted from the same high-quality leather as our flagship wallets.",
    features: [
      "Holds up to 4 cards securely",
      "Central pocket for folded bills",
      "Ultra-slim 3mm profile",
      "Hand-stitched edges"
    ],
    rating: 4.8,
    reviewCount: 421
  },
  {
    id: 7,
    name: "Vintage Denim Jacket",
    price: 149.99,
    category: "clothes",
    image: "/images/product-7.jpg",
    badge: "Trending",
    description: "A timeless classic reimagined. Our vintage-wash denim jacket features a relaxed fit and authentic distressing that gives it a lived-in look from day one. Constructed from durable, heavy-weight denim.",
    features: [
      "14oz heavyweight denim",
      "Authentic vintage wash",
      "Custom branded hardware",
      "Adjustable waist tabs"
    ],
    rating: 4.5,
    reviewCount: 78
  },
  {
    id: 8,
    name: "Cognac Leather Belt",
    price: 44.99,
    category: "others",
    image: "/images/product-8.svg",
    description: "The perfect finishing touch to any outfit. This versatile cognac leather belt is crafted from a single piece of thick, full-grain leather and finished with a solid brass buckle that will stand the test of time.",
    features: [
      "Solid full-grain leather strap",
      "Solid brass buckle",
      "1.5 inch width",
      "Hand-burnished edges"
    ],
    rating: 4.7,
    reviewCount: 112
  },
  {
    id: 9,
    name: "Silk Pattern Scarf",
    price: 64.99,
    category: "others",
    image: "/images/product-9.svg",
    description: "Add a touch of elegance with our pure silk patterned scarf. Featuring an exclusive in-house design, the luxurious drape and vibrant colors make it a versatile accessory for any season.",
    features: [
      "100% Pure Mulberry Silk",
      "Hand-rolled edges",
      "Exclusive geometric pattern",
      "Large 36x36 inch square"
    ],
    rating: 4.9,
    reviewCount: 45
  },
  {
    id: 10,
    name: "Premium Sunglasses",
    price: 119.99,
    category: "others",
    image: "/images/product-10.svg",
    badge: "Limited",
    description: "Protect your eyes in style. These premium sunglasses feature polarized lenses and a lightweight acetate frame. The classic silhouette flatters a variety of face shapes and adds an instant edge to your look.",
    features: [
      "Polarized UV400 lenses",
      "Handcrafted acetate frame",
      "Sturdy 5-barrel hinges",
      "Includes protective leather case"
    ],
    rating: 4.6,
    reviewCount: 67
  },
];

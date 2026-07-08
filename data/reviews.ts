export type Review = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  quote: string;
  product: string;
};

export const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: "SM",
    rating: 5,
    quote:
      "Absolutely love the quality of the leather wallet I purchased. The craftsmanship is exceptional and it arrived beautifully packaged. Will definitely be ordering again!",
    product: "Leather Bifold Wallet",
  },
  {
    id: 2,
    name: "James Chen",
    avatar: "JC",
    rating: 5,
    quote:
      "The canvas tote bag exceeded my expectations. Perfect size for daily use, and the material feels premium. Great attention to detail.",
    product: "Canvas Tote Bag",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "ER",
    rating: 4,
    quote:
      "Ordered the denim jacket and it fits perfectly. The vintage wash gives it such a unique character. Fast shipping too!",
    product: "Vintage Denim Jacket",
  },
  {
    id: 4,
    name: "Michael Park",
    avatar: "MP",
    rating: 5,
    quote:
      "Best sunglasses I've ever owned. The build quality is incredible for the price. These feel like they should cost twice as much.",
    product: "Premium Sunglasses",
  },
  {
    id: 5,
    name: "Olivia Taylor",
    avatar: "OT",
    rating: 5,
    quote:
      "The silk scarf is simply gorgeous. The colors are even more vibrant in person. I've received so many compliments wearing it.",
    product: "Silk Pattern Scarf",
  },
  {
    id: 6,
    name: "David Kim",
    avatar: "DK",
    rating: 4,
    quote:
      "Great blazer — the fit is modern and slim without being too tight. Perfect for both office and weekend wear. Highly recommend.",
    product: "Classic Navy Blazer",
  },
  {
    id: 7,
    name: "Aisha Johnson",
    avatar: "AJ",
    rating: 5,
    quote:
      "This crossbody bag is my new everyday companion. Lightweight yet durable, and the leather just gets better with age. Stunning!",
    product: "Leather Crossbody Bag",
  },
  {
    id: 8,
    name: "Thomas Weber",
    avatar: "TW",
    rating: 5,
    quote:
      "Minimalist card holder is exactly what I needed. Slim, elegant, and fits perfectly in my front pocket. Outstanding quality.",
    product: "Minimalist Card Holder",
  },
];

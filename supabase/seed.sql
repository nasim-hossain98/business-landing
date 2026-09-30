-- supabase/seed.sql — opening catalogue (run once, after 001–006)
--
-- Mirrors `data/products.ts` so the Supabase storefront opens with the same
-- ten pieces that ship with the landing page. `on conflict (slug) do nothing`
-- makes the script safe to re-run.

insert into public.products
  (name, slug, description, price, category, image_url, stock_quantity, sku, status, badge, features, options, rating, review_count)
values
  (
    'Classic Navy Blazer', 'classic-navy-blazer',
    'A tailored navy blazer crafted from premium Italian wool. This versatile piece effortlessly transitions from the boardroom to evening events, featuring a modern slim fit, notched lapels, and sophisticated horn buttons.',
    189.99, 'clothes', '/images/product-1.jpg', 24, 'LUXE-BLZ-001', 'active', 'New',
    array['100% Premium Italian Wool', 'Modern slim fit', 'Two-button closure', 'Fully lined interior'],
    '[{"label":"Size","values":["S","M","L","XL","2XL","3XL"]}]'::jsonb,
    4.8, 124
  ),
  (
    'Leather Bifold Wallet', 'leather-bifold-wallet',
    'Handcrafted from full-grain leather, this minimalist bifold wallet offers exceptional durability and a sleek profile. Over time, the leather develops a rich, unique patina that tells your personal story.',
    59.99, 'wallets', '/images/product-2.jpg', 24, 'LUXE-WLT-002', 'active', 'Best Seller',
    array['Full-grain vegetable-tanned leather', '6 card slots and 1 bill compartment', 'RFID blocking technology', 'Slim profile design'],
    '[{"label":"Color","values":["Black","Brown","Tan","Cognac"]}]'::jsonb,
    4.9, 342
  ),
  (
    'Canvas Tote Bag', 'canvas-tote-bag',
    'Your perfect everyday companion. This heavyweight canvas tote is designed to withstand daily wear and tear while maintaining a refined aesthetic. Features genuine leather handles and a spacious interior.',
    79.99, 'bags', '/images/product-3.jpg', 24, 'LUXE-BAG-003', 'active', null,
    array['Heavyweight 18oz cotton canvas', 'Genuine leather handles', 'Interior zip pocket', 'Water-resistant bottom'],
    '[{"label":"Color","values":["Black","Brown","Tan","Navy","Olive"]}]'::jsonb,
    4.7, 89
  ),
  (
    'Premium Cotton Tee', 'premium-cotton-tee',
    'The ultimate everyday t-shirt. Knitted from ultra-soft, breathable pima cotton, this tee offers a tailored fit that retains its shape wash after wash. An essential foundation for any wardrobe.',
    39.99, 'clothes', '/images/product-4.jpg', 24, 'LUXE-TEE-004', 'active', null,
    array['100% Peruvian Pima Cotton', 'Pre-shrunk fabric', 'Tagless neck label', 'Tailored fit'],
    '[{"label":"Size","values":["S","M","L","XL","2XL","3XL"]}]'::jsonb,
    4.6, 215
  ),
  (
    'Leather Crossbody Bag', 'leather-crossbody-bag',
    'An elegant crossbody bag designed for the modern professional. The structured silhouette and premium hardware make it a standout piece, while the thoughtfully organized interior keeps your essentials secure.',
    129.99, 'bags', '/images/product-5.jpg', 24, 'LUXE-BAG-005', 'active', 'Popular',
    array['Premium smooth leather', 'Adjustable shoulder strap', 'Gold-tone hardware', 'Multiple interior compartments'],
    '[{"label":"Color","values":["Black","Brown","Tan","Navy","Burgundy"]}]'::jsonb,
    4.9, 156
  ),
  (
    'Minimalist Card Holder', 'minimalist-card-holder',
    'For those who prefer to carry only the essentials. This ultra-slim card holder fits perfectly in any pocket without adding bulk, crafted from the same high-quality leather as our flagship wallets.',
    34.99, 'wallets', '/images/product-6.jpg', 24, 'LUXE-WLT-006', 'active', null,
    array['Holds up to 4 cards securely', 'Central pocket for folded bills', 'Ultra-slim 3mm profile', 'Hand-stitched edges'],
    '[{"label":"Color","values":["Black","Brown","Tan","Cognac"]}]'::jsonb,
    4.8, 421
  ),
  (
    'Vintage Denim Jacket', 'vintage-denim-jacket',
    'A timeless classic reimagined. Our vintage-wash denim jacket features a relaxed fit and authentic distressing that gives it a lived-in look from day one. Constructed from durable, heavy-weight denim.',
    149.99, 'clothes', '/images/product-7.jpg', 24, 'LUXE-DNM-007', 'active', 'Trending',
    array['14oz heavyweight denim', 'Authentic vintage wash', 'Custom branded hardware', 'Adjustable waist tabs'],
    '[{"label":"Size","values":["S","M","L","XL","2XL","3XL"]}]'::jsonb,
    4.5, 78
  ),
  (
    'Cognac Leather Belt', 'cognac-leather-belt',
    'The perfect finishing touch to any outfit. This versatile cognac leather belt is crafted from a single piece of thick, full-grain leather and finished with a solid brass buckle that will stand the test of time.',
    44.99, 'others', '/images/product-8.svg', 24, 'LUXE-ACC-008', 'active', null,
    array['Solid full-grain leather strap', 'Solid brass buckle', '1.5 inch width', 'Hand-burnished edges'],
    '[{"label":"Waist Size","values":["30","32","34","36","38","40"]}]'::jsonb,
    4.7, 112
  ),
  (
    'Silk Pattern Scarf', 'silk-pattern-scarf',
    'Add a touch of elegance with our pure silk patterned scarf. Featuring an exclusive in-house design, the luxurious drape and vibrant colors make it a versatile accessory for any season.',
    64.99, 'others', '/images/product-9.svg', 24, 'LUXE-ACC-009', 'active', null,
    array['100% Pure Mulberry Silk', 'Hand-rolled edges', 'Exclusive geometric pattern', 'Large 36x36 inch square'],
    '[{"label":"Color","values":["Navy","Burgundy","Emerald","Blush"]}]'::jsonb,
    4.9, 45
  ),
  (
    'Premium Sunglasses', 'premium-sunglasses',
    'Protect your eyes in style. These premium sunglasses feature polarized lenses and a lightweight acetate frame. The classic silhouette flatters a variety of face shapes and adds an instant edge to your look.',
    119.99, 'others', '/images/product-10.svg', 24, 'LUXE-ACC-010', 'active', 'Limited',
    array['Polarized UV400 lenses', 'Handcrafted acetate frame', 'Sturdy 5-barrel hinges', 'Includes protective leather case'],
    '[{"label":"Frame","values":["Black Frame","Gold Frame","Tortoise Frame"]}]'::jsonb,
    4.6, 67
  )
on conflict (slug) do nothing;



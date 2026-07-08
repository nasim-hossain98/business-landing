"""
Premium E-Commerce Placeholder Image Generator
Generates high-end, warm-toned lifestyle placeholder images for a landing page.
Uses Pillow for image generation with gradients, textures, and elegant typography.
"""

import os
import random
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Color Palettes (warm, premium tones) ──────────────────────────────────────

PALETTES = {
    "hero": {
        "bg_start": (42, 32, 28),      # deep warm brown
        "bg_end": (78, 56, 44),         # warm mocha
        "accent": (198, 168, 132),      # champagne gold
        "text": (232, 218, 198),        # warm cream
        "overlay": (24, 18, 14),        # near-black warm
    },
    "clothes": {
        "bg_start": (62, 56, 52),       # charcoal warm
        "bg_end": (98, 86, 74),         # taupe
        "accent": (188, 162, 130),      # sand gold
        "text": (240, 228, 212),        # ivory
        "overlay": (34, 28, 24),
    },
    "wallets": {
        "bg_start": (56, 38, 28),       # dark leather brown
        "bg_end": (112, 78, 52),        # cognac
        "accent": (212, 182, 142),      # light gold
        "text": (248, 236, 220),        # soft white
        "overlay": (32, 20, 14),
    },
    "bags": {
        "bg_start": (48, 42, 38),       # dark taupe
        "bg_end": (88, 72, 58),         # warm umber
        "accent": (202, 176, 144),      # wheat gold
        "text": (242, 230, 214),
        "overlay": (28, 22, 18),
    },
    "others": {
        "bg_start": (52, 44, 36),       # espresso
        "bg_end": (94, 78, 62),         # walnut
        "accent": (208, 180, 146),      # amber gold
        "text": (244, 232, 216),
        "overlay": (30, 24, 18),
    },
    "product_warm": {
        "bg_start": (245, 238, 228),    # warm white
        "bg_end": (228, 218, 204),      # soft beige
        "accent": (168, 138, 104),      # muted gold
        "text": (62, 48, 38),           # dark brown text
        "overlay": (198, 182, 162),
    },
    "product_cool": {
        "bg_start": (240, 236, 230),    # cool cream
        "bg_end": (222, 214, 204),      # stone
        "accent": (148, 122, 96),       # bronze
        "text": (58, 44, 34),
        "overlay": (188, 172, 152),
    },
    "product_dark": {
        "bg_start": (58, 48, 40),       # dark mocha
        "bg_end": (88, 72, 58),         # warm brown
        "accent": (198, 172, 138),      # gold
        "text": (238, 226, 210),
        "overlay": (38, 28, 22),
    },
}


def lerp_color(c1, c2, t):
    """Linear interpolation between two colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def create_gradient(draw, width, height, color_start, color_end, angle=135):
    """Create a smooth diagonal gradient."""
    rad = math.radians(angle)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    max_d = abs(width * cos_a) + abs(height * sin_a)

    for y in range(height):
        for x in range(0, width, 2):  # Step by 2 for speed
            d = x * cos_a + y * sin_a
            t = max(0, min(1, (d / max_d + 0.5)))
            color = lerp_color(color_start, color_end, t)
            draw.rectangle([x, y, x + 1, y], fill=color)


def create_gradient_fast(img, color_start, color_end, angle=135):
    """Create gradient using a smaller image and upscaling for speed."""
    w, h = img.size
    # Create at 1/8 size then upscale
    small_w, small_h = max(w // 8, 1), max(h // 8, 1)
    small = Image.new("RGB", (small_w, small_h))
    draw = ImageDraw.Draw(small)

    rad = math.radians(angle)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    max_d = abs(small_w * cos_a) + abs(small_h * sin_a)

    for y in range(small_h):
        for x in range(small_w):
            d = x * cos_a + y * sin_a
            t = max(0, min(1, (d / max_d + 0.5)))
            color = lerp_color(color_start, color_end, t)
            draw.point((x, y), fill=color)

    gradient = small.resize((w, h), Image.BICUBIC)
    img.paste(gradient)
    return img


def add_noise_texture(img, intensity=12):
    """Add subtle film-grain noise for premium texture."""
    w, h = img.size
    pixels = img.load()
    random.seed(42)  # Consistent texture
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            noise = random.randint(-intensity, intensity)
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise)),
            )
    return img


def add_vignette(img, strength=0.4):
    """Add a soft vignette effect."""
    w, h = img.size
    vignette = Image.new("L", (w, h), 255)
    draw = ImageDraw.Draw(vignette)

    cx, cy = w // 2, h // 2
    max_r = math.sqrt(cx ** 2 + cy ** 2)

    for i in range(40):
        t = i / 40
        radius_x = int(cx * (1.2 - t * 0.8))
        radius_y = int(cy * (1.2 - t * 0.8))
        alpha = int(255 * (1 - t * strength))
        draw.ellipse(
            [cx - radius_x, cy - radius_y, cx + radius_x, cy + radius_y],
            fill=alpha,
        )

    img_rgba = img.convert("RGBA")
    dark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dark_layer = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    vignette_inv = Image.eval(vignette, lambda x: 255 - x)
    dark_layer.putalpha(vignette_inv)
    result = Image.alpha_composite(img_rgba, dark_layer)
    return result.convert("RGB")


def draw_geometric_elements(draw, width, height, accent_color, style="minimal"):
    """Draw elegant geometric decorative elements."""
    alpha_accent = accent_color + (40,)

    if style == "hero":
        # Elegant diagonal lines
        for i in range(5):
            offset = width // 6 * (i + 1)
            draw.line(
                [(offset, 0), (offset - height // 3, height)],
                fill=accent_color + (20,), width=1,
            )
        # Diamond shapes
        cx, cy = width // 2, height // 2
        size = min(width, height) // 4
        draw.polygon(
            [(cx, cy - size), (cx + size, cy), (cx, cy + size), (cx - size, cy)],
            outline=accent_color + (50,),
        )
        draw.polygon(
            [(cx, cy - size // 2), (cx + size // 2, cy), (cx, cy + size // 2), (cx - size // 2, cy)],
            outline=accent_color + (30,),
        )

    elif style == "category":
        # Subtle frame lines
        margin = min(width, height) // 12
        draw.rectangle(
            [margin, margin, width - margin, height - margin],
            outline=accent_color + (35,), width=1,
        )
        draw.rectangle(
            [margin + 8, margin + 8, width - margin - 8, height - margin - 8],
            outline=accent_color + (20,), width=1,
        )

    elif style == "product":
        # Clean circle backdrop
        cx, cy = width // 2, height // 2 - height // 12
        radius = min(width, height) // 3
        for r in range(radius, radius - 4, -1):
            alpha = 25 - (radius - r) * 6
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r],
                outline=accent_color + (max(alpha, 5),),
            )


def get_font(size):
    """Try to load a good font, fall back to default."""
    font_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()


def get_font_bold(size):
    """Try to load a bold font."""
    font_paths = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return get_font(size)


def get_font_light(size):
    """Try to load a light font."""
    font_paths = [
        "C:/Windows/Fonts/segoeuil.ttf",
        "C:/Windows/Fonts/calibril.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return get_font(size)


def draw_product_icon(draw, cx, cy, size, icon_type, color):
    """Draw a simplified product icon."""
    s = size

    if icon_type == "blazer":
        # Jacket silhouette
        draw.polygon([
            (cx - s, cy + s), (cx - s * 0.8, cy - s),
            (cx - s * 0.15, cy - s * 0.6), (cx, cy - s * 0.8),
            (cx + s * 0.15, cy - s * 0.6), (cx + s * 0.8, cy - s),
            (cx + s, cy + s),
        ], outline=color, width=2)
        # Lapels
        draw.line([(cx, cy - s * 0.8), (cx - s * 0.3, cy + s * 0.2)], fill=color, width=2)
        draw.line([(cx, cy - s * 0.8), (cx + s * 0.3, cy + s * 0.2)], fill=color, width=2)

    elif icon_type == "wallet":
        # Wallet rectangle
        draw.rounded_rectangle(
            [cx - s, cy - s * 0.6, cx + s, cy + s * 0.6],
            radius=s // 6, outline=color, width=2,
        )
        draw.line([(cx - s, cy - s * 0.1), (cx + s, cy - s * 0.1)], fill=color, width=1)
        # Card slot
        draw.rounded_rectangle(
            [cx - s * 0.6, cy + s * 0.05, cx + s * 0.2, cy + s * 0.35],
            radius=s // 12, outline=color + (120,), width=1,
        )

    elif icon_type == "tote":
        # Tote bag
        draw.polygon([
            (cx - s * 0.8, cy - s * 0.3),
            (cx - s * 0.9, cy + s),
            (cx + s * 0.9, cy + s),
            (cx + s * 0.8, cy - s * 0.3),
        ], outline=color, width=2)
        # Handles
        draw.arc([cx - s * 0.5, cy - s, cx - s * 0.1, cy - s * 0.1], 180, 0, fill=color, width=2)
        draw.arc([cx + s * 0.1, cy - s, cx + s * 0.5, cy - s * 0.1], 180, 0, fill=color, width=2)

    elif icon_type == "tshirt":
        # T-shirt folded (rectangle)
        draw.rounded_rectangle(
            [cx - s, cy - s * 0.7, cx + s, cy + s * 0.7],
            radius=s // 8, outline=color, width=2,
        )
        # Fold lines
        draw.line([(cx - s, cy), (cx + s, cy)], fill=color + (80,), width=1)
        draw.line([(cx - s, cy + s * 0.35), (cx + s, cy + s * 0.35)], fill=color + (50,), width=1)

    elif icon_type == "crossbody":
        # Crossbody bag
        draw.rounded_rectangle(
            [cx - s * 0.7, cy - s * 0.5, cx + s * 0.7, cy + s * 0.7],
            radius=s // 5, outline=color, width=2,
        )
        # Flap
        draw.arc([cx - s * 0.7, cy - s * 0.8, cx + s * 0.7, cy + s * 0.1], 180, 0, fill=color, width=2)
        # Strap
        draw.line([(cx + s * 0.7, cy - s * 0.3), (cx + s * 1.2, cy - s)], fill=color, width=2)

    elif icon_type == "cardholder":
        # Slim card holder
        draw.rounded_rectangle(
            [cx - s * 0.8, cy - s * 0.5, cx + s * 0.8, cy + s * 0.5],
            radius=s // 8, outline=color, width=2,
        )
        # Card slots
        for i in range(3):
            y_off = cy - s * 0.25 + i * s * 0.25
            draw.line([(cx - s * 0.5, y_off), (cx + s * 0.5, y_off)], fill=color + (60,), width=1)

    elif icon_type == "denim":
        # Denim jacket
        draw.polygon([
            (cx - s, cy + s), (cx - s * 0.85, cy - s * 0.8),
            (cx - s * 0.5, cy - s), (cx - s * 0.15, cy - s * 0.7),
            (cx, cy - s * 0.85),
            (cx + s * 0.15, cy - s * 0.7),
            (cx + s * 0.5, cy - s), (cx + s * 0.85, cy - s * 0.8),
            (cx + s, cy + s),
        ], outline=color, width=2)
        # Pockets
        draw.rectangle([cx - s * 0.6, cy + s * 0.1, cx - s * 0.15, cy + s * 0.5], outline=color + (80,), width=1)
        draw.rectangle([cx + s * 0.15, cy + s * 0.1, cx + s * 0.6, cy + s * 0.5], outline=color + (80,), width=1)

    elif icon_type == "belt":
        # Belt horizontal
        draw.rounded_rectangle(
            [cx - s * 1.3, cy - s * 0.15, cx + s * 1.3, cy + s * 0.15],
            radius=s // 10, outline=color, width=2,
        )
        # Buckle
        draw.rounded_rectangle(
            [cx - s * 1.3, cy - s * 0.25, cx - s * 0.9, cy + s * 0.25],
            radius=s // 12, outline=color, width=2,
        )
        # Holes
        for i in range(4):
            hx = cx + s * 0.2 + i * s * 0.3
            draw.ellipse([hx - 3, cy - 3, hx + 3, cy + 3], outline=color + (80,), width=1)

    elif icon_type == "scarf":
        # Flowing scarf shape
        points = []
        for i in range(20):
            t = i / 19
            x = cx - s + t * s * 2
            y = cy + math.sin(t * math.pi * 3) * s * 0.3
            points.append((x, y))
        for i in range(19, -1, -1):
            t = i / 19
            x = cx - s + t * s * 2
            y = cy + math.sin(t * math.pi * 3) * s * 0.3 + s * 0.3
            points.append((x, y))
        draw.polygon(points, outline=color, width=2)
        # Pattern lines
        for i in range(1, 19):
            t = i / 19
            x = cx - s + t * s * 2
            y1 = cy + math.sin(t * math.pi * 3) * s * 0.3
            y2 = y1 + s * 0.3
            if i % 3 == 0:
                draw.line([(x, y1), (x, y2)], fill=color + (40,), width=1)

    elif icon_type == "sunglasses":
        # Sunglasses
        # Left lens
        draw.ellipse(
            [cx - s * 1.1, cy - s * 0.35, cx - s * 0.15, cy + s * 0.35],
            outline=color, width=2,
        )
        # Right lens
        draw.ellipse(
            [cx + s * 0.15, cy - s * 0.35, cx + s * 1.1, cy + s * 0.35],
            outline=color, width=2,
        )
        # Bridge
        draw.arc([cx - s * 0.2, cy - s * 0.3, cx + s * 0.2, cy + s * 0.1], 180, 0, fill=color, width=2)
        # Arms
        draw.line([(cx - s * 1.1, cy), (cx - s * 1.5, cy - s * 0.15)], fill=color, width=2)
        draw.line([(cx + s * 1.1, cy), (cx + s * 1.5, cy - s * 0.15)], fill=color, width=2)

    elif icon_type == "collection":
        # Multiple items hint
        draw.rounded_rectangle([cx - s, cy - s * 0.6, cx - s * 0.1, cy + s * 0.6], radius=s // 10, outline=color, width=2)
        draw.rounded_rectangle([cx + s * 0.1, cy - s * 0.8, cx + s, cy + s * 0.2], radius=s // 10, outline=color, width=2)
        draw.ellipse([cx + s * 0.2, cy + s * 0.3, cx + s * 0.8, cy + s * 0.8], outline=color, width=2)

    elif icon_type == "clothing":
        # Hanger with cloth
        draw.arc([cx - s * 0.15, cy - s, cx + s * 0.15, cy - s * 0.6], 0, 180, fill=color, width=2)
        draw.line([(cx, cy - s * 0.6), (cx - s * 0.8, cy - s * 0.2)], fill=color, width=2)
        draw.line([(cx, cy - s * 0.6), (cx + s * 0.8, cy - s * 0.2)], fill=color, width=2)
        draw.polygon([
            (cx - s * 0.8, cy - s * 0.2),
            (cx - s * 0.7, cy + s * 0.8),
            (cx + s * 0.7, cy + s * 0.8),
            (cx + s * 0.8, cy - s * 0.2),
        ], outline=color, width=2)

    elif icon_type == "bags_cat":
        # Multiple bags
        draw.rounded_rectangle([cx - s * 0.9, cy - s * 0.3, cx + s * 0.4, cy + s * 0.8], radius=s // 6, outline=color, width=2)
        draw.arc([cx - s * 0.6, cy - s * 0.9, cx + s * 0.1, cy - s * 0.1], 180, 0, fill=color, width=2)
        # Second bag behind
        draw.rounded_rectangle([cx - s * 0.2, cy - s * 0.5, cx + s * 0.9, cy + s * 0.6], radius=s // 6, outline=color + (80,), width=1)


def generate_image(filename, width, height, palette_name, title, subtitle, icon_type, style="product"):
    """Generate a single premium placeholder image."""
    palette = PALETTES[palette_name]

    # Create base image with gradient
    img = Image.new("RGB", (width, height))
    create_gradient_fast(img, palette["bg_start"], palette["bg_end"], angle=135)

    # Add noise texture
    add_noise_texture(img, intensity=8)

    # Draw decorative elements on RGBA overlay
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    draw_geometric_elements(overlay_draw, width, height, palette["accent"], style=style)

    # Draw product icon
    icon_size = min(width, height) // 5
    icon_cx = width // 2
    icon_cy = height // 2 - height // 16
    draw_product_icon(overlay_draw, icon_cx, icon_cy, icon_size, icon_type, palette["accent"] + (160,))

    # Composite overlay
    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, overlay)
    img = img_rgba.convert("RGB")

    # Add vignette
    img = add_vignette(img, strength=0.35)

    # Add text
    draw = ImageDraw.Draw(img)

    # Title
    title_size = min(width, height) // 10
    title_font = get_font_bold(title_size)
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    tx = (width - tw) // 2
    ty = height - height // 4

    # Text shadow
    draw.text((tx + 2, ty + 2), title, font=title_font, fill=(0, 0, 0, 80))
    draw.text((tx, ty), title, font=title_font, fill=palette["text"])

    # Subtitle
    if subtitle:
        sub_size = min(width, height) // 18
        sub_font = get_font_light(sub_size)
        bbox_s = draw.textbbox((0, 0), subtitle, font=sub_font)
        sw = bbox_s[2] - bbox_s[0]
        sx = (width - sw) // 2
        sy = ty + title_size + 8
        sub_color = tuple(int(c * 0.7) for c in palette["text"][:3])
        draw.text((sx, sy), subtitle, font=sub_font, fill=sub_color)

    # Decorative line under title
    line_y = ty - 12
    line_w = min(width // 4, 120)
    draw.line(
        [(width // 2 - line_w, line_y), (width // 2 + line_w, line_y)],
        fill=palette["accent"], width=1,
    )

    # Save
    filepath = os.path.join(OUTPUT_DIR, filename)
    img.save(filepath, "JPEG", quality=92)
    print(f"  ✓ Generated: {filename} ({width}x{height})")
    return filepath


# ── Generate All Images ──────────────────────────────────────────────────────

print("\n🎨 Premium E-Commerce Image Generator")
print("=" * 50)

# Hero Background
print("\n📸 Generating hero image...")
generate_image(
    "hero-bg.jpg", 1920, 900, "hero",
    "CURATED COLLECTION", "Premium Lifestyle Essentials",
    "collection", style="hero"
)

# Category Images
print("\n📸 Generating category images...")
generate_image("cat-clothes.jpg", 600, 600, "clothes", "CLOTHING", "Premium Apparel", "clothing", style="category")
generate_image("cat-wallets.jpg", 600, 600, "wallets", "WALLETS", "Leather Goods", "wallet", style="category")
generate_image("cat-bags.jpg", 600, 600, "bags", "BAGS", "Luxury Carry", "bags_cat", style="category")
generate_image("cat-others.jpg", 600, 600, "others", "ACCESSORIES", "Curated Extras", "sunglasses", style="category")

# Product Images
print("\n📸 Generating product images...")
products = [
    ("product-1.jpg", "NAVY BLAZER", "Classic Tailoring", "blazer", "product_dark"),
    ("product-2.jpg", "LEATHER WALLET", "Brown Bifold", "wallet", "product_warm"),
    ("product-3.jpg", "CANVAS TOTE", "Beige / Tan", "tote", "product_warm"),
    ("product-4.jpg", "COTTON T-SHIRT", "White Essential", "tshirt", "product_cool"),
    ("product-5.jpg", "CROSSBODY BAG", "Black Leather", "crossbody", "product_dark"),
    ("product-6.jpg", "CARD HOLDER", "Dark Brown", "cardholder", "product_warm"),
    ("product-7.jpg", "DENIM JACKET", "Vintage Wash", "denim", "product_cool"),
    ("product-8.jpg", "LEATHER BELT", "Cognac", "belt", "product_warm"),
    ("product-9.jpg", "SILK SCARF", "Patterned", "scarf", "product_cool"),
    ("product-10.jpg", "SUNGLASSES", "Premium Shades", "sunglasses", "product_dark"),
]

for fname, title, subtitle, icon, palette in products:
    generate_image(fname, 600, 600, palette, title, subtitle, icon, style="product")

print("\n" + "=" * 50)
print(f"✅ All 15 images generated in: {OUTPUT_DIR}")
print("=" * 50 + "\n")

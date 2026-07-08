import { writeFileSync } from 'fs';

const items = [
  { name: 'product-8.jpg', title: 'Cognac Leather Belt', g: ['#8B4513', '#D2691E', '#CD853F'], emoji: '🏷️' },
  { name: 'product-9.jpg', title: 'Silk Pattern Scarf', g: ['#191970', '#B8860B', '#4169E1'], emoji: '🧣' },
  { name: 'product-10.jpg', title: 'Premium Sunglasses', g: ['#1a1a2e', '#16213e', '#0f3460'], emoji: '🕶️' },
];

for (const s of items) {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">`,
    `<defs>`,
    `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `<stop offset="0%" style="stop-color:${s.g[0]}"/>`,
    `<stop offset="50%" style="stop-color:${s.g[1]}"/>`,
    `<stop offset="100%" style="stop-color:${s.g[2]}"/>`,
    `</linearGradient>`,
    `<radialGradient id="glow" cx="50%" cy="40%" r="60%">`,
    `<stop offset="0%" style="stop-color:rgba(255,255,255,0.15)"/>`,
    `<stop offset="100%" style="stop-color:rgba(0,0,0,0)"/>`,
    `</radialGradient>`,
    `</defs>`,
    `<rect width="800" height="800" fill="url(#bg)"/>`,
    `<rect width="800" height="800" fill="url(#glow)"/>`,
    `<text x="400" y="350" text-anchor="middle" font-size="120">${s.emoji}</text>`,
    `<text x="400" y="460" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="32" fill="rgba(255,255,255,0.9)">${s.title}</text>`,
    `<text x="400" y="500" text-anchor="middle" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.5)">LUXE Collection</text>`,
    `</svg>`,
  ].join('\n');

  writeFileSync(`public/images/${s.name}`, svg);
  console.log(`Created ${s.name}`);
}

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const W = 1200;
const H = 630;

// Logo PNG como buffer
const logoBuf = readFileSync(resolve(root, 'public/images/logo.png'));

// Redimensionar logo a 180px de alto manteniendo ratio
const logoResized = await sharp(logoBuf)
  .resize({ height: 180, fit: 'inside' })
  .png()
  .toBuffer();

const logoMeta = await sharp(logoResized).metadata();
const logoW = logoMeta.width;
const logoH = logoMeta.height;

// SVG con texto y overlay
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- Overlay oscuro degradado -->
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0d1b2a" stop-opacity="0.97"/>
      <stop offset="60%"  stop-color="#0d1b2a" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#003F87" stop-opacity="0.70"/>
    </linearGradient>
    <!-- Acento azul vertical izquierdo -->
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Barra lateral izquierda azul -->
  <rect x="0" y="0" width="8" height="${H}" fill="#003F87"/>

  <!-- Etiqueta superior -->
  <rect x="60" y="60" width="220" height="28" fill="#003F87"/>
  <text x="72" y="79" font-family="Arial, sans-serif" font-size="11" font-weight="700"
        fill="white" letter-spacing="3" text-anchor="start">CONTINUIDAD OPERACIONAL</text>

  <!-- Nombre empresa -->
  <text x="60" y="185" font-family="Arial Black, Arial, sans-serif" font-size="72" font-weight="900"
        fill="white" letter-spacing="-2">VITAL AIR</text>
  <text x="60" y="260" font-family="Arial Black, Arial, sans-serif" font-size="72" font-weight="900"
        fill="#4A9EFF" letter-spacing="-2">POWER</text>

  <!-- Línea divisoria -->
  <rect x="60" y="290" width="80" height="4" fill="#003F87"/>

  <!-- Subtítulo -->
  <text x="60" y="340" font-family="Arial, sans-serif" font-size="22" font-weight="400"
        fill="#CBD5E0">Mantenimiento · Reparación · Contingencia 24/7</text>

  <!-- Descripción -->
  <text x="60" y="385" font-family="Arial, sans-serif" font-size="17" fill="#94A3B8">
    Compresores industriales — Atlas Copco · Ingersoll Rand · Kaeser
  </text>

  <!-- Ubicación -->
  <text x="60" y="440" font-family="Arial, sans-serif" font-size="15" fill="#64748B"
        letter-spacing="1">La Serena · Coquimbo · Región de Coquimbo, Chile</text>

  <!-- Línea inferior y URL -->
  <rect x="0" y="${H - 56}" width="${W}" height="56" fill="#003F87" opacity="0.6"/>
  <text x="60" y="${H - 22}" font-family="Arial, sans-serif" font-size="16" font-weight="700"
        fill="white" letter-spacing="1">vitalairpower.cl</text>
  <text x="${W - 60}" y="${H - 22}" font-family="Arial, sans-serif" font-size="13"
        fill="white" opacity="0.6" text-anchor="end">+56 51 224 4588</text>

  <!-- Patrón grid decorativo derecho -->
  ${Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) =>
      `<rect x="${W - 260 + col * 48}" y="${80 + row * 56}" width="2" height="2" fill="white" opacity="0.08"/>`
    ).join('')
  ).join('')}
</svg>`;

// Fondo: foto industrial con blur + oscuridad
const bg = await sharp(resolve(root, 'public/images/planta-de-aire.jpeg'))
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .blur(3)
  .modulate({ brightness: 0.4 })
  .toBuffer();

// Logo position: esquina derecha, centrado verticalmente
const logoX = W - logoW - 80;
const logoY = Math.round((H - logoH) / 2);

await sharp(bg)
  .composite([
    { input: Buffer.from(svg), blend: 'over' },
    { input: logoResized, left: logoX, top: logoY, blend: 'over' },
  ])
  .jpeg({ quality: 92 })
  .toFile(resolve(root, 'public/images/og-image.jpg'));

console.log('✓ og-image.jpg generada (1200×630)');

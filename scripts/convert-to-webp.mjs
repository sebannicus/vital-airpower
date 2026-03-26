import sharp from 'sharp';
import { readdirSync, unlinkSync } from 'fs';
import { resolve, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = resolve(__dirname, '../public/images');

const files = readdirSync(imagesDir).filter(f => /\.(jpe?g|png)$/i.test(f));

console.log(`Convirtiendo ${files.length} imágenes a WebP (calidad 80)...\n`);

let converted = 0;
for (const file of files) {
  const input  = resolve(imagesDir, file);
  const output = resolve(imagesDir, basename(file, extname(file)) + '.webp');

  const before = (await sharp(input).metadata()).size ?? 0;
  await sharp(input).webp({ quality: 80 }).toFile(output);
  const after = (await sharp(output).metadata()).size ?? 0;

  const savings = before ? Math.round((1 - after / before) * 100) : 0;
  console.log(`✓ ${file.padEnd(38)} → .webp  (ahorro ~${savings}%)`);

  // Eliminar original si no es el mismo archivo
  if (output !== input) unlinkSync(input);
  converted++;
}

console.log(`\n✅ ${converted} imágenes convertidas y originales eliminados.`);

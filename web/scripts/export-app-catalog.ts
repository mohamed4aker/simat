/**
 * بيصدّر كتالوج الموقع لملف جوه الأبلكيشن (app/assets/data/catalog.json)
 * عشان الأبلكيشن يفتح بالمنتجات حتى من غير نت أول مرة. بعد كده بيتحدّث
 * لوحده من GET /api/products.
 *
 *   npm run export:app
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { categories, products } from '../src/lib/seed.ts';

const out = new URL('../../app/assets/data/catalog.json', import.meta.url);
mkdirSync(new URL('.', out), { recursive: true });
writeFileSync(
  out,
  JSON.stringify({ products, categories, updatedAt: new Date().toISOString() }),
);
console.log(`✓ ${products.length} products → app/assets/data/catalog.json`);

/**
 * بيجهّز صور العطور للموقع والأبلكيشن من فولدر صور العميل:
 *   <src>/<رقم العطر في الشيت>/  فيه صورتين:
 *     - الزجاجة على خلفية بيضا (طولية)        → public/products/<slug>.webp
 *     - الزجاجة وسط المكونات (مربعة، للهوفر)  → public/products/<slug>-notes.webp
 *
 * الفرز بالمقاس مش باسم الملف (فيه ملفات اسمها غلط زي DUALITY في فولدر LIBERA).
 *
 *   node scripts/import-images.mjs "<فولدر الصور>"
 *   python3 scripts/import-catalog.py   # بيربط الصور بالعطور
 */
import { readdirSync, mkdirSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const src = process.argv[2];
if (!src) throw new Error('حدد فولدر الصور');
const out = new URL('../public/products/', import.meta.url);
mkdirSync(out, { recursive: true });

const catalog = readFileSync(new URL('../src/lib/catalog.data.ts', import.meta.url), 'utf8');
const rows = JSON.parse(catalog.slice(catalog.indexOf('['), catalog.lastIndexOf(']') + 1));
const slugById = new Map(rows.map((r) => [String(r.sheetId), r.slug]));

let done = 0;
for (const dir of readdirSync(src)) {
  const slug = slugById.get(dir);
  if (!slug) {
    console.warn(`⚠ فولدر «${dir}» مش مربوط بعطر في الكتالوج — اتساب`);
    continue;
  }
  const files = readdirSync(`${src}/${dir}`).filter((f) => /\.(png|jpe?g)$/i.test(f));
  const meta = await Promise.all(
    files.map(async (f) => ({ f, ...(await sharp(`${src}/${dir}/${f}`).metadata()) })),
  );
  const bottle = meta.find((m) => m.height > m.width);
  const scene = meta.find((m) => m.height === m.width);
  if (bottle) {
    await sharp(`${src}/${dir}/${bottle.f}`).resize({ width: 900 }).webp({ quality: 80 }).toFile(new URL(`${slug}.webp`, out).pathname);
  }
  if (scene) {
    await sharp(`${src}/${dir}/${scene.f}`).resize({ width: 900 }).webp({ quality: 78 }).toFile(new URL(`${slug}-notes.webp`, out).pathname);
  }
  if (!bottle || !scene) console.warn(`⚠ ${slug}: ناقص ${!bottle ? 'صورة الزجاجة' : 'صورة المكونات'}`);
  done++;
}
console.log(`✓ صور ${done} عطر → public/products`);

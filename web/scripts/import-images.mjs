/**
 * بيجهّز صور العطور للموقع والأبلكيشن من فولدر صور العميل:
 *   كل عطر ليه صورتين:
 *     - الزجاجة على خلفية بيضا (طولية)        → public/products/<slug>.webp
 *     - الزجاجة وسط المكونات (مربعة، للهوفر)  → public/products/<slug>-notes.webp
 *
 * العطر بيتعرف من اسم ملف صورة الزجاجة («LIBERA 09 copy.png» → libera)،
 * مش من رقم الفولدر (الترقيم اتغير في الشيت النهائي) ولا من اسم صورة المكونات
 * (فيه صور مكونات اسمها غلط، زي DUALITY جوه فولدر LIBERA).
 * فولدر من غير رقم (زي «Untitled folder») فيه كذا عطر، فبيتجمّع بالاسم.
 * الفولدرات المتداخلة بتتقري كلها.
 *
 *   node scripts/import-images.mjs "<فولدر الصور>" [--by-id] [--skip=39,40]
 *   python3 scripts/import-catalog.py   # بيربط الصور بالعطور
 *
 * --by-id: الفولدرات المترقمة بنفس أرقام الشيت النهائي (Product ID)، فالعطر
 *          بيتعرف من رقم الفولدر بدل اسم الملف.
 * --skip:  فولدرات تتساب (مثلاً فولدر فيه صور عطر تاني بالغلط).
 */
import { readdirSync, mkdirSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const src = process.argv[2];
if (!src) throw new Error('حدد فولدر الصور');
const byId = process.argv.includes('--by-id');
const skip = new Set(
  (process.argv.find((a) => a.startsWith('--skip=')) ?? '--skip=').slice(7).split(',').filter(Boolean),
);
const out = new URL('../public/products/', import.meta.url);
mkdirSync(out, { recursive: true });

const catalog = readFileSync(new URL('../src/lib/catalog.data.ts', import.meta.url), 'utf8');
const rows = JSON.parse(catalog.slice(catalog.indexOf('['), catalog.lastIndexOf(']') + 1));
const slugs = new Set(rows.map((r) => r.slug));
const slugById = new Map(rows.map((r) => [String(r.sheetId), r.slug]));
const slugOf = (file) =>
  file.replace(/\.[^.]+$/, '').replace(/\s*\d+\s*copy$/i, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** كل الفولدرات اللي جواها صور (حتى المتداخلة). */
function folders(path) {
  const entries = readdirSync(path, { withFileTypes: true });
  return [path, ...entries.filter((e) => e.isDirectory()).flatMap((e) => folders(`${path}/${e.name}`))];
}

/** { slug: { bottle, scene } } */
const found = {};
for (const path of folders(src)) {
  const dir = path.split('/').pop();
  if (skip.has(dir)) {
    console.warn(`⚠ فولدر «${dir}» اتساب (--skip)`);
    continue;
  }
  const files = readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(png|jpe?g)$/i.test(e.name))
    .map((e) => e.name);
  if (!files.length) continue;
  const meta = await Promise.all(
    files.map(async (f) => ({ f, path: `${path}/${f}`, ...(await sharp(`${path}/${f}`).metadata()) })),
  );
  const isBottle = (m) => m.height > m.width;
  const isScene = (m) => m.height === m.width;
  if (/^\d+$/.test(dir)) {
    const bottle = meta.find(isBottle);
    if (!bottle) continue;
    const slug = byId ? slugById.get(dir) ?? slugOf(bottle.f) : slugOf(bottle.f);
    found[slug] = { bottle, scene: meta.find(isScene) };
  } else {
    for (const m of meta) {
      const entry = (found[slugOf(m.f)] ??= {});
      if (isBottle(m)) entry.bottle ??= m;
      else if (isScene(m)) entry.scene ??= m;
    }
  }
}

let done = 0;
for (const [slug, { bottle, scene }] of Object.entries(found)) {
  if (!slugs.has(slug)) {
    console.warn(`⚠ «${slug}» مش في الكتالوج — صوره اتسابت`);
    continue;
  }
  if (bottle) {
    await sharp(bottle.path).resize({ width: 900 }).webp({ quality: 80 }).toFile(new URL(`${slug}.webp`, out).pathname);
  }
  if (scene) {
    await sharp(scene.path).resize({ width: 900 }).webp({ quality: 78 }).toFile(new URL(`${slug}-notes.webp`, out).pathname);
  }
  if (!bottle || !scene) console.warn(`⚠ ${slug}: ناقص ${!bottle ? 'صورة الزجاجة' : 'صورة المكونات'}`);
  done++;
}
const missing = [...slugs].filter((s) => !found[s]);
console.log(`✓ صور ${done} عطر → public/products`);
if (missing.length) console.log(`  من غير صور: ${missing.join(', ')}`);

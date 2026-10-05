#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  بيجهّز نسخة من الموقع جاهزة ترتفع على استضافة cPanel
#  (Setup Node.js App). الناتج: dist/simat-cpanel.zip
#
#    npm run package:cpanel
#
#  متغيرات Supabase ورابط الموقع بتتحط وقت البناء، فلو اتغيرت
#  لازم تبني النسخة تاني:
#    NEXT_PUBLIC_SITE_URL=https://example.com \
#    NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
#    npm run package:cpanel
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."

BUILD_STANDALONE=1 npx next build

OUT=dist/cpanel
rm -rf dist
mkdir -p "$OUT/app/.next"

# الموقع نفسه في فولدر app/ — CloudLinux مش بيسمح بفولدر
# node_modules حقيقي في جذر التطبيق، فبنحطه جوه app/.
cp -r .next/standalone/. "$OUT/app/"
cp -r .next/static "$OUT/app/.next/static"
[ -d public ] && cp -r public "$OUT/app/public"

# سيرفرات cPanel (CloudLinux) لينكس عادي (glibc) — نسخ sharp التانية
# (musl / wasm) ملهاش لازمة وبتكبّر الملف.
rm -rf "$OUT/app/node_modules/@img/"*linuxmusl* "$OUT/app/node_modules/@img/sharp-wasm32"

# ملف التشغيل اللي بنحطه في «Application startup file»
cat > "$OUT/server.js" <<'JS'
// نقطة تشغيل الموقع على cPanel — بتشغّل نسخة Next.js الجاهزة.
process.env.NODE_ENV = 'production';
require('./app/server.js');
JS

cat > "$OUT/package.json" <<'JSON'
{
  "name": "simat-store",
  "private": true,
  "main": "server.js"
}
JSON

(cd "$OUT" && zip -qr -9 ../simat-cpanel.zip .)
echo "✓ dist/simat-cpanel.zip ($(du -h dist/simat-cpanel.zip | cut -f1))"

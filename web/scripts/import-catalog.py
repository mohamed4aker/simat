#!/usr/bin/env python3
"""
بيحوّل شيت المنتجات النهائي (SIMAT_PDP_Content_System_Final.xlsx — فيه الإنجليزي
والعربي) لكتالوج الموقع: src/lib/catalog.data.ts — ومنه بيتولّد
supabase/seed.sql (npm run gen:seed) وكتالوج الأبلكيشن (npm run export:app).

    pip install openpyxl
    python3 scripts/import-catalog.py ../docs/data/SIMAT_PDP_Content_System_Final.xlsx
    npm run gen:seed && npm run export:app
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else '../docs/data/SIMAT_PDP_Content_System_Final.xlsx')
OUT = Path(__file__).resolve().parent.parent / 'src' / 'lib' / 'catalog.data.ts'
# صور العطور (scripts/import-images.mjs).
IMAGES = Path(__file__).resolve().parent.parent / 'public' / 'products'

# الشيت مفيهوش عمود Category. ترتيب الشيت النهائي (من العميل):
#   1–17 حريمي · 18–21 للجنسين · 22–46 رجالي
# ومن 47 لـ 58: رجالي ما عدا CLOUD و SPARK (نسائي) — حسب العميلة.
GENDER_BY_NAME = {
    'DESIRE': 'men', 'TOBACCO': 'men', 'UMBRA': 'men', 'IMPERIUM': 'men',
    'MOOD': 'men', 'RESONANCE': 'men', 'FERAL': 'men', 'NOESIS': 'men',
    'CLOUD': 'women', 'SPARK': 'women', 'PARADOX': 'men', 'AUREATE': 'men',
}


def gender_of(pid: int, short: str) -> str:
    if short in GENDER_BY_NAME:
        return GENDER_BY_NAME[short]
    if pid <= 17:
        return 'women'
    if pid <= 21:
        return 'unisex'
    if pid <= 46:
        return 'men'
    return 'unisex'


# عطور اتلغت (لو رجعت في شيت قديم مش هتنزل).
EXCLUDE = {'REGAL', 'SANCTUM', 'PEARL'}

# الأسعار من العميل: 450 / 700 / 900 لكل العطور (40 / 60 / 100 مل)،
# ما عدا العشرة دول 499 / 749 / 999. (بالاسم عشان الأرقام بتتغير.)
PRICES = {40: 450, 60: 700, 100: 900}
PREMIUM_PRICES = {40: 499, 60: 749, 100: 999}
PREMIUM = {'LEGACY', 'ROOT', 'FLOW', 'POISE', 'MAGNET', 'ASCEND', 'VECTOR',
           'NEXUS', 'REBEL', 'IGNITE',
           # SHADOW و DARK MATTER نفس العطر (Black Afgano) — سعره 499 / 749 / 999
           'SHADOW', 'DARK MATTER'}

# العطور اللي بتظهر في «الأكثر طلباً» والـ Mega Menu (بالترتيب).
FEATURED = ['NOCTURNE', 'IMPRINT', 'CLARITY', 'INSTINCT', 'SOMA', 'CLOUD',
            'LEGACY', 'DUALITY']


def slugify(name: str) -> str:
    name = re.sub(r'^SIMAT\s+', '', name.strip(), flags=re.I)
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def split_list(value) -> list[str]:
    return [p.strip() for p in str(value or '').split(',') if p.strip()]


def label_style(gender: str, family: str) -> str:
    if gender == 'men':
        return 'noir'
    if gender == 'unisex':
        return 'velvet'
    return 'bordeaux' if 'Amber' in family else 'linen'


wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb.worksheets[0]
header = [str(c.value).strip() if c.value else '' for c in ws[1]]
col = {name: i for i, name in enumerate(header) if name}

products = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not row[col['Product ID']]:
        continue
    pid = int(row[col['Product ID']])
    get = lambda key: str(row[col[key]] or '').strip() if key in col else ''

    def get_ar(key: str) -> str:
        # خلية عربي ناقصة (مقطوعة بـ «...») → فاضية، فالموقع يعرض الإنجليزي.
        value = get(f'{key} (AR)')
        if value.endswith(('...', '…')):
            print(f"⚠ {get('SIMAT Name')}: «{key} (AR)» ناقصة — هيظهر الإنجليزي", file=sys.stderr)
            return ''
        return value

    def split_ar(key: str) -> list[str]:
        return [p.strip() for p in re.split(r'[،,]', get_ar(key)) if p.strip()]
    name = get('SIMAT Name')
    short = re.sub(r'^SIMAT\s+', '', name, flags=re.I).upper()
    if short in EXCLUDE:
        continue
    family = get('Fragrance Family')
    gender = gender_of(pid, short)
    featured_rank = FEATURED.index(short) if short in FEATURED else None
    products.append({
        'id': slugify(name),
        'slug': slugify(name),
        'sheetId': pid,
        'nameEn': name,
        'secondaryLine': get('Secondary Line'),
        'tagline': get('Tagline'),
        'taglineAr': get_ar('Tagline'),
        'shortDescription': get('Short Description'),
        'shortDescriptionAr': get_ar('Short Description'),
        'descriptionEn': get('Full Description'),
        'description': get_ar('Full Description'),
        'scentCharacter': get('Scent Character'),
        'scentCharacterAr': get_ar('Scent Character').rstrip('.'),
        'familyEn': family,
        'family': get_ar('Fragrance Family'),
        'accords': split_list(get('Main Accords')),
        'accordsAr': split_ar('Main Accords'),
        'topNotesEn': split_list(get('Top Notes')),
        'heartNotesEn': split_list(get('Heart Notes')),
        'baseNotesEn': split_list(get('Base Notes')),
        'topNotes': split_ar('Top Notes'),
        'heartNotes': split_ar('Heart Notes'),
        'baseNotes': split_ar('Base Notes'),
        'wearProfile': get('The Scent'),
        'wearProfileAr': get_ar('The Scent'),
        'occasion': get('Occasion / Character'),
        'occasionAr': get_ar('Occasion / Character').rstrip('.'),
        'related': [slugify(get(f'Related Product {n}')) for n in (1, 2, 3) if get(f'Related Product {n}')],
        'variants': [{'sizeMl': ml, 'price': price}
                     for ml, price in (PREMIUM_PRICES if short in PREMIUM else PRICES).items()],
        'imageUrl': f'/products/{slugify(name)}.webp'
                    if (IMAGES / f'{slugify(name)}.webp').exists() else None,
        'hoverImageUrl': f'/products/{slugify(name)}-notes.webp'
                         if (IMAGES / f'{slugify(name)}-notes.webp').exists() else None,
        'gender': gender,
        'labelStyle': label_style(gender, family),
        'isFeatured': featured_rank is not None,
        'soldCount': (100 - featured_rank * 5) if featured_rank is not None else max(1, 60 - pid),
    })

slugs = {p['slug'] for p in products}
for p in products:
    missing = [r for r in p['related'] if r not in slugs]
    if missing:
        # غالباً عطر من اللي اتشالوا — بيتشال من «Layer It With».
        print(f"⚠ {p['nameEn']}: related not found {missing} (removed)", file=sys.stderr)
        p['related'] = [r for r in p['related'] if r in slugs]

OUT.write_text(
    '// مولّد تلقائياً من شيت المنتجات بـ scripts/import-catalog.py — متعدّلش بإيدك.\n'
    'export const catalogRows = '
    + json.dumps(products, ensure_ascii=False, indent=2)
    + ' as const;\n',
    encoding='utf-8',
)
print(f'✓ {len(products)} products → {OUT}')

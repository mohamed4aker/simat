# موقع سِمة — SIMAT Storefront

<div dir="rtl">

متجر إلكتروني كامل بـ **Next.js 16** + **Supabase**، بلغتين (عربي RTL
وإنجليزي LTR) وبتصميم الـ Prototype، جاهز يبيع ويترفع على النت.

---

## اللي الموقع بيعمله

كل صفحة ليها رابطين: `/ar/...` و `/en/...`. أي رابط من غير لغة (زي
`/shop`) بيتحوّل تلقائياً للغة الزائر (اللي اختارها قبل كده، وإلا لغة
المتصفح، وإلا عربي). زرار **EN / AR** في الهيدر بيقلب نفس الصفحة للغة
التانية.

| الصفحة | الوصف |
|---|---|
| `/ar` `/en` | الرئيسية: Hero، الجودة، الأكثر طلباً، التصنيفات، قصتنا، طقم العينات، اختبار اختيار العطر، ميكس العطور، المكونات، إنستجرام، **الأسئلة الشائعة**، النشرة البريدية |
| `/[lang]/shop` | كل العطور + فلترة (النوع/التركيز/العائلة/المجموعة/السعر) + ترتيب + بحث |
| `/[lang]/product/[slug]` | صفحة المنتج: النوتات، اختيار الحجم، الكمية، أضف للسلة، اطلب دلوقتي، الأسئلة الشائعة |
| `/[lang]/checkout` | إتمام الطلب — **من غير تسجيل حساب** (رقم بديل/واتساب، هدية بأسعار مخفية) |
| `/[lang]/order-received` | صفحة الشكر برقم الطلب |
| `/[lang]/track` | تتبّع الطلب برقم الطلب + الموبايل |
| `/[lang]/faq` `/about` `/shipping` `/privacy` `/contact` | صفحات المحتوى |
| `/admin` | لوحة تحكم المتجر (عربي، للمسؤولين بس) |

**القوائم الرئيسية** (Shop · Discover · Collections · About) بتفتح Mega Menu
بمجرد مرور الماوس عليها (`src/components/layout/MegaNav.tsx`)، وبالكيبورد
كمان (Tab يفتح و Esc يقفل). في الموبايل بتبقى قائمة جانبية.

**السلة** جانبية: كود خصم، عدّاد الشحن المجاني (١٥٠٠ ج.م)، خيار هدية
برسالة، وضمان عينة الـ ٢ مل.

---

## تعديل كلام الموقع (المحتوى)

كل نصوص الموقع في ملفين بس، مترتبين بنفس ترتيب الأقسام في الصفحة:

- `src/i18n/dictionaries/ar.ts` — العربي
- `src/i18n/dictionaries/en.ts` — الإنجليزي

عدّل الكلام جوّه علامات التنصيص وسيب اللي بين `{أقواس}` زي ما هو (ده
بيتملى تلقائياً بالمبلغ أو العدد). أسماء العطور ووصفها ونوتاتها
بالعربي والإنجليزي بتتعدّل من لوحة التحكم (أو من `src/lib/seed.ts` في
وضع العرض). أرقام التواصل في `src/lib/constants.ts` (`STORE`).

### تحديث قاعدة بيانات موجودة

لو قاعدة البيانات كانت متظبّطة قبل النسخة ثنائية اللغة: شغّل
`supabase/schema.sql` تاني ثم `supabase/seed.sql` في SQL Editor. الملفين
آمنين يتشغلوا أكتر من مرة — بيضيفوا الأعمدة الجديدة (الإنجليزي، الهدية،
الرقم البديل، النشرة البريدية) والكتالوج الجديد من غير ما يمسحوا أي طلبات.

**لجوجل:** كل صفحة بتتولّد HTML كامل على السيرفر باللغتين ومربوطين ببعض
(`hreflang`)، وصفحة المنتج معاها بيانات منظّمة (`Product` + `Offer`) وقسم
الأسئلة الشائعة معاه `FAQPage` — يعني السعر والأسئلة ممكن يظهروا في نتائج البحث.

---

## فين قاعدة البيانات؟

قاعدة البيانات في **Supabase** — خدمة بتديك قاعدة **PostgreSQL** حقيقية
على سيرفر مُدار، مع لوحة تحكم بتشوف منها الجداول والطلبات.

- **الباقة المجانية** كفاية للبداية (٥٠٠ ميجا + ٥ جيجا نقل شهرياً).
- بتختار المنطقة وقت إنشاء المشروع — اختار **Frankfurt (eu-central-1)**
  لأنها الأقرب لمصر.
- الجداول: `products` · `categories` · `orders` · `order_items` ·
  `order_events` · `reviews` · `coupons` · `shipping_rates` · `settings`

### مهم: الأمان

- الزائر **مش بيقدر** يقرا الطلبات أو يعدّل الأسعار — كل الجداول
  الحسّاسة عليها **Row Level Security** ومفيش صلاحية قراءة للزوار.
- الطلب بيتسجّل من خلال دالة محميّة في قاعدة البيانات
  (`create_order`) هي اللي **بتحسب السعر والشحن والخصم من الجداول**،
  فحتى لو حد عدّل الطلب من المتصفح مش هيأثر على الحساب.
- تتبّع الطلب بيحتاج **رقم الطلب + رقم الموبايل** مع بعض.

### وضع العرض (من غير قاعدة بيانات)

من غير مفاتيح Supabase، الموقع بيشتغل عادي بمنتجات تجريبية عشان تقدر
تشوفه وترفعه فوراً — بس الطلبات **مش بتتسجّل**. أول ما تحط المفاتيح
بيتحوّل للوضع الحقيقي لوحده.

---

## الإعداد — ٥ خطوات

### ١. اعمل مشروع Supabase
[supabase.com](https://supabase.com) → New project → اختار
**Frankfurt** → احفظ كلمة سر قاعدة البيانات.

### ٢. شغّل ملفات SQL
من **SQL Editor** في Supabase، شغّل بالترتيب:

1. `supabase/schema.sql` — بينشئ الجداول والحماية والدوال.
2. `supabase/seed.sql` — بيزرع الـ ٢٠ منتج والتصنيفات وأسعار الشحن.

### ٣. هات المفاتيح
**Project Settings → API**، انسخ:
- `Project URL`
- `anon public` key

### ٤. حطهم في ملف البيئة
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://simat.store
```

> مفتاح `anon` ده **آمن** إنه يبقى في المتصفح — الحماية الحقيقية في
> سياسات RLS. متحطّش مفتاح `service_role` هنا خالص.

### ٥. شغّل
```bash
npm install
npm run dev      # http://localhost:3000
```

---

## الرفع على النت

> **الموقع لسه مترفعش على النت.** لازم يترفع من حسابك إنت (Vercel أو
> سيرفرك)، والخطوات تحت. في `‎.github/workflows/deploy-web.yml` كمان
> workflow بيرفع الموقع تلقائياً مع كل تحديث أول ما تحط توكن Vercel
> في أسرار الريبو.

### الطريقة الأسهل — Vercel (مجاني، دقيقتين)

1. ارفع الريبو على GitHub (معمول بالفعل).
2. [vercel.com](https://vercel.com) → **Add New → Project** → اختار
   الريبو.
3. **Root Directory** = `web`
4. زوّد نفس متغيّرات `.env.local` في **Environment Variables**.
5. Deploy. هتاخد لينك شغّال على طول.

**الدومين:** Vercel → Settings → Domains → اكتب `simat.store` →
هيديك سجلات DNS تحطها عند مسجّل الدومين:

| النوع | الاسم | القيمة |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

شهادة SSL بتتظبط تلقائي.

#### نشر تلقائي مع كل تحديث (اختياري)

بعد ما تربط المشروع بـ Vercel مرة واحدة:

```bash
cd web && npx vercel link       # بيولّد web/.vercel/project.json
```

خُد `orgId` و `projectId` من الملف ده، وخُد توكن من
[vercel.com/account/tokens](https://vercel.com/account/tokens)، وحطهم في
**GitHub → Settings → Secrets and variables → Actions**:

| السر | القيمة |
|---|---|
| `VERCEL_TOKEN` | التوكن |
| `VERCEL_ORG_ID` | `orgId` |
| `VERCEL_PROJECT_ID` | `projectId` |

من ساعتها أي تعديل على الموقع بيترفع لوحده.

### على سيرفرك الخاص (VPS)

الموقع بيتبني كـ **standalone**، يعني مجلد واحد فيه كل حاجة.

**بـ Docker (الأسهل):**
```bash
cd web
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  --build-arg NEXT_PUBLIC_SITE_URL=https://simat.store \
  -t simat-web .

docker run -d --name simat-web --restart always -p 3000:3000 simat-web
```

**من غير Docker:**
```bash
npm ci && npm run build:standalone
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
node .next/standalone/server.js     # على المنفذ 3000
```
(استخدم `pm2` أو `systemd` عشان يفضل شغّال بعد الريستارت.)

**Nginx كـ reverse proxy:**
```nginx
server {
    listen 80;
    server_name simat.store www.simat.store;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
بعدها SSL مجاني:
```bash
sudo certbot --nginx -d simat.store -d www.simat.store
```

---

## لو الرفع على Vercel وقع

أشهر ٣ أسباب وحلّها:

| رسالة الخطأ | السبب | الحل |
|---|---|---|
| `No Next.js version detected` أو `package.json not found` | Vercel بيدوّر على المشروع في جذر الريبو، والموقع جوّه `web/` | **Settings → General → Root Directory** → اكتب `web` → Save → Redeploy |
| `Error: Cannot find module ...` أو البناء بيقف فجأة | نسخة Node قديمة | **Settings → General → Node.js Version** → اختار `22.x` |
| الموقع بيفتح بس المنتجات مش ظاهرة | متغيّرات البيئة ناقصة | **Settings → Environment Variables** → زوّد `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` و `NEXT_PUBLIC_SITE_URL` → Redeploy |

> الموقع بيتبني تمام على GitHub Actions في كل دفعة
> (workflow «بناء الموقع»)، فلو البناء وقع عند Vercel بس، غالباً
> إعدادات المشروع مش الكود.

---

## لوحة تحكم الأدمن — `/admin`

لوحة كاملة على الموقع نفسه، تفتحها من اللابتوب أو الموبايل:

| الصفحة | بتعمل إيه |
|---|---|
| `/admin/login` | دخول بالإيميل وكلمة السر |
| `/admin` | المبيعات، منحنى الإيراد، الأكثر مبيعاً، المخزون المنخفض، أحدث الطلبات |
| `/admin/products` | كل المنتجات: بحث، إخفاء/إظهار، حذف |
| `/admin/products/new` | إضافة منتج (سعر، مخزون، نوتات، صورة) |
| `/admin/orders` | الطلبات مع فلترة بالحالة وبحث بالموبايل |
| `/admin/orders/[id]` | تفاصيل الطلب، تغيير حالته، واتصال/واتساب للعميل |

### إزاي تعمل حساب مسؤول

بعد ما تشغّل `schema.sql`:

**١. اعمل المستخدم**
Supabase → **Authentication** → **Users** → **Add user** →
اكتب إيميلك وكلمة سر → **Auto Confirm User** مفعّلة

**٢. خليه مسؤول**
Supabase → **SQL Editor** → شغّل:

```sql
insert into public.admin_users (email, name)
values ('الإيميل-بتاعك@example.com', 'اسمك');
```

**٣. ادخل**
افتح `https://موقعك/admin/login` وسجّل دخول.

> **الحماية:** كل الصلاحيات متحققة في قاعدة البيانات نفسها (RLS +
> الدالة `is_admin`) — مش في المتصفح. أي حساب مش في جدول
> `admin_users` مش هيقدر يقرا طلب ولا يعدّل منتج حتى لو عرف الرابط.

---

## إدارة المنتجات والطلبات

من **لوحة التحكم** فوق (الأسهل)، أو من **لوحة Supabase** مباشرة:

| عايز تعمل إيه | تروح فين |
|---|---|
| تزوّد منتج | جدول `products` → Insert row |
| تعدّل سعر أو مخزون | جدول `products` → عدّل الصف |
| توقف منتج | خلي `is_active = false` |
| تشوف الطلبات | جدول `orders` (مرتّبة بالأحدث) |
| تغيّر حالة طلب | جدول `orders` → عدّل `status` |
| تعمل كوبون | جدول `coupons` → Insert row |
| تغيّر سعر شحن محافظة | جدول `shipping_rates` |
| ترفع صورة منتج | Storage → ارفع الصورة → حط اللينك في `image_url` |

> **الخطوة الجاية:** ربط **تطبيق الموبايل** بنفس قاعدة البيانات دي،
> وساعتها لوحة تحكم التطبيق (اللي فيها التقارير وإضافة المنتجات)
> هتشتغل على نفس البيانات وما تحتاجش تدخل Supabase خالص.

---

## أوامر

```bash
npm run dev        # تشغيل محلي
npm run build      # بناء للنشر
npm run start      # تشغيل النسخة المبنية
npm run typecheck  # فحص الأنواع
npm run lint       # فحص الكود
npm run gen:seed   # إعادة توليد supabase/seed.sql من src/lib/seed.ts
```

---

## بنية المشروع

```
web/
├── src/app/[lang]/     صفحات الواجهة بلغتين (App Router)
├── src/app/admin/      لوحة التحكم
├── src/proxy.ts        تحويل الروابط للغة الزائر
├── src/i18n/           اللغات وملفات النصوص (ar.ts / en.ts)
├── src/components/     الواجهات: الهوية، المنتجات، العربة، الهيدر والفوتر
├── src/lib/
│   ├── store.ts        ← طبقة البيانات الوحيدة (Supabase أو البيانات المحلية)
│   ├── supabase.ts     الاتصال بقاعدة البيانات
│   ├── seed.ts         المنتجات التجريبية
│   ├── types.ts        الأنواع المشتركة
│   └── constants.ts    الشحن والمحافظات ومعلومات المتجر
├── supabase/
│   ├── schema.sql      الجداول + الحماية + الدوال
│   └── seed.sql        البيانات الابتدائية (مولّد تلقائياً)
└── Dockerfile          للنشر على سيرفرك
```

</div>

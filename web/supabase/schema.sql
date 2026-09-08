-- ═══════════════════════════════════════════════════════════════
--  SIMAT — سِمة | مخطّط قاعدة البيانات (Supabase / PostgreSQL)
--  شغّل الملف ده مرة واحدة في:  Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ── ١. الجداول ────────────────────────────────────────────────

create table if not exists public.categories (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  name_en     text default '',
  description text default '',
  icon_key    text default 'bottle',
  sort_order  int  default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create table if not exists public.products (
  id              text primary key,
  slug            text not null unique,
  name            text not null,
  name_en         text default '',
  brand           text default 'SIMAT',
  category_id     text references public.categories(id) on delete set null,
  description     text default '',
  price           numeric(10,2) not null check (price > 0),
  old_price       numeric(10,2),
  size_ml         int default 100,
  gender          text default 'unisex'
                  check (gender in ('men','women','unisex')),
  concentration   text default 'edp'
                  check (concentration in ('parfum','edp','edt','oil','mist')),
  top_notes       text[] default '{}',
  heart_notes     text[] default '{}',
  base_notes      text[] default '{}',
  longevity_hours int default 8,
  stock           int default 0 check (stock >= 0),
  rating          numeric(2,1) default 0,
  rating_count    int default 0,
  sold_count      int default 0,
  is_featured     boolean default false,
  is_active       boolean default true,
  image_url       text,
  created_at      timestamptz default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx   on public.products(is_active);

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  user_name  text not null,
  rating     numeric(2,1) not null check (rating between 1 and 5),
  comment    text default '',
  is_visible boolean default true,
  created_at timestamptz default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);

create table if not exists public.coupons (
  code         text primary key,
  type         text not null check (type in ('percent','fixed')),
  value        numeric(10,2) not null check (value > 0),
  min_order    numeric(10,2) default 0,
  max_discount numeric(10,2),
  expires_at   timestamptz not null,
  usage_limit  int default 0,          -- ٠ = بدون حد
  used_count   int default 0,
  is_active    boolean default true
);

-- أسعار الشحن لكل محافظة (الأدمن يقدر يعدّلها من لوحة Supabase)
create table if not exists public.shipping_rates (
  governorate text primary key,
  price       numeric(10,2) not null
);

create table if not exists public.settings (
  key   text primary key,
  value text not null
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  governorate     text not null,
  city            text not null,
  street          text not null,
  building        text default '',
  address_notes   text default '',
  subtotal        numeric(10,2) not null,
  shipping        numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  total           numeric(10,2) not null,
  coupon_code     text,
  payment_method  text not null default 'cod'
                  check (payment_method in ('cod','card','wallet','instapay')),
  status          text not null default 'pending'
                  check (status in ('pending','confirmed','preparing',
                                    'shipped','delivered','cancelled','returned')),
  notes           text default '',
  source          text default 'web',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists orders_phone_idx  on public.orders(customer_phone);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name       text not null,
  unit_price numeric(10,2) not null,
  size_ml    int default 100,
  quantity   int not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- سجل تغيّر حالة الطلب
create table if not exists public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders(id) on delete cascade,
  status     text not null,
  note       text default '',
  created_at timestamptz default now()
);

-- ── ٢. الحماية (Row Level Security) ──────────────────────────
-- القاعدة: الزائر يقرا المنتجات بس. الطلبات والكوبونات بتتعامل
-- من خلال دوال محميّة عشان محدش يقدر يتلاعب بالأسعار أو يقرا
-- طلبات غيره.

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.reviews        enable row level security;
alter table public.coupons        enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.settings       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_events   enable row level security;

drop policy if exists "قراءة التصنيفات للجميع" on public.categories;
create policy "قراءة التصنيفات للجميع"
  on public.categories for select using (is_active);

drop policy if exists "قراءة المنتجات للجميع" on public.products;
create policy "قراءة المنتجات للجميع"
  on public.products for select using (is_active);

drop policy if exists "قراءة التقييمات للجميع" on public.reviews;
create policy "قراءة التقييمات للجميع"
  on public.reviews for select using (is_visible);

drop policy if exists "قراءة أسعار الشحن للجميع" on public.shipping_rates;
create policy "قراءة أسعار الشحن للجميع"
  on public.shipping_rates for select using (true);

drop policy if exists "قراءة الإعدادات للجميع" on public.settings;
create policy "قراءة الإعدادات للجميع"
  on public.settings for select using (true);

-- مفيش أي policy على orders / order_items / coupons،
-- يعني الزائر ما يقدرش يقراهم أو يكتب فيهم مباشرة إطلاقاً.

-- ── ٣. الدوال المحميّة ───────────────────────────────────────

-- توليد رقم طلب بالشكل SM-YYYYMM-XXXX
create or replace function public.next_order_number()
returns text
language plpgsql
as $$
declare
  seq int;
begin
  select count(*) + 1001 into seq from public.orders;
  return 'SM-' || to_char(now(), 'YYYYMM') || '-' || seq::text;
end;
$$;

-- التحقق من كوبون وحساب قيمة الخصم
create or replace function public.validate_coupon(
  p_code     text,
  p_subtotal numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coupons%rowtype;
  raw numeric;
  final numeric;
begin
  select * into c from public.coupons
   where upper(code) = upper(trim(p_code));

  if not found then
    return jsonb_build_object('ok', false, 'error', 'الكود ده مش موجود');
  end if;
  if not c.is_active then
    return jsonb_build_object('ok', false, 'error', 'الكود ده متوقّف حالياً');
  end if;
  if c.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'الكود ده انتهت صلاحيته');
  end if;
  if c.usage_limit > 0 and c.used_count >= c.usage_limit then
    return jsonb_build_object('ok', false,
      'error', 'الكود ده خلص عدد مرات استخدامه');
  end if;
  if p_subtotal < c.min_order then
    return jsonb_build_object('ok', false,
      'error', 'الكود ده للطلبات من ' || c.min_order::int || ' ج.م');
  end if;

  raw := case when c.type = 'percent'
              then p_subtotal * (c.value / 100.0)
              else c.value end;
  final := least(raw, coalesce(c.max_discount, raw), p_subtotal);

  return jsonb_build_object(
    'ok', true,
    'code', c.code,
    'discount', round(final, 2),
    'label', case when c.type = 'percent'
                  then 'خصم ' || c.value::int || '%'
                  else 'خصم ' || c.value::int || ' ج.م' end
  );
end;
$$;

-- إنشاء الطلب.
-- الأسعار والشحن والخصم كلهم بيتحسبوا هنا من قاعدة البيانات،
-- فمهما اتبعت من المتصفح مش هيأثر على الحساب.
create or replace function public.create_order(
  p_name        text,
  p_phone       text,
  p_email       text,
  p_governorate text,
  p_city        text,
  p_street      text,
  p_building    text,
  p_addr_notes  text,
  p_items       jsonb,          -- [{"product_id":"p_001","quantity":2}]
  p_payment     text,
  p_coupon      text,
  p_notes       text,
  p_source      text default 'web'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item          jsonb;
  prod          public.products%rowtype;
  qty           int;
  v_subtotal    numeric := 0;
  v_shipping    numeric := 0;
  v_discount    numeric := 0;
  v_free_limit  numeric := 1500;
  v_order_id    uuid;
  v_number      text;
  coupon_result jsonb;
begin
  if p_name is null or length(trim(p_name)) < 3 then
    return jsonb_build_object('ok', false, 'error', 'الاسم مطلوب');
  end if;
  if p_phone !~ '^01[0125][0-9]{8}$' then
    return jsonb_build_object('ok', false, 'error', 'رقم موبايل غير صحيح');
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', 'العربة فاضية');
  end if;

  -- التحقق من المنتجات وحساب المجموع من أسعار قاعدة البيانات
  for item in select * from jsonb_array_elements(p_items) loop
    qty := greatest(1, (item->>'quantity')::int);

    select * into prod from public.products
     where id = item->>'product_id' and is_active;

    if not found then
      return jsonb_build_object('ok', false,
        'error', 'منتج مش موجود أو موقوف');
    end if;
    if prod.stock < qty then
      return jsonb_build_object('ok', false,
        'error', 'الكمية المطلوبة من «' || prod.name || '» مش متوفرة');
    end if;

    v_subtotal := v_subtotal + (prod.price * qty);
  end loop;

  -- الشحن
  select coalesce(
           (select price from public.shipping_rates
             where governorate = p_governorate), 80)
    into v_shipping;

  select coalesce((select value::numeric from public.settings
                    where key = 'free_shipping_threshold'), 1500)
    into v_free_limit;

  if v_subtotal >= v_free_limit then
    v_shipping := 0;
  end if;

  -- الكوبون
  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    coupon_result := public.validate_coupon(p_coupon, v_subtotal);
    if (coupon_result->>'ok')::boolean then
      v_discount := (coupon_result->>'discount')::numeric;
    end if;
  end if;

  v_number := public.next_order_number();

  insert into public.orders (
    order_number, customer_name, customer_phone, customer_email,
    governorate, city, street, building, address_notes,
    subtotal, shipping, discount, total,
    coupon_code, payment_method, notes, source
  ) values (
    v_number, trim(p_name), trim(p_phone), nullif(trim(coalesce(p_email,'')), ''),
    p_governorate, p_city, p_street, coalesce(p_building,''),
    coalesce(p_addr_notes,''),
    v_subtotal, v_shipping, v_discount,
    v_subtotal + v_shipping - v_discount,
    case when v_discount > 0 then upper(trim(p_coupon)) end,
    coalesce(p_payment, 'cod'), coalesce(p_notes, ''), coalesce(p_source, 'web')
  )
  returning id into v_order_id;

  -- الأصناف + خصم المخزون
  for item in select * from jsonb_array_elements(p_items) loop
    qty := greatest(1, (item->>'quantity')::int);
    select * into prod from public.products where id = item->>'product_id';

    insert into public.order_items
      (order_id, product_id, name, unit_price, size_ml, quantity)
    values (v_order_id, prod.id, prod.name, prod.price, prod.size_ml, qty);

    update public.products
       set stock = greatest(0, stock - qty),
           sold_count = sold_count + qty
     where id = prod.id;
  end loop;

  insert into public.order_events (order_id, status, note)
  values (v_order_id, 'pending', 'تم استلام الطلب من الموقع');

  if v_discount > 0 then
    update public.coupons set used_count = used_count + 1
     where upper(code) = upper(trim(p_coupon));
  end if;

  return jsonb_build_object(
    'ok', true,
    'order_number', v_number,
    'subtotal', v_subtotal,
    'shipping', v_shipping,
    'discount', v_discount,
    'total', v_subtotal + v_shipping - v_discount
  );
end;
$$;

-- تتبّع الطلب برقم الطلب + رقم الموبايل (من غير تسجيل دخول)
create or replace function public.track_order(
  p_number text,
  p_phone  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders
   where upper(order_number) = upper(trim(p_number))
     and customer_phone = trim(p_phone);

  if not found then
    return jsonb_build_object('ok', false,
      'error', 'مفيش طلب بالبيانات دي — راجع رقم الطلب والموبايل');
  end if;

  return jsonb_build_object(
    'ok', true,
    'order', jsonb_build_object(
      'order_number', o.order_number,
      'status', o.status,
      'customer_name', o.customer_name,
      'governorate', o.governorate,
      'city', o.city,
      'street', o.street,
      'subtotal', o.subtotal,
      'shipping', o.shipping,
      'discount', o.discount,
      'total', o.total,
      'payment_method', o.payment_method,
      'created_at', o.created_at,
      'items', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'name', i.name, 'quantity', i.quantity,
                 'unit_price', i.unit_price, 'size_ml', i.size_ml)), '[]'::jsonb)
          from public.order_items i where i.order_id = o.id
      ),
      'events', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'status', e.status, 'created_at', e.created_at)
                 order by e.created_at), '[]'::jsonb)
          from public.order_events e where e.order_id = o.id
      )
    )
  );
end;
$$;

-- السماح للزائر باستدعاء الدوال دي بس
revoke all on function public.create_order    from public, anon;
revoke all on function public.validate_coupon from public, anon;
revoke all on function public.track_order     from public, anon;

grant execute on function public.create_order(
  text,text,text,text,text,text,text,text,jsonb,text,text,text,text) to anon, authenticated;
grant execute on function public.validate_coupon(text, numeric) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- تحديث updated_at تلقائياً
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

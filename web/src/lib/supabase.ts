import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * عميل Supabase.
 *
 * لو متغيّرات البيئة مش موجودة، الموقع بيشتغل بـ«وضع العرض»:
 * الكتالوج بيتقرا من البيانات المحليّة في src/lib/seed.ts والطلبات
 * ما بتتسجّلش. أول ما تحط المفتاحين في .env يتحوّل تلقائياً
 * لقاعدة البيانات الحقيقية.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isLive = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!isLive) return null;
  cached ??= createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });
  return cached;
}

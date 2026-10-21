import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseEnv } from './runtime-env';

/**
 * عميل Supabase.
 *
 * لو متغيّرات البيئة مش موجودة، الموقع بيشتغل بـ«وضع العرض»:
 * الكتالوج بيتقرا من البيانات المحليّة في src/lib/seed.ts والطلبات
 * ما بتتسجّلش. أول ما تحط SUPABASE_URL و SUPABASE_ANON_KEY يتحوّل
 * تلقائياً لقاعدة البيانات الحقيقية (من غير بناء جديد).
 */
export function isLive(): boolean {
  const { url, anonKey } = supabaseEnv();
  return Boolean(url && anonKey);
}

let cached: { key: string; client: SupabaseClient } | null = null;

export function supabase(): SupabaseClient | null {
  const { url, anonKey } = supabaseEnv();
  if (!url || !anonKey) return null;
  const key = `${url}|${anonKey}`;
  if (cached?.key !== key) {
    cached = { key, client: createClient(url, anonKey, { auth: { persistSession: false } }) };
  }
  return cached.client;
}

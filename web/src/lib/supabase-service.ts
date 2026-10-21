import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseEnv } from './runtime-env';

/**
 * عميل Supabase بصلاحيات السيرفر (service_role) — بيُستخدم في
 * webhook الواتساب بس عشان يغيّر حالة الطلب لما العميل يأكد.
 *
 * ⚠ المفتاح ده سرّي: بيتحط في متغيرات بيئة السيرفر بس
 * (SUPABASE_SERVICE_ROLE_KEY) ومن غير NEXT_PUBLIC أبداً.
 */
export function serviceSupabase(): SupabaseClient | null {
  const { url, serviceKey: key } = supabaseEnv();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

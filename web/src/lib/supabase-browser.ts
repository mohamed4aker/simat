'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * عميل Supabase للمتصفح — بيحتفظ بجلسة تسجيل الدخول.
 * لوحة الأدمن بتشتغل بيه، والصلاحيات كلها متحققة في قاعدة البيانات
 * نفسها (RLS + الدالة is_admin)، مش في المتصفح.
 *
 * الرابط والمفتاح العام بيوصلوا من السيرفر وقت التشغيل
 * (SupabaseConfig في layout الأدمن)، فبيتحطوا من إعدادات الهوست.
 */
type Config = { url?: string; anonKey?: string };

let config: Config = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
let client: SupabaseClient | null = null;

export function configureSupabase(next: Config) {
  if (!next.url || !next.anonKey) return;
  if (next.url === config.url && next.anonKey === config.anonKey) return;
  config = next;
  client = null;
}

export function hasSupabase(): boolean {
  return Boolean(config.url && config.anonKey);
}

export function browserSupabase(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error('Supabase مش متظبّط — راجع متغيّرات البيئة');
  }
  client ??= createClient(config.url!, config.anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'simat.admin.auth',
    },
  });
  return client;
}

'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * عميل Supabase للمتصفح — بيحتفظ بجلسة تسجيل الدخول.
 * لوحة الأدمن بتشتغل بيه، والصلاحيات كلها متحققة في قاعدة البيانات
 * نفسها (RLS + الدالة is_admin)، مش في المتصفح.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function browserSupabase(): SupabaseClient {
  if (!hasSupabase) {
    throw new Error('Supabase مش متظبّط — راجع متغيّرات البيئة');
  }
  client ??= createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'simat.admin.auth',
    },
  });
  return client;
}

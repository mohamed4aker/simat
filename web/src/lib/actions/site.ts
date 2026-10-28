'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { supabaseEnv } from '@/lib/runtime-env';

/**
 * بعد أي حفظ من لوحة التحكم: بيحدّث كل صفحات الموقع فوراً بدل ما
 * تستنى الدقيقة. بيتأكد الأول إن اللي طالب ده أدمن فعلاً (بجلسته هو).
 */
export async function refreshSite(accessToken: string): Promise<boolean> {
  const { url, anonKey } = supabaseEnv();
  if (!url || !anonKey || !accessToken) return false;
  const db = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: isAdmin } = await db.rpc('is_admin');
  if (isAdmin !== true) return false;
  revalidatePath('/', 'layout');
  return true;
}

'use client';

import { configureSupabase } from '@/lib/supabase-browser';

/** بيدّي عميل المتصفح رابط Supabase ومفتاحه العام اللي جايين من السيرفر. */
export function SupabaseConfig({
  url,
  anonKey,
  children,
}: {
  url?: string;
  anonKey?: string;
  children: React.ReactNode;
}) {
  configureSupabase({ url, anonKey });
  return children;
}

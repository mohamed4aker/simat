import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { adminFonts } from '../fonts';
import { SITE_URL } from '@/lib/constants';
import { supabaseEnv } from '@/lib/runtime-env';
import { SupabaseConfig } from '@/components/admin/SupabaseConfig';

// المفاتيح بتتقري وقت التشغيل (من إعدادات الهوست)، فالصفحات دي مش static.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'لوحة التحكم', template: '%s | سِمة' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#6b1f2a',
  width: 'device-width',
  initialScale: 1,
};

/** لوحة التحكم ليها layout مستقل — عربي دايماً وبخطوطها القديمة. */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // المفتاح العام بس (anon) — المفتاح السري service_role عمره ما بيوصل للمتصفح.
  const { url, anonKey } = supabaseEnv();
  return (
    <html lang="ar" dir="rtl" className={`${adminFonts} h-full`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <SupabaseConfig url={url} anonKey={anonKey}>
          {children}
        </SupabaseConfig>
      </body>
    </html>
  );
}

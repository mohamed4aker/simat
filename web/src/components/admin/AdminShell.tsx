'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import {
  LayoutDashboard, Package, ReceiptText, LogOut, Store, Menu, X,
} from 'lucide-react';

import { SimatMark } from '@/components/brand/SimatLogo';
import { browserSupabase, hasSupabase } from '@/lib/supabase-browser';

const NAV = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/products', label: 'المنتجات', icon: Package },
  { href: '/admin/orders', label: 'الطلبات', icon: ReceiptText },
];

/**
 * غلاف لوحة الأدمن: بيتأكد إن المستخدم داخل وإنه أدمن فعلاً،
 * وبيعرض القايمة الجانبية.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: session } = useSWR(
    hasSupabase ? 'admin-session' : null,
    async () => {
      const db = browserSupabase();
      const { data } = await db.auth.getSession();
      if (!data.session) return { email: '', isAdmin: false, signedIn: false };
      const { data: isAdmin } = await db.rpc('is_admin');
      return {
        email: data.session.user.email ?? '',
        isAdmin: isAdmin === true,
        signedIn: true,
      };
    },
    { revalidateOnFocus: false },
  );

  // مش داخل أصلاً → صفحة الدخول. (تحويل مسار بس، من غير أي حالة)
  useEffect(() => {
    if (session && !session.signedIn) router.replace('/admin/login');
  }, [session, router]);

  const email = session?.email ?? '';
  const state: 'checking' | 'ready' | 'denied' = !session
    ? 'checking'
    : session.isAdmin
      ? 'ready'
      : session.signedIn
        ? 'denied'
        : 'checking';

  async function signOut() {
    await browserSupabase().auth.signOut();
    router.replace('/admin/login');
  }

  if (!hasSupabase) return <SetupNeeded />;

  if (state === 'checking') {
    return (
      <div className="min-h-screen grid place-items-center text-wine">
        <div className="text-center">
          <SimatMark size={56} />
          <p className="mt-4 text-sm text-muted">بنتأكد من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold">الحساب ده مش مسؤول</h1>
          <p className="mt-3 text-muted leading-8">
            دخلت بحساب <b dir="ltr">{email}</b> وهو مش مضاف كمسؤول للمتجر.
            ضيف الإيميل ده في جدول <code>admin_users</code> في Supabase،
            أو سجّل دخول بحساب تاني.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 rounded-xl bg-wine px-6 py-3 font-bold text-white"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* شريط الموبايل */}
      <div className="md:hidden flex items-center gap-3 border-b border-line bg-surface px-4 h-14">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="text-wine"
          aria-label="القائمة"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="font-extrabold text-wine">لوحة سِمة</span>
      </div>

      <aside
        className={`${menuOpen ? 'block' : 'hidden'} md:block w-full md:w-60 shrink-0 border-l border-line bg-surface`}
      >
        <div className="sticky top-0 p-4 flex flex-col h-full md:h-screen">
          <Link href="/admin" className="hidden md:flex items-center gap-2 text-wine px-2 py-3">
            <SimatMark size={30} />
            <span className="font-extrabold">لوحة سِمة</span>
          </Link>

          <nav className="mt-2 space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? 'bg-wine text-white'
                      : 'text-charcoal hover:bg-sand/50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted hover:bg-sand/50"
            >
              <Store size={18} />
              واجهة المتجر
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-bad hover:bg-bad/10"
            >
              <LogOut size={18} />
              تسجيل خروج
            </button>
            <p className="px-3 pt-2 text-[11px] text-faint truncate" dir="ltr">
              {email}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}

function SetupNeeded() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-lg">
        <div className="text-wine">
          <SimatMark size={56} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">
          لوحة التحكم محتاجة قاعدة البيانات
        </h1>
        <p className="mt-3 text-muted leading-8">
          الموقع شغّال دلوقتي بمنتجات تجريبية. عشان لوحة التحكم تشتغل
          وتقدر تزوّد منتجات وتتابع الطلبات، لازم نربط Supabase الأول.
        </p>
        <ol className="mt-5 space-y-2 text-sm text-muted list-decimal ps-5 leading-8">
          <li>اعمل مشروع مجاني على supabase.com واختار منطقة Frankfurt</li>
          <li>شغّل <code>supabase/schema.sql</code> ثم <code>supabase/seed.sql</code></li>
          <li>
            حط <code>NEXT_PUBLIC_SUPABASE_URL</code> و
            <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> في إعدادات الموقع
          </li>
        </ol>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-wine px-6 py-3 font-bold text-white"
        >
          رجوع للمتجر
        </Link>
      </div>
    </div>
  );
}

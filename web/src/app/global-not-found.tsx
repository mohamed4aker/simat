import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { storefrontFonts } from './fonts';

export const metadata: Metadata = {
  title: 'الصفحة مش موجودة | Page not found — SIMAT',
};

/** لأي رابط مش موجود خالص (برّه اللغتين ولوحة التحكم). */
export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={storefrontFonts}>
      <body className="min-h-screen flex items-center justify-center bg-linen-light font-sans">
        <div className="text-center px-6">
          <p className="latin text-4xl tracking-[0.28em] text-noir" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            SIMAT
          </p>
          <h1 className="mt-6 text-2xl font-serif text-noir">الصفحة مش موجودة</h1>
          <p className="mt-2 text-sm text-stone-600" lang="en" dir="ltr">Page not found</p>
          <div className="mt-8 flex gap-4 justify-center text-xs uppercase tracking-widest">
            <Link href="/ar" className="px-6 py-3 bg-bordeaux text-linen-light">الرئيسية</Link>
            <Link href="/en" lang="en" className="px-6 py-3 border border-noir/20">Home</Link>
          </div>
        </div>
      </body>
    </html>
  );
}

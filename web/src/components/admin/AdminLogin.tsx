'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';

import { SimatLogo } from '@/components/brand/SimatLogo';
import { browserSupabase, hasSupabase } from '@/lib/supabase-browser';

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const db = browserSupabase();
      const { error: authError } = await db.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError('الإيميل أو كلمة السر غلط');
        return;
      }
      const { data: isAdmin } = await db.rpc('is_admin');
      if (isAdmin !== true) {
        await db.auth.signOut();
        setError('الحساب ده مش مسجّل كمسؤول للمتجر');
        return;
      }
      router.replace('/admin');
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm ' +
    'outline-none focus:border-wine transition-colors';

  return (
    <div className="min-h-screen grid place-items-center px-4 simat-pattern">
      <div className="w-full max-w-sm">
        <div className="text-center text-wine">
          <SimatLogo size={76} />
        </div>

        <h1 className="mt-7 text-center text-xl font-extrabold">
          دخول المسؤولين
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          الصفحة دي لإدارة المتجر — مش للعملاء.
        </p>

        {!hasSupabase ? (
          <p className="mt-7 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm leading-7">
            قاعدة البيانات لسه مش متوصّلة، فتسجيل الدخول مش هيشتغل. اربط
            Supabase الأول (الخطوات في <code>web/README.md</code>).
          </p>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-3">
            <input
              type="email" required value={email} dir="ltr"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="الإيميل" className={inputClass}
              aria-label="الإيميل"
            />
            <input
              type="password" required value={password} dir="ltr"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر" className={inputClass}
              aria-label="كلمة السر"
            />

            {error && (
              <p className="flex items-start gap-2 rounded-xl bg-bad/10 px-3 py-2.5 text-xs text-bad">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </p>
            )}

            <button
              type="submit" disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-wine px-6 py-3 font-bold text-white hover:bg-wine-dark disabled:opacity-50"
            >
              <Lock size={17} />
              {busy ? 'بندخّلك...' : 'دخول'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

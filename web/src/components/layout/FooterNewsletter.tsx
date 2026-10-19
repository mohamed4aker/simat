'use client';

import { useState, useTransition } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { joinNewsletter } from '@/lib/actions/newsletter';

/** اشتراك النشرة البريدية جوه الفوتر. */
export function FooterNewsletter() {
  const { lang, dict } = useI18n();
  const t = dict.newsletter;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [pending, start] = useTransition();

  if (status === 'ok') {
    return <p className="text-sm text-gold-light" role="status">{t.success}</p>;
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await joinNewsletter(email, lang);
          setStatus(res.ok ? 'ok' : 'error');
        });
      }}
      className="space-y-2"
    >
      <div className="flex">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          className="flex-1 min-w-0 px-3 py-3 bg-white/10 border border-white/25 text-linen-light placeholder:text-linen-light/50 text-xs outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-5 bg-gold hover:bg-gold-light text-noir text-xs font-bold transition-colors disabled:opacity-60"
        >
          {t.submit}
        </button>
      </div>
      {status === 'error' && <p className="text-[11px] text-red-300">{t.invalid}</p>}
    </form>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { joinNewsletter } from '@/lib/actions/newsletter';
import { Eyebrow, field } from '@/components/ui/store';

export function Newsletter() {
  const { lang, dict } = useI18n();
  const t = dict.newsletter;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [pending, start] = useTransition();

  return (
    <section className="max-w-3xl mx-auto px-6 text-center">
      <Eyebrow className="mb-2">{t.eyebrow}</Eyebrow>
      <h2 className="text-2xl sm:text-3xl font-serif text-noir mb-3">{t.title}</h2>
      <p className="text-xs sm:text-sm text-stone-600 mb-6">{t.body}</p>
      {status === 'ok' ? (
        <p className="text-sm text-emerald-700" role="status">{t.success}</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await joinNewsletter(email, lang);
              setStatus(res.ok ? 'ok' : 'error');
            });
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className={`${field} flex-1 text-xs`}
          />
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-3 bg-bordeaux text-linen-light text-xs uppercase tracking-wider font-medium hover:bg-bordeaux-dark transition-colors disabled:opacity-60"
          >
            {t.submit}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-[11px] text-red-700 mt-2">{t.invalid}</p>}
    </section>
  );
}

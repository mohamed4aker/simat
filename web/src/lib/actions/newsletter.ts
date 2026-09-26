'use server';

import { subscribeNewsletter } from '@/lib/store';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function joinNewsletter(email: string, lang: string) {
  const value = email.trim().toLowerCase();
  if (!EMAIL.test(value) || value.length > 200) return { ok: false, invalid: true };
  return subscribeNewsletter(value, lang === 'en' ? 'en' : 'ar');
}

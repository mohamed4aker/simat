'use client';

import { createContext, use } from 'react';
import type { Dictionary } from './dictionaries/en';
import type { Locale } from './config';

interface I18nValue {
  lang: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

/** بيوصّل اللغة والنصوص لكل المكونات اللي بتشتغل في المتصفح. */
export function I18nProvider({
  lang,
  dict,
  children,
}: I18nValue & { children: React.ReactNode }) {
  return <I18nContext value={{ lang, dict }}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  const value = use(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}

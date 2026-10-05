import { ar } from './dictionaries/ar';
import { en, type Dictionary } from './dictionaries/en';
import type { Locale } from './config';

export type { Dictionary };
export * from './config';

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

export { fill } from './fill';

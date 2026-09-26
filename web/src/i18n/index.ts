import { ar } from './dictionaries/ar';
import { en, type Dictionary } from './dictionaries/en';
import type { Locale } from './config';

export type { Dictionary };
export * from './config';

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** بيملى {المتغيرات} في النص:  fill('باقي {count}', { count: 3 }) */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

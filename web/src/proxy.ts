import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, hasLocale, LOCALE_COOKIE, type Locale } from '@/i18n/config';

/**
 * أي رابط من غير لغة (زي /shop) بيتحوّل لنفس الصفحة بلغة الزائر:
 *   ١. اللغة اللي اختارها قبل كده (محفوظة في كوكي)
 *   ٢. لغة المتصفح لو إنجليزي
 *   ٣. غير كده عربي
 */
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

  const header = request.headers.get('accept-language') ?? '';
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((x) => x.lang)
    .sort((a, b) => b.q - a.q);

  const first = ranked.find((x) => hasLocale(x.lang));
  return first ? (first.lang as Locale) : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1];
  if (hasLocale(first)) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // كل حاجة ما عدا: لوحة التحكم، ملفات Next الداخلية، الـ API،
    // وأي ملف ليه امتداد (صور، sitemap.xml، robots.txt …)
    '/((?!admin|api|_next|.*\\..*).*)',
  ],
};

/**
 * عناصر الواجهة المتكررة بستايل الـ Prototype.
 */
import Link from 'next/link';

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 px-8 py-4 bg-bordeaux hover:bg-bordeaux-dark text-linen-light text-xs tracking-widest uppercase font-medium shadow-md transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed',
  dark:
    'inline-flex items-center justify-center gap-2 px-8 py-4 bg-noir hover:bg-black text-linen-light text-xs tracking-widest uppercase font-medium transition-colors duration-300',
  outline:
    'inline-flex items-center justify-center gap-2 px-8 py-4 border border-noir/20 hover:border-bordeaux text-noir text-xs tracking-widest uppercase font-medium transition-colors duration-300',
  link: 'text-xs uppercase tracking-widest text-bordeaux hover:underline underline-offset-4 font-medium',
};

export const field =
  'w-full p-3 bg-white border border-linen-border focus:border-bordeaux outline-none text-sm transition-colors placeholder:text-stone-400';

export function Eyebrow({
  children,
  className = '',
  tone = 'bordeaux',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'bordeaux' | 'gold';
}) {
  return (
    <span
      className={`block text-xs uppercase tracking-[0.25em] font-serif font-bold ${
        tone === 'gold' ? 'text-gold' : 'text-bordeaux'
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  body,
  center = false,
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  center?: boolean;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={center ? 'text-center max-w-xl mx-auto' : ''}>
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <Tag className="text-3xl sm:text-4xl font-serif text-noir leading-tight">{title}</Tag>
      {body && (
        <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">{body}</p>
      )}
    </div>
  );
}

export function TextLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${btn.link} ${className}`}>
      {children}
    </Link>
  );
}

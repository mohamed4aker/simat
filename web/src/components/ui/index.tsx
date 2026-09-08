import Link from 'next/link';
import { price as fmtPrice, priceNumber } from '@/lib/format';

export function Price({
  value,
  oldValue,
  className = '',
}: {
  value: number;
  oldValue?: number | null;
  className?: string;
}) {
  const hasDiscount = oldValue != null && oldValue > value;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-extrabold text-wine">{fmtPrice(value)}</span>
      {hasDiscount && (
        <span className="text-faint text-[0.8em] line-through">
          {priceNumber(oldValue)}
        </span>
      )}
    </span>
  );
}

export function Stars({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-copper"
      aria-label={`التقييم ${rating} من ٥`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill={rating >= i - 0.25 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
        </svg>
      ))}
      {count != null && (
        <span className="text-faint text-xs mr-1">({count})</span>
      )}
    </span>
  );
}

export function Badge({
  children,
  tone = 'wine',
}: {
  children: React.ReactNode;
  tone?: 'wine' | 'copper' | 'ok' | 'warn' | 'bad' | 'dark';
}) {
  const tones: Record<string, string> = {
    wine: 'bg-wine text-white',
    copper: 'bg-copper text-white',
    ok: 'bg-ok text-white',
    warn: 'bg-warn text-white',
    bad: 'bg-bad text-white',
    dark: 'bg-charcoal text-white',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  subtitle,
  href,
  hrefLabel = 'عرض الكل',
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal">{title}</h2>
        {subtitle && (
          <p className="text-muted text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-bold text-wine hover:text-copper transition-colors"
        >
          {hrefLabel} ←
        </Link>
      )}
    </div>
  );
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold ' +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const buttonStyles = {
  primary: `${buttonBase} bg-wine text-white hover:bg-wine-dark px-6 py-3`,
  outline: `${buttonBase} border border-wine text-wine hover:bg-wine hover:text-white px-6 py-3`,
  ghost: `${buttonBase} text-wine hover:bg-sand/50 px-4 py-2`,
  copper: `${buttonBase} bg-copper text-white hover:bg-[#a2652c] px-6 py-3`,
};

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-line rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

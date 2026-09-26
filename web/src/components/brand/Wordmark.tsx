/**
 * شعار الواجهة بنفس رسم الـ Prototype: القطرة + SIMAT + الخط المنحني.
 */
export const DROP_PATH =
  'M15.2 0.8C15.2 0.8 17.5 7.8 17.1 13.4C16.8 17.1 14.5 20.2 12.8 23.5C10.5 27.9 10 33.2 12.3 37.8C14.7 42.6 19.8 45.4 25.1 44.4C26.5 44.1 27.8 43.5 28.9 42.6C26.1 44.5 22.3 44.8 19.1 43.6C14.2 41.7 11.2 36.6 12.1 31.4C12.8 27.2 15.6 23.6 17.4 19.8C19.7 14.9 19.9 8.8 17.7 3.8C17.1 2.4 16.3 1.3 15.2 0.8Z';

export function Drop({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 46" fill="currentColor" aria-hidden="true">
      <path d={DROP_PATH} />
    </svg>
  );
}

export function Swoosh({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 6" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M4 1.5C14 4.5 26 0.5 36 2" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({
  tagline,
  size = 'lg',
}: {
  tagline?: string;
  size?: 'lg' | 'sm';
}) {
  const big = size === 'lg';
  return (
    <span className="latin flex flex-col items-center select-none" dir="ltr">
      <span className="flex items-center gap-2">
        <Drop className={`${big ? 'w-5 h-7' : 'w-4 h-6'} text-bordeaux`} />
        <span
          className={`${
            big ? 'text-2xl md:text-3xl' : 'text-xl'
          } font-serif tracking-[0.28em] text-noir uppercase`}
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          SIMAT
        </span>
      </span>
      {big && <Swoosh className="w-10 h-1.5 text-bordeaux -mt-1" />}
      {tagline && (
        <span className="text-[8px] uppercase tracking-[0.3em] text-stone-500 -mt-0.5 font-light">
          {tagline}
        </span>
      )}
    </span>
  );
}

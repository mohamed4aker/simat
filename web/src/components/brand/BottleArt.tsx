/**
 * رسم زجاجة عطر بألوان الهوية — بيتعرض للمنتجات اللي لسه
 * مالهاش صورة فوتوغرافية، فالكتالوج يفضل مكتمل الشكل.
 * لون السائل بيتحدّد من معرّف المنتج فكل منتج ليه شكل ثابت.
 */
const PALETTES = [
  { bg1: '#f7f1e8', bg2: '#e6d9c7', liquid: '#b87333' },
  { bg1: '#f3e7e4', bg2: '#dfc7c4', liquid: '#6b1f2a' },
  { bg1: '#f1ede4', bg2: '#d9cfc3', liquid: '#8a6a3b' },
  { bg1: '#f6ede2', bg2: '#e8d3b8', liquid: '#6e4c6e' },
];

export function BottleArt({
  seed,
  className = '',
}: {
  seed: string;
  className?: string;
}) {
  const index =
    [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTES.length;
  const p = PALETTES[index];
  const gid = `g-${seed.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="زجاجة عطر سِمة"
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.bg1} />
          <stop offset="100%" stopColor={p.bg2} />
        </linearGradient>
        <linearGradient id={`${gid}-liq`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.liquid} stopOpacity="0.55" />
          <stop offset="100%" stopColor={p.liquid} stopOpacity="0.95" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <rect x="62" y="78" width="76" height="88" rx="14" />
        </clipPath>
        <pattern
          id={`${gid}-pat`}
          width="46"
          height="46"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M12 10c0 6-7 8-7 13 0 4 3 7 7 7s7-3 7-7c0-5-7-7-7-13z"
            fill="none"
            stroke="#b87333"
            strokeOpacity="0.13"
            strokeWidth="1.1"
          />
        </pattern>
      </defs>

      <rect width="200" height="200" fill={`url(#${gid}-bg)`} />
      <rect width="200" height="200" fill={`url(#${gid}-pat)`} />

      {/* الغطاء والعنق */}
      <rect x="86" y="34" width="28" height="22" rx="5" fill="#1c1a17" opacity="0.78" />
      <rect x="92" y="56" width="16" height="24" fill="#ffffff" opacity="0.72" />

      {/* جسم الزجاجة */}
      <rect x="62" y="78" width="76" height="88" rx="14" fill="#ffffff" opacity="0.62" />
      <g clipPath={`url(#${gid}-clip)`}>
        <rect x="62" y="108" width="76" height="58" fill={`url(#${gid}-liq)`} />
      </g>
      <rect
        x="62"
        y="78"
        width="76"
        height="88"
        rx="14"
        fill="none"
        stroke="#1c1a17"
        strokeOpacity="0.22"
        strokeWidth="1.6"
      />
      <rect x="72" y="88" width="9" height="48" rx="4" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

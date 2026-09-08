/**
 * شعار سِمة — مرسوم SVG عشان يفضل حاد على أي مقاس.
 * نفس الرمز المستخدم في تطبيق الموبايل بالظبط.
 */

export function SimatMark({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size * 0.62}
      height={size}
      viewBox="0 0 100 160"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path
          d="M50 52C50 82 13 94 13 120c0 22 17 37 37 37s37-15 37-37c0-26-37-38-37-68z"
          strokeWidth="6"
        />
        <path d="M50 52c8-16-10-22-5-37 3-10 17-12 20-3" strokeWidth="5" />
      </g>
    </svg>
  );
}

export function SimatLogo({
  size = 56,
  showArabic = true,
  className = '',
}: {
  size?: number;
  showArabic?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <SimatMark size={size} />
      <span
        className="font-display leading-none"
        style={{
          fontSize: size * 0.38,
          letterSpacing: size * 0.13,
          marginTop: size * 0.16,
          paddingRight: size * 0.13,
        }}
      >
        SIMAT
      </span>
      {showArabic && (
        <span
          className="opacity-80 leading-none"
          style={{ fontSize: size * 0.3, marginTop: size * 0.1 }}
        >
          سِمة
        </span>
      )}
    </span>
  );
}

/** نسخة أفقية لشريط التنقّل. */
export function SimatLogoBar({ height = 34 }: { height?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-wine">
      <SimatMark size={height} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display"
          style={{
            fontSize: height * 0.5,
            letterSpacing: height * 0.14,
            paddingRight: height * 0.14,
          }}
        >
          SIMAT
        </span>
        <span
          className="opacity-70"
          style={{ fontSize: height * 0.31, marginTop: height * 0.08 }}
        >
          سِمة
        </span>
      </span>
    </span>
  );
}

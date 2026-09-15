'use client';

import { price } from '@/lib/format';

export function Kpi({
  label,
  value,
  hint,
  growth,
}: {
  label: string;
  value: string;
  hint?: string;
  growth?: number | null;
}) {
  const up = (growth ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted">{label}</p>
        {growth != null && Number.isFinite(growth) && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              up ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad'
            }`}
          >
            {up ? '▲' : '▼'} {Math.abs(growth).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-xl font-extrabold truncate">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

/** منحنى مبيعات بسيط مرسوم SVG — من غير أي مكتبة. */
export function SalesChart({
  points,
}: {
  points: { day: string; revenue: number }[];
}) {
  if (points.length < 2) {
    return (
      <p className="grid h-48 place-items-center text-sm text-faint">
        مفيش مبيعات كفاية لرسم المنحنى
      </p>
    );
  }

  const w = 700;
  const h = 180;
  const pad = 8;
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const step = (w - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * step;
    const y = h - pad - (p.revenue / max) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M ${coords.join(' L ')}`;
  const area = `${line} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-44"
        preserveAspectRatio="none"
        role="img"
        aria-label="منحنى المبيعات"
      >
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b1f2a" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6b1f2a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#fill)" />
        <path
          d={line}
          fill="none"
          stroke="#6b1f2a"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-faint">
        <span>{points[0]?.day}</span>
        <span>أعلى يوم: {price(max)}</span>
        <span>{points[points.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warn/12 text-warn border-warn/30',
  confirmed: 'bg-[#35618e]/12 text-[#35618e] border-[#35618e]/30',
  preparing: 'bg-copper/12 text-copper border-copper/30',
  shipped: 'bg-wine-light/12 text-wine-light border-wine-light/30',
  delivered: 'bg-ok/12 text-ok border-ok/30',
  cancelled: 'bg-bad/12 text-bad border-bad/30',
  returned: 'bg-faint/12 text-faint border-faint/30',
};

export function StatusPill({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        STATUS_STYLES[status] ?? STATUS_STYLES.returned
      }`}
    >
      {label}
    </span>
  );
}

export const adminInput =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm ' +
  'outline-none focus:border-wine transition-colors';

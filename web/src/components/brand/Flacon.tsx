/**
 * زجاجة سِمة مرسومة بالـ CSS زي الـ Prototype بالظبط: غطا أسود،
 * زجاج شفاف، وملصق بلون العطر. لو المنتج ليه صورة حقيقية بنعرضها.
 */
import Image from 'next/image';
import type { LabelStyle, ProductKind } from '@/lib/types';
import { Drop, Swoosh } from './Wordmark';

const LABELS: Record<LabelStyle, string> = {
  bordeaux: 'bg-bordeaux text-linen-light border border-bordeaux-dark',
  noir: 'bg-noir text-white border border-stone-800',
  linen: 'bg-linen-light text-bordeaux border border-stone-300',
  velvet: 'bg-velvet text-gold border border-gold/40',
};

const SIZES = {
  sm: { cap: 'w-14 h-7', neck: 'w-7 h-1.5', glass: 'w-20 h-32', label: 'w-16 h-24 p-2', base1: 'w-28 h-2', base2: 'w-32 h-1.5', name: 'text-[8px]', sub: 'text-[6px]' },
  md: { cap: 'w-20 h-10', neck: 'w-10 h-2', glass: 'w-24 h-40', label: 'w-20 h-32 p-2.5', base1: 'w-32 h-2.5', base2: 'w-36 h-2', name: 'text-[9px]', sub: 'text-[6px]' },
  lg: { cap: 'w-24 sm:w-28 h-12', neck: 'w-12 h-2.5', glass: 'w-32 sm:w-36 h-56', label: 'w-24 sm:w-28 h-44 py-4 px-2', base1: 'w-44 sm:w-52 h-4', base2: 'w-52 sm:w-60 h-3', name: 'text-xs', sub: 'text-[9px]' },
} as const;

export function Flacon({
  labelStyle,
  name,
  concentration,
  size = 'md',
  imageUrl,
  alt = '',
  kind = 'bottle',
}: {
  labelStyle: LabelStyle;
  name: string;
  concentration: string;
  size?: keyof typeof SIZES;
  imageUrl?: string | null;
  alt?: string;
  kind?: ProductKind;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
    );
  }
  if (kind === 'set') return <Coffret size={size} />;

  const s = SIZES[size];
  return (
    <div className="latin flex flex-col items-center" dir="ltr" aria-hidden="true">
      <div className={`${s.cap} bg-noir shadow-lg flex items-center justify-center`}>
        <div className="w-2/3 h-0.5 bg-white/10" />
      </div>
      <div className={`${s.neck} bg-stone-700`} />
      <div className={`${s.glass} bg-white/35 border-2 border-stone-300/80 backdrop-blur-[2px] flex items-center justify-center shadow-2xl glass-reflection`}>
        <div className={`${s.label} ${LABELS[labelStyle]} flex flex-col items-center justify-between text-center shadow-inner`}>
          <Drop className="w-3 h-4 opacity-85" />
          <div>
            <span className={`${s.name} uppercase tracking-[0.18em] block leading-tight`} style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              SIMAT
            </span>
            {size === 'lg' && <Swoosh className="w-7 h-1 mx-auto" />}
            <span className={`${s.sub} tracking-wider uppercase opacity-80 block mt-0.5`}>{name}</span>
          </div>
          <span className={`${s.sub} tracking-wider uppercase opacity-60`}>{concentration}</span>
        </div>
      </div>
      <div className={`${s.base1} bg-[#dcd4c7] shadow-md -mt-0.5`} />
      <div className={`${s.base2} bg-[#cfbfab] shadow-lg`} />
    </div>
  );
}

/** علبة طقم العينات: 5 أنابيب صغيرة. */
export function Coffret({
  size = 'md',
  vials = ['Bordeaux', 'Noir', 'Ivoire', 'Royal', 'Dehn Oud'],
}: {
  size?: keyof typeof SIZES;
  vials?: string[];
}) {
  const box = size === 'lg' ? 'w-64 p-6' : size === 'md' ? 'w-44 p-4' : 'w-32 p-3';
  const vialH = size === 'lg' ? 'h-24' : size === 'md' ? 'h-16' : 'h-12';
  return (
    <div className={`latin ${box} aspect-square bg-noir text-linen-light border border-stone-800 shadow-2xl flex flex-col justify-between`} dir="ltr" aria-hidden="true">
      <div className="flex justify-between text-[8px] tracking-wider text-stone-400 uppercase">
        <span>SIMAT Co.</span>
        <span>5 × 2ml</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 my-auto py-2">
        {vials.map((v) => (
          <div key={v} className={`${vialH} bg-white/15 border border-white/30 rounded-t-full flex items-end justify-center pb-1 overflow-hidden`}>
            <span className="text-[6px] [writing-mode:vertical-rl] rotate-180 opacity-80">{v}</span>
          </div>
        ))}
      </div>
      <span className="text-[7px] uppercase tracking-wider text-stone-400 text-center">Discovery Coffret</span>
    </div>
  );
}

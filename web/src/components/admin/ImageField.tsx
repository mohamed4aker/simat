'use client';

import { useRef, useState } from 'react';
import { ImageUp, Loader2, X } from 'lucide-react';
import { uploadImage } from '@/lib/upload';
import { adminInput } from './ui';

/**
 * خانة صورة: معاينة + زرار «ارفع صورة» من الموبايل أو اللاب،
 * أو لصق لينك جاهز.
 */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  hint,
  aspect = 'aspect-square',
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  hint?: string;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'الصورة ما اترفعتش');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <div className="flex gap-3 items-start">
        <div className={`relative w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-sand/30 ${aspect}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[10px] text-faint">مفيش صورة</span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="w-5 h-5 animate-spin text-wine" />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-wine px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              <ImageUp size={15} />
              {busy ? 'بيترفع…' : 'ارفع صورة'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:text-bad"
              >
                <X size={14} /> شيل
              </button>
            )}
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir="ltr"
            placeholder="أو الزق لينك صورة https://..."
            className={`${adminInput} text-xs`}
          />
          {hint && <p className="text-[11px] text-faint leading-5">{hint}</p>}
          {error && <p className="text-[11px] font-bold text-bad">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}

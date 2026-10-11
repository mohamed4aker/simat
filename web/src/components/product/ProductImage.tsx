import Image from 'next/image';

/**
 * صورة منتج من أي رابط (Supabase Storage، الهوست، …).
 * `unoptimized` عشان الصور ممكن تيجي من أي دومين.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  fit = 'cover',
  sizes = '(max-width: 768px) 100vw, 33vw',
}: {
  src: string;
  alt: string;
  priority?: boolean;
  /** contain + multiply: صورة الزجاجة (خلفيتها بيضا) فوق خلفية بيج من غير مربع أبيض. */
  fit?: 'cover' | 'contain';
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className={fit === 'contain' ? 'object-contain mix-blend-multiply' : 'object-cover'}
    />
  );
}

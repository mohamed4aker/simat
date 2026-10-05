import Image from 'next/image';

/**
 * صورة منتج من أي رابط (Supabase Storage، الهوست، …).
 * `unoptimized` عشان الصور ممكن تيجي من أي دومين.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover"
    />
  );
}

'use client';

import { browserSupabase } from './supabase-browser';
import { refreshSite } from './actions/site';

/** فولدر الصور في Supabase Storage (لازم يكون متعمل بـ update-db.sql). */
export const MEDIA_BUCKET = 'media';

/**
 * بيصغّر الصورة (أقصى عرض/طول 2000px) ويحوّلها WebP قبل الرفع،
 * عشان صور الموبايل الكبيرة متبطّأش الموقع.
 */
async function shrink(file: File, max = 2000): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** بيرفع صورة ويرجّع اللينك بتاعها. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const db = browserSupabase();
  const body = await shrink(file);
  const ext = body.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: body.type || file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    throw new Error(
      /bucket/i.test(error.message)
        ? 'فولدر الصور لسه مش متعمل — شغّل ملف update-db.sql في Supabase'
        : 'الصورة ما اترفعتش — جرّب تاني',
    );
  }
  return db.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** بعد الحفظ: الموقع يتحدّث فوراً (لو فشل، بيتحدّث لوحده خلال دقيقة). */
export async function refreshSiteNow(): Promise<void> {
  try {
    const { data } = await browserSupabase().auth.getSession();
    if (data.session) await refreshSite(data.session.access_token);
  } catch {
    // مش مشكلة — الصفحات بتتحدّث لوحدها كل دقيقة.
  }
}

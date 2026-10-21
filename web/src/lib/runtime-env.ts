/**
 * متغيرات البيئة وقت التشغيل (مش وقت البناء).
 *
 * Next بيلزق قيم NEXT_PUBLIC_* جوه الكود وقت البناء، فلو اتحطت بعد كده
 * في cPanel مش هتتشاف. عشان كده بنقرا الأسامي هنا بشكل ديناميكي، فتقدر
 * تتحط من إعدادات الهوست (Setup Node.js App → Environment variables)
 * من غير ما الموقع يتبني تاني:
 *   SUPABASE_URL · SUPABASE_ANON_KEY · SUPABASE_SERVICE_ROLE_KEY
 * (والأسامي القديمة NEXT_PUBLIC_SUPABASE_* لسه شغالة.)
 *
 * ⚠ للسيرفر بس.
 */
const read = (name: string): string | undefined => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
};

export function supabaseEnv() {
  return {
    url: read('SUPABASE_URL') ?? read('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: read('SUPABASE_ANON_KEY') ?? read('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceKey: read('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

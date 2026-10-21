import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // مخرجات standalone بتتفعّل بس لما نبني للنشر على سيرفرك أو Docker
  // (متغيّر BUILD_STANDALONE=1). منصّات زي Vercel بتتعامل مع المخرجات
  // العادية، والوضع ده بيسبّب مشاكل عندها — عشان كده مش مفعّل افتراضياً.
  ...(process.env.BUILD_STANDALONE === '1'
    ? { output: 'standalone' as const }
    : {}),

  images: {
    // الصور webp جاهزة ومصغّرة (scripts/import-images.mjs)، فمفيش ضغط على
    // السيرفر — ده بيخلّي نسخة الهوست تشتغل من غير sharp.
    unoptimized: true,
    // صور المنتجات ممكن تتحط في Supabase Storage أو أي مكان تاني.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      // صور الأقسام في الرئيسية (مؤقتة لحد ما تيجي صور التصوير الحقيقية)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  experimental: {
    // صفحة 404 واحدة للموقع كله (عندنا layout للواجهة وlayout للأدمن).
    globalNotFound: true,
  },
};

export default nextConfig;

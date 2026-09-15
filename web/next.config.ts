import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // مخرجات standalone بتتفعّل بس لما نبني للنشر على سيرفرك أو Docker
  // (متغيّر BUILD_STANDALONE=1). منصّات زي Vercel بتتعامل مع المخرجات
  // العادية، والوضع ده بيسبّب مشاكل عندها — عشان كده مش مفعّل افتراضياً.
  ...(process.env.BUILD_STANDALONE === '1'
    ? { output: 'standalone' as const }
    : {}),

  images: {
    // صور المنتجات ممكن تتحط في Supabase Storage أو أي مكان تاني.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;

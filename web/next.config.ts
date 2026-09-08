import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // بيخلي `next build` يطلّع مجلد standalone فيه السيرفر وكل اللي محتاجه،
  // فالنشر على سيرفرك أو Docker يبقى نسخ مجلد واحد وتشغيله.
  output: 'standalone',

  images: {
    // صور المنتجات ممكن تتحط في Supabase Storage أو أي مكان تاني.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;

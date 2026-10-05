import { getCategories, getProducts } from '@/lib/store';

// الكتالوج بيتحدّث كل دقيقة زي صفحات الموقع.
export const revalidate = 60;

/**
 * الكتالوج كله للأبلكيشن — نفس المنتجات اللي على الموقع، فأي منتج
 * يتضاف أو يتعدّل من لوحة التحكم بيظهر في الاتنين.
 *
 *   GET /api/products
 */
export async function GET() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return Response.json({ products, categories, updatedAt: new Date().toISOString() });
}

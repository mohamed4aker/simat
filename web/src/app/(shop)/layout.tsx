import { CartProvider } from '@/components/cart/CartProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCategories } from '@/lib/store';

/** واجهة المتجر — الهيدر والفوتر وعربة التسوق. */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <CartProvider>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </CartProvider>
  );
}

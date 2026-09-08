import Link from 'next/link';
import { BottleArt } from '@/components/brand/BottleArt';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { Badge, Price, Stars } from '@/components/ui';
import { discountPercent } from '@/lib/format';
import { concentrationShort, type Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product.price, product.oldPrice);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group bg-surface border border-line rounded-2xl overflow-hidden flex flex-col hover:border-copper/60 hover:shadow-[0_8px_30px_-18px_rgba(107,31,42,0.5)] transition-all">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        {product.imageUrl ? (
          // صور المنتجات ممكن تيجي من أي مصدر، فبنعرضها من غير معالجة.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <BottleArt
            seed={product.id}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        )}

        <div className="absolute top-3 right-3 flex flex-col items-start gap-1.5">
          {off > 0 && <Badge>خصم {off}%</Badge>}
          {outOfStock ? (
            <Badge tone="dark">نفد المخزون</Badge>
          ) : product.stock <= 5 ? (
            <Badge tone="warn">باقي {product.stock}</Badge>
          ) : null}
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/product/${product.slug}`} className="min-w-0">
          <h3 className="font-bold text-[15px] truncate group-hover:text-wine transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-faint">
          {concentrationShort[product.concentration]} · {product.sizeMl} مل
        </p>
        <Stars rating={product.rating} count={product.ratingCount} size={13} />

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <Price value={product.price} oldValue={product.oldPrice} />
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

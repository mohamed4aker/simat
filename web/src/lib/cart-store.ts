/**
 * مخزن عربة التسوق — بيعيش برّه React عشان يتحفظ في المتصفح
 * ويتقرا بـ useSyncExternalStore من غير أي تعارض وقت الـ hydration.
 */
import type { CartLine, Product } from './types';

const KEY = 'simat.cart.v1';
const EMPTY: CartLine[] = [];

type Listener = () => void;

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<Listener>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartLine[];
      if (Array.isArray(parsed)) lines = parsed;
    }
  } catch {
    // تخزين المتصفح ممكن يكون مقفول — نكمّل بعربة فاضية.
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // مش مشكلة لو ما اتحفظتش.
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: Listener) {
    load();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** بيرجّع نفس المرجع طول ما مفيش تغيير — شرط useSyncExternalStore. */
  getSnapshot(): CartLine[] {
    load();
    return lines;
  },

  /** على السيرفر العربة دايماً فاضية. */
  getServerSnapshot(): CartLine[] {
    return EMPTY;
  },

  add(product: Product, quantity = 1) {
    const max = product.stock > 0 ? product.stock : 99;
    const found = lines.find((l) => l.productId === product.id);
    if (found) {
      commit(
        lines.map((l) =>
          l.productId === product.id
            ? { ...l, quantity: Math.min(l.quantity + quantity, max) }
            : l,
        ),
      );
      return;
    }
    commit([
      ...lines,
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        sizeMl: product.sizeMl,
        quantity: Math.min(quantity, max),
        imageUrl: product.imageUrl,
      },
    ]);
  },

  setQuantity(productId: string, quantity: number) {
    commit(
      quantity <= 0
        ? lines.filter((l) => l.productId !== productId)
        : lines.map((l) =>
            l.productId === productId ? { ...l, quantity } : l,
          ),
    );
  },

  remove(productId: string) {
    commit(lines.filter((l) => l.productId !== productId));
  },

  clear() {
    commit([]);
  },
};

/** اشتراك فاضي — بنستخدمه بس عشان نعرف إحنا بعد الـ hydration ولا لأ. */
export function subscribeNoop() {
  return () => {};
}

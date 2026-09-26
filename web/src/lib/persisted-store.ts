/**
 * مخزن صغير بيتحفظ في المتصفح ويتقرا بـ useSyncExternalStore
 * من غير أي تعارض وقت الـ hydration (على السيرفر بيرجع القيمة
 * الابتدائية دايماً).
 */
type Listener = () => void;

export interface PersistedStore<T> {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  get: () => T;
  set: (next: T) => void;
}

export function createPersistedStore<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T,
): PersistedStore<T> {
  let value = initial;
  let loaded = false;
  const listeners = new Set<Listener>();

  function load() {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) value = parsed;
      }
    } catch {
      // تخزين المتصفح ممكن يكون مقفول — نكمّل بالقيمة الابتدائية.
    }
  }

  return {
    subscribe(listener) {
      load();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      load();
      return value;
    },
    getServerSnapshot() {
      return initial;
    },
    get() {
      load();
      return value;
    },
    set(next) {
      value = next;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // مش مشكلة لو ما اتحفظتش.
      }
      listeners.forEach((l) => l());
    },
  };
}

/** اشتراك فاضي — بنستخدمه بس عشان نعرف إحنا بعد الـ hydration ولا لأ. */
export function subscribeNoop() {
  return () => {};
}

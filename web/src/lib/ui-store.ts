/**
 * حالة الواجهة المشتركة: السلة الجانبية، البحث، المفضلة،
 * قائمة الموبايل، ورسائل التأكيد الصغيرة (toast).
 */
type Listener = () => void;

export type Panel = 'cart' | 'search' | 'wishlist' | 'menu' | null;

export interface UiState {
  panel: Panel;
  toast: { id: number; message: string } | null;
}

let state: UiState = { panel: null, toast: null };
const listeners = new Set<Listener>();
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function setState(next: Partial<UiState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const uiStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  getServerSnapshot: () => state,

  open(panel: Exclude<Panel, null>) {
    setState({ panel });
  },
  close() {
    setState({ panel: null });
  },
  toast(message: string) {
    clearTimeout(toastTimer);
    setState({ toast: { id: Date.now(), message } });
    toastTimer = setTimeout(() => setState({ toast: null }), 3200);
  },
};

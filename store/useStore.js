import { create } from "zustand";
import { cartService, wishlistService } from "@/services/api";

const STORAGE_KEY = "zipra-store";

function loadPersisted() {
  if (typeof window === "undefined") return { cart: [], wishlist: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cart: [], wishlist: [] };
    const parsed = JSON.parse(raw);
    return { cart: parsed.cart || [], wishlist: parsed.wishlist || [] };
  } catch {
    return { cart: [], wishlist: [] };
  }
}

function persist(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cart: state.cart, wishlist: state.wishlist })
    );
  } catch {}
}

const initial = loadPersisted();

export const useStore = create((set, get) => ({
  cart: initial.cart,
  wishlist: initial.wishlist,
  syncing: false,

  // ---- Cart ----
  addToCart: async (product, qty = 1) => {
    // optimistic
    set((state) => {
      const existing = state.cart.find((i) => i.id === product.id);
      const cart = existing
        ? state.cart.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + qty } : i
          )
        : [
            ...state.cart,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              image: product.image,
              unit: product.unit,
              qty,
            },
          ];
      persist({ ...state, cart });
      return { cart };
    });
    try {
      const res = await cartService.add(product.id, qty);
      if (res?.items) set({ cart: res.items });
    } catch {
      /* keep optimistic state */
    }
  },

  setQty: async (id, qty) => {
    const item = get().cart.find((i) => i.id === id);
    set((state) => {
      const cart = state.cart
        .map((i) => (i.id === id ? { ...i, qty } : i))
        .filter((i) => i.qty > 0);
      persist({ ...state, cart });
      return { cart };
    });
    if (item?.cartItemId) {
      try {
        const res = await cartService.setQty(item.cartItemId, qty);
        if (res?.items) set({ cart: res.items });
      } catch {}
    }
  },

  removeFromCart: async (id) => {
    const item = get().cart.find((i) => i.id === id);
    set((state) => {
      const cart = state.cart.filter((i) => i.id !== id);
      persist({ ...state, cart });
      return { cart };
    });
    if (item?.cartItemId) {
      try {
        const res = await cartService.remove(item.cartItemId);
        if (res?.items) set({ cart: res.items });
      } catch {}
    }
  },

  clearCart: async () => {
    set({ cart: [] });
    persist({ cart: [], wishlist: get().wishlist });
    try {
      await cartService.clear();
    } catch {}
  },

  // ---- Wishlist ----
  toggleWishlist: async (product) => {
    const exists = get().wishlist.find((i) => i.id === product.id);
    set((state) => {
      const wishlist = exists
        ? state.wishlist.filter((i) => i.id !== product.id)
        : [
            ...state.wishlist,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              image: product.image,
              unit: product.unit,
            },
          ];
      persist({ ...state, wishlist });
      return { wishlist };
    });
    try {
      if (exists) await wishlistService.remove(product.id);
      else await wishlistService.add(product.id);
    } catch {}
  },

  isWishlisted: (id) => get().wishlist.some((i) => i.id === id),

  // ---- Sync from backend (call after login / on mount) ----
  syncFromBackend: async () => {
    try {
      const [c, w] = await Promise.all([cartService.get(), wishlistService.list()]);
      set({
        cart: c.items?.length ? c.items : get().cart,
        wishlist: w.length ? w : get().wishlist,
      });
    } catch {}
  },

  cartCount: () => get().cart.reduce((n, i) => n + i.qty, 0),
  cartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.qty, 0),
  cartMrpTotal: () => get().cart.reduce((sum, i) => sum + (i.mrp || i.price) * i.qty, 0),
}));

export default useStore;

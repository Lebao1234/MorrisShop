import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartApi } from "@/services/api";
import { useAuthStore } from "./authStore";

/**
 * Gio hang hoat dong o hai che do:
 * - Khach chua dang nhap: luu trong localStorage (guestItems), tinh tien ngay tren client.
 * - Da dang nhap: nguon su that la server; guestItems duoc gop len khi dang nhap.
 */
export const emptyCart = { items: [], subtotal: 0, totalQuantity: 0 };

/**
 * Chuyen guestItems (localStorage) sang cung hinh dang voi gio hang tu server.
 * Ham thuan, dat ngoai store de component co the memo hoa ket qua - neu tinh
 * ben trong selector cua zustand, moi lan render se sinh object moi va gay
 * canh bao "getSnapshot should be cached" roi lap vo han.
 */
export const buildGuestCart = (guestItems = []) => {
  const items = guestItems.map((item, index) => ({
    _id: `guest-${index}-${item.variantSku}`,
    product: item.snapshot.product,
    variantSku: item.variantSku,
    variantName: item.snapshot.variantName,
    price: item.snapshot.price,
    quantity: item.quantity,
    stock: item.snapshot.stock,
    lineTotal: item.snapshot.price * item.quantity,
    outOfStock: item.snapshot.stock < item.quantity,
    isGuest: true,
  }));

  return {
    items,
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  };
};

export const useCartStore = create()(
  persist(
    (set, get) => ({
      server: emptyCart,
      guestItems: [], // { productId, variantSku, quantity, snapshot }
      isLoading: false,
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

      /**
       * Gio hang hien hanh - chi dung ngoai React (trong action/handler).
       * Trong component hay dung hook useCart de ket qua duoc memo hoa.
       */
      current: () => {
        const isAuth = Boolean(useAuthStore.getState().user);
        return isAuth ? get().server : buildGuestCart(get().guestItems);
      },

      fetch: async () => {
        if (!useAuthStore.getState().user) return;
        set({ isLoading: true });
        try {
          const res = await cartApi.get();
          set({ server: res.data });
        } finally {
          set({ isLoading: false });
        }
      },

      add: async ({ product, variant, quantity = 1 }) => {
        const isAuth = Boolean(useAuthStore.getState().user);

        if (isAuth) {
          const res = await cartApi.add({
            productId: product._id,
            variantSku: variant.sku,
            quantity,
          });
          set({ server: res.data });
          return res.data;
        }

        const price = variant.salePrice > 0 ? variant.salePrice : variant.price;
        const guestItems = [...get().guestItems];
        const existing = guestItems.find(
          (i) => i.productId === product._id && i.variantSku === variant.sku,
        );

        const nextQty = (existing?.quantity || 0) + quantity;
        if (nextQty > variant.stock) {
          throw new Error(
            variant.stock === 0 ? "Sản phẩm đã hết hàng" : `Chỉ còn ${variant.stock} sản phẩm trong kho`,
          );
        }

        const snapshot = {
          product: { _id: product._id, name: product.name, slug: product.slug, image: product.images?.[0] },
          variantName: variant.name,
          price,
          stock: variant.stock,
        };

        if (existing) {
          existing.quantity = nextQty;
          existing.snapshot = snapshot;
        } else {
          guestItems.push({ productId: product._id, variantSku: variant.sku, quantity, snapshot });
        }

        set({ guestItems });
        return get().current();
      },

      updateQuantity: async (itemId, quantity) => {
        if (useAuthStore.getState().user) {
          const res = await cartApi.update(itemId, quantity);
          set({ server: res.data });
          return res.data;
        }

        const index = Number(String(itemId).split("-")[1]);
        const guestItems = [...get().guestItems];
        if (quantity <= 0) guestItems.splice(index, 1);
        else if (guestItems[index]) {
          if (quantity > guestItems[index].snapshot.stock) {
            throw new Error(`Chỉ còn ${guestItems[index].snapshot.stock} sản phẩm trong kho`);
          }
          guestItems[index].quantity = quantity;
        }
        set({ guestItems });
        return get().current();
      },

      remove: async (itemId) => {
        if (useAuthStore.getState().user) {
          const res = await cartApi.remove(itemId);
          set({ server: res.data });
          return res.data;
        }
        const index = Number(String(itemId).split("-")[1]);
        const guestItems = get().guestItems.filter((_, i) => i !== index);
        set({ guestItems });
        return get().current();
      },

      clear: async () => {
        if (useAuthStore.getState().user) {
          const res = await cartApi.clear();
          set({ server: res.data });
          return res.data;
        }
        set({ guestItems: [] });
        return emptyCart;
      },

      /** Goi sau khi dang nhap thanh cong */
      syncAfterLogin: async () => {
        const guestItems = get().guestItems;
        try {
          if (guestItems.length) {
            const res = await cartApi.merge(
              guestItems.map(({ productId, variantSku, quantity }) => ({ productId, variantSku, quantity })),
            );
            set({ server: res.data, guestItems: [] });
          } else {
            await get().fetch();
          }
        } catch {
          await get().fetch();
        }
      },

      resetOnLogout: () => set({ server: emptyCart }),

      /** Payload gui kem khi dang nhap de server tu gop gio hang */
      guestPayload: () =>
        get().guestItems.map(({ productId, variantSku, quantity }) => ({ productId, variantSku, quantity })),
    }),
    {
      name: "morris-cart",
      partialize: (state) => ({ guestItems: state.guestItems }),
    },
  ),
);

export default useCartStore;

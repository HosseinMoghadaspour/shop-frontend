import { create } from "zustand";

import {
  addToCart as addToCartApi,
  clearCart as clearCartApi,
  getCart,
  removeFromCart as removeFromCartApi,
  updateCartItem as updateCartItemApi,
  type Cart,
} from "@/services/cart.api";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;

  addItem: (
    goodId: number,
    quantity: number,
  ) => Promise<void>;

  updateItem: (
    goodId: number,
    quantity: number,
  ) => Promise<void>;

  removeItem: (
    goodId: number,
  ) => Promise<void>;

  clear: () => Promise<void>;

  reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchCart: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const cart = await getCart();

      set({
        cart,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "خطا در دریافت سبد خرید.",
      });
    }
  },

  addItem: async (goodId, quantity) => {
    set({
      isUpdating: true,
      error: null,
    });

    try {
      const cart = await addToCartApi(
        goodId,
        quantity,
      );

      set({
        cart,
        isUpdating: false,
      });
    } catch (error) {
      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "خطا در افزودن محصول به سبد خرید.",
      });

      throw error;
    }
  },

  updateItem: async (goodId, quantity) => {
    set({
      isUpdating: true,
      error: null,
    });

    try {
      const cart = await updateCartItemApi(
        goodId,
        quantity,
      );

      set({
        cart,
        isUpdating: false,
      });
    } catch (error) {
      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "خطا در بروزرسانی سبد خرید.",
      });

      throw error;
    }
  },

  removeItem: async (goodId) => {
    set({
      isUpdating: true,
      error: null,
    });

    try {
      const cart = await removeFromCartApi(goodId);

      set({
        cart,
        isUpdating: false,
      });
    } catch (error) {
      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "خطا در حذف محصول از سبد خرید.",
      });

      throw error;
    }
  },

  clear: async () => {
    set({
      isUpdating: true,
      error: null,
    });

    try {
      const cart = await clearCartApi();

      set({
        cart,
        isUpdating: false,
      });
    } catch (error) {
      set({
        isUpdating: false,
        error:
          error instanceof Error
            ? error.message
            : "خطا در خالی کردن سبد خرید.",
      });

      throw error;
    }
  },

  reset: () => {
    set({
      cart: null,
      isLoading: false,
      isUpdating: false,
      error: null,
    });
  },
}));

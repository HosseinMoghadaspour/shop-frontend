import { create } from "zustand";

import {
  createOrder,
  type CreateOrderRequest,
  type CreateOrderResponse,
} from "@/services/orders.api";

interface OrderState {
  order: CreateOrderResponse | null;
  isSubmitting: boolean;
  error: string | null;

  submitOrder: (
    data: CreateOrderRequest,
  ) => Promise<CreateOrderResponse>;

  reset: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  order: null,
  isSubmitting: false,
  error: null,

  submitOrder: async (data) => {
    set({
      isSubmitting: true,
      error: null,
    });

    try {
      const result = await createOrder(data);

      set({
        order: result,
        isSubmitting: false,
        error: null,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ثبت سفارش با خطا مواجه شد.";

      set({
        isSubmitting: false,
        error: message,
      });

      throw error;
    }
  },

  reset: () => {
    set({
      order: null,
      isSubmitting: false,
      error: null,
    });
  },
}));

import { create } from "zustand";

import {
  getCurrentUser,
  logout as logoutApi,
  requestCustomerOtp,
  verifyCustomerOtp,
  requestAdminOtp,
  verifyAdminOtp,
  type AuthSession,
  type AuthUser,
} from "@/services/auth.api";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  error: string | null;

  initialize: () => Promise<void>;

  requestOtp: (
    mobile: string,
  ) => Promise<{
    developmentOtp?: string;
  }>;

  verifyOtp: (
    mobile: string,
    code: string,
  ) => Promise<void>;

  logout: () => Promise<void>;

  clearError: () => void;

  requestAdminOtp: (
  mobile: string,
) => Promise<{ developmentOtp?: string }>;

verifyAdminOtp: (
  mobile: string,
  code: string,
) => Promise<void>;

authKind: "customer" | "admin" | null;

}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,
    session: null,

    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    error: null,

    initialize: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const result =
          await getCurrentUser();

        set({
          user: result.user,
          session: result.session,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          authKind: result.kind,
        });
      } catch {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          authKind: null,
        });
      }
    },

    requestOtp: async (mobile) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const result =
          await requestCustomerOtp(
            mobile,
          );

        set({
          isLoading: false,
        });

        return {
          developmentOtp:
            result.data?.developmentOtp,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "خطا در ارسال کد تأیید.";

        set({
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    verifyOtp: async (
      mobile,
      code,
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const result =
          await verifyCustomerOtp(
            mobile,
            code,
          );

        set({
          user: result.user,
          session: result.session,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          authKind: "customer"
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "کد تأیید نامعتبر است.";

        set({
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    logout: async () => {
      set({
        isLoading: true,
      });

      try {
        await logoutApi();
      } finally {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          authKind: null,
        });
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },
    requestAdminOtp: async (mobile) => {
  set({ isLoading: true, error: null });

  try {
    const result = await requestAdminOtp(mobile);

    set({ isLoading: false });

    return {
      developmentOtp: result.data?.developmentOtp,
    };
  } catch (error) {
    set({
      isLoading: false,
      error: error instanceof Error
        ? error.message
        : "خطا در ارسال کد ورود مدیر.",
    });

    throw error;
  }
},

verifyAdminOtp: async (mobile, code) => {
  set({ isLoading: true, error: null });

  try {
    const result = await verifyAdminOtp(mobile, code);

    if (result.session.kind !== "admin") {
      throw new Error("نشست مدیر معتبر نیست.");
    }

  set({
  user: result.user,
  session: result.session,
  authKind: "admin",
  isAuthenticated: true,
  isInitialized: true,
  isLoading: false,
  error: null,
});
  } catch (error) {
    set({
      isLoading: false,
      error: error instanceof Error
        ? error.message
        : "خطا در ورود مدیر.",
    });

    throw error;
  }
},
authKind: null,
  }));

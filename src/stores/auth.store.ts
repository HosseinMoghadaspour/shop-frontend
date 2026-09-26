import { create } from "zustand";

import {
  getCurrentUser,
  logout as logoutApi,
  requestCustomerOtp,
  verifyCustomerOtp,
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
        });
      } catch {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
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
        });
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  }));

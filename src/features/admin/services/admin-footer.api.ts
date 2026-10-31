
import { apiClient } from "@/services/api/client";

export interface AdminFooter {
  RowID: number;

  AboutText: string | null;
  Address: string | null;

  Phone1: string | null;
  Phone2: string | null;

  InstagramHandle: string | null;
  TelegramHandle: string | null;
  WhatsAppHandle: string | null;
  EtaHandle: string | null;
  Rubikahandle: string | null;

  LogoImageUrl: string | null;
  EnamadImageUrl: string | null;
  ReziImageUrl: string | null;
  SamandehiUrl: string | null;
  DragahUrl: string | null;

  LinkContactUs: string | null;
  LinkAboutUs: string | null;
  LinkFAQ: string | null;
  LinkArticles: string | null;

  Copyright: string | null;
  SiteIcon: string | null;
  SiteName: string | null;
}

export type AdminFooterForm = Omit<AdminFooter, "RowID">;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
}

export async function getAdminFooter(): Promise<AdminFooter | null> {
  try {
    const response = await apiClient.get<ApiResponse<AdminFooter | null>>(
      "/admin/footer",
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "دریافت اطلاعات فوتر ناموفق بود."),
    );
  }
}

export async function updateAdminFooter(data: AdminFooterForm) {
  try {
    const response = await apiClient.patch<ApiResponse<AdminFooter>>(
      "/admin/footer",
      data,
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "ذخیره اطلاعات فوتر ناموفق بود."),
    );
  }
}

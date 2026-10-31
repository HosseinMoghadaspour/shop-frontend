import { apiClient } from "@/services/api/client";

export type FooterImageField =
  | "LogoImageUrl"
  | "SiteIcon"
  | "EnamadImageUrl"
  | "ReziImageUrl";

interface FooterImageResponse {
  success: boolean;
  message?: string;
  data: {
    RowID: number;
    field: FooterImageField;
    url: string | null;
  };
}

export async function uploadFooterImage(
  field: FooterImageField,
  file: File,
): Promise<FooterImageResponse["data"]> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<FooterImageResponse>(
    `/admin/footer/images/${field}`,
    formData,
  );

  return response.data.data;
}

export async function deleteFooterImage(
  field: FooterImageField,
): Promise<void> {
  await apiClient.delete(`/admin/footer/images/${field}`);
}

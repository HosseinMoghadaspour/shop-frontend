import { apiClient } from "./api/client";

export interface Footer {
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

export interface FooterApiResponse {
  success: boolean;
  data: Footer;
}

export async function getFooter(): Promise<Footer> {
  const res = await apiClient.get<FooterApiResponse>("/footer");

  return res.data.data;
}

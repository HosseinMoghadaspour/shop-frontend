import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Globe,
  Image,
  Loader2,
  RefreshCw,
  Save,
  Share2,
  ShieldCheck,
  Store,
  MapPin,
  Phone,
  Link2,
  ImagePlus,
  Trash2,
  Upload,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiAssetUrl } from "@/lib/api-url";
import {
  uploadFooterImage,
  deleteFooterImage,
  type FooterImageField,
} from "@/features/admin/services/admin-footer-image.api";
import {
  getAdminFooter,
  updateAdminFooter,
  type AdminFooter,
  type AdminFooterForm,
} from "@/features/admin/services/admin-footer.api";

const emptyFooter: AdminFooterForm = {
  AboutText: "",
  Address: "",
  Phone1: "",
  Phone2: "",

  InstagramHandle: "",
  TelegramHandle: "",
  WhatsAppHandle: "",
  EtaHandle: "",
  Rubikahandle: "",

  LogoImageUrl: "",
  EnamadImageUrl: "",
  ReziImageUrl: "",
  SamandehiUrl: "",
  DragahUrl: "",

  LinkContactUs: "",
  LinkAboutUs: "",
  LinkFAQ: "",
  LinkArticles: "",

  Copyright: "",
  SiteIcon: "",
  SiteName: "",
};

type FieldKey = keyof AdminFooterForm;

function toFormData(footer: AdminFooter | null): AdminFooterForm {
  if (!footer) return { ...emptyFooter };

  return {
    AboutText: footer.AboutText ?? "",
    Address: footer.Address ?? "",
    Phone1: footer.Phone1 ?? "",
    Phone2: footer.Phone2 ?? "",

    InstagramHandle: footer.InstagramHandle ?? "",
    TelegramHandle: footer.TelegramHandle ?? "",
    WhatsAppHandle: footer.WhatsAppHandle ?? "",
    EtaHandle: footer.EtaHandle ?? "",
    Rubikahandle: footer.Rubikahandle ?? "",

    LogoImageUrl: footer.LogoImageUrl ?? "",
    EnamadImageUrl: footer.EnamadImageUrl ?? "",
    ReziImageUrl: footer.ReziImageUrl ?? "",
    SamandehiUrl: footer.SamandehiUrl ?? "",
    DragahUrl: footer.DragahUrl ?? "",

    LinkContactUs: footer.LinkContactUs ?? "",
    LinkAboutUs: footer.LinkAboutUs ?? "",
    LinkFAQ: footer.LinkFAQ ?? "",
    LinkArticles: footer.LinkArticles ?? "",

    Copyright: footer.Copyright ?? "",
    SiteIcon: footer.SiteIcon ?? "",
    SiteName: footer.SiteName ?? "",
  };
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return error instanceof Error
    ? error.message
    : "عملیات ناموفق بود. دوباره تلاش کنید.";
}
const footerImageFields: FooterImageField[] = [
  "LogoImageUrl",
  "SiteIcon",
  "EnamadImageUrl",
  "ReziImageUrl",
];

function isFooterImageField(key: FieldKey): key is FooterImageField {
  return footerImageFields.includes(key as FooterImageField);
}

function FooterImageUploader({
  field,
  label,
  value,
  onChange,
}: {
  field: FooterImageField;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setError(null);

    if (file.size > 8 * 1024 * 1024) {
      setError("حجم تصویر نباید بیشتر از ۸ مگابایت باشد.");
      input.value = "";
      return;
    }

    if (
      file.type &&
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      )
    ) {
      setError("فرمت تصویر باید JPEG، PNG، WebP یا AVIF باشد.");
      input.value = "";
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFooterImage(field, file);

      onChange(result.url ?? "");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function handleDelete() {
    if (!value || uploading) return;

    setUploading(true);
    setError(null);

    try {
      await deleteFooterImage(field);
      onChange("");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-semibold">{label}</Label>

        {value && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">
            تصویر بارگذاری شده
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white">
          {value ? (
            <img
              src={getApiAssetUrl(value)}
              alt={label}
              className="size-full object-contain p-2"
            />
          ) : (
            <ImagePlus className="size-9 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}

            {uploading
              ? "در حال بارگذاری..."
              : value
                ? "جایگزینی تصویر"
                : "انتخاب و آپلود تصویر"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={uploading}
              onChange={(event) => void handleUpload(event)}
            />
          </label>

          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => void handleDelete()}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="ml-2 size-4" />
              حذف تصویر
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        فرمت‌های مجاز: JPEG، PNG، WebP و AVIF؛ حداکثر حجم ۸ مگابایت
      </p>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

const fieldGroups: {
  title: string;
  description: string;
  icon: typeof Store;
  fields: {
    key: FieldKey;
    label: string;
    placeholder: string;
    multiline?: boolean;
    direction?: "ltr" | "rtl";
  }[];
}[] = [
  {
    title: "اطلاعات اصلی سایت",
    description: "نام فروشگاه، توضیحات معرفی و متن کپی‌رایت",
    icon: Store,
    fields: [
      {
        key: "SiteName",
        label: "نام سایت",
        placeholder: "مثلاً آدینا رایانه",
      },
      {
        key: "AboutText",
        label: "متن معرفی فروشگاه",
        placeholder: "توضیح کوتاهی درباره فروشگاه بنویسید...",
        multiline: true,
      },
      {
        key: "Copyright",
        label: "متن کپی‌رایت",
        placeholder: "تمام حقوق این وب‌سایت محفوظ است.",
        multiline: true,
      },
    ],
  },
  {
    title: "اطلاعات تماس",
    description: "شماره تلفن و نشانی فروشگاه",
    icon: Phone,
    fields: [
      {
        key: "Phone1",
        label: "شماره تماس اول",
        placeholder: "09120000000",
        direction: "ltr",
      },
      {
        key: "Phone2",
        label: "شماره تماس دوم",
        placeholder: "06100000000",
        direction: "ltr",
      },
      {
        key: "Address",
        label: "آدرس فروشگاه",
        placeholder: "نشانی کامل فروشگاه...",
        multiline: true,
      },
    ],
  },
  {
    title: "شبکه‌های اجتماعی",
    description: "شناسه یا لینک شبکه‌های اجتماعی فروشگاه",
    icon: Share2,
    fields: [
      {
        key: "InstagramHandle",
        label: "اینستاگرام",
        placeholder: "https://instagram.com/...",
        direction: "ltr",
      },
      {
        key: "TelegramHandle",
        label: "تلگرام",
        placeholder: "https://t.me/...",
        direction: "ltr",
      },
      {
        key: "WhatsAppHandle",
        label: "واتساپ",
        placeholder: "https://wa.me/...",
        direction: "ltr",
      },
      {
        key: "EtaHandle",
        label: "ایتا",
        placeholder: "شناسه یا لینک ایتا",
        direction: "ltr",
      },
      {
        key: "Rubikahandle",
        label: "روبیکا",
        placeholder: "شناسه یا لینک روبیکا",
        direction: "ltr",
      },
    ],
  },
  {
    title: "لینک‌های صفحات سایت",
    description: "آدرس صفحات داخلی یا خارجی فروشگاه",
    icon: Link2,
    fields: [
      {
        key: "LinkAboutUs",
        label: "صفحه درباره ما",
        placeholder: "/about-us",
        direction: "ltr",
      },
      {
        key: "LinkContactUs",
        label: "صفحه تماس با ما",
        placeholder: "/contact-us",
        direction: "ltr",
      },
      {
        key: "LinkFAQ",
        label: "صفحه سوالات متداول",
        placeholder: "/faq",
        direction: "ltr",
      },
      {
        key: "LinkArticles",
        label: "صفحه مقالات",
        placeholder: "/articles",
        direction: "ltr",
      },
    ],
  },
  {
    title: "نمادها و لینک‌های اعتبارسنجی",
    description: "آدرس نمادهای اعتماد و صفحات استعلام",
    icon: ShieldCheck,
    fields: [
      {
        key: "SamandehiUrl",
        label: "آدرس صفحه استعلام ساماندهی",
        placeholder: "https://...",
        direction: "ltr",
      },
      {
        key: "DragahUrl",
        label: "آدرس وب‌سایت یا درگاه",
        placeholder: "https://...",
        direction: "ltr",
      },
      {
        key: "EnamadImageUrl",
        label: "آدرس تصویر اینماد",
        placeholder: "/uploads/...",
        direction: "ltr",
      },
      {
        key: "ReziImageUrl",
        label: "آدرس تصویر نماد رضایت",
        placeholder: "/uploads/...",
        direction: "ltr",
      },
    ],
  },
  {
    title: "لوگو و آیکون سایت",
    description: "آدرس فایل لوگو و آیکون مرورگر",
    icon: Image,
    fields: [
      {
        key: "LogoImageUrl",
        label: "آدرس تصویر لوگو",
        placeholder: "/uploads/...",
        direction: "ltr",
      },
      {
        key: "SiteIcon",
        label: "آدرس آیکون سایت (Favicon)",
        placeholder: "/uploads/...",
        direction: "ltr",
      },
    ],
  },
];

export function AdminFooterPage() {
  const [form, setForm] = useState<AdminFooterForm>({
    ...emptyFooter,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadFooter = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const footer = await getAdminFooter();
      setForm(toFormData(footer));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFooter();
  }, [loadFooter]);

  function updateField(key: FieldKey, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await updateAdminFooter(form);
      setNotice("اطلاعات فوتر با موفقیت ذخیره شد.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          در حال دریافت اطلاعات فوتر...
        </div>
      </div>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-56px)] space-y-6 bg-muted/30 px-4 py-6 text-foreground sm:px-6 lg:px-8"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">پنل مدیریت</p>

          <h1 className="mt-1 text-2xl font-extrabold">
            مدیریت اطلاعات سایت و فوتر
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            اطلاعات تماس، شبکه‌های اجتماعی، لینک‌ها و مشخصات نمایش داده‌شده در
            پایین سایت را از این قسمت مدیریت کنید.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadFooter()}
          disabled={loading || saving}
        >
          <RefreshCw className="ml-2 size-4" />
          دریافت مجدد اطلاعات
        </Button>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notice && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-5"
      >
        {fieldGroups.map((group) => {
          const Icon = group.icon;

          return (
            <Card key={group.title} className="overflow-hidden">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-3 text-base">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>

                  <span>{group.title}</span>
                </CardTitle>

                <p className="pr-[52px] text-xs leading-6 text-muted-foreground">
                  {group.description}
                </p>
              </CardHeader>

              <CardContent className="grid gap-5 bg-white p-4 sm:grid-cols-2 sm:p-6">
                {group.fields.map((field) => {
                  if (isFooterImageField(field.key)) {
                    return (
                      <div key={field.key} className="sm:col-span-2">
                        <FooterImageUploader
                          field={field.key}
                          label={field.label}
                          value={form[field.key] ?? ""}
                          onChange={(value) => updateField(field.key, value)}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={field.key}
                      className={
                        field.multiline
                          ? "space-y-2 sm:col-span-2"
                          : "space-y-2"
                      }
                    >
                      <Label
                        htmlFor={field.key}
                        className="text-sm font-semibold"
                      >
                        {field.label}
                      </Label>

                      {field.multiline ? (
                        <Textarea
                          id={field.key}
                          value={form[field.key] ?? ""}
                          onChange={(event) =>
                            updateField(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          rows={4}
                          className="resize-y leading-7"
                        />
                      ) : (
                        <Input
                          id={field.key}
                          value={form[field.key] ?? ""}
                          onChange={(event) =>
                            updateField(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          dir={field.direction ?? "rtl"}
                          className={
                            field.direction === "ltr"
                              ? "text-left"
                              : "text-right"
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        <div className="sticky bottom-3 z-20 flex justify-end rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="min-w-36"
          >
            {saving ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : (
              <Save className="ml-2 size-4" />
            )}

            {saving ? "در حال ذخیره..." : "ذخیره تمام تغییرات"}
          </Button>
        </div>
      </form>
    </main>
  );
}

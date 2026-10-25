import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminSlider,
  deleteAdminSlider,
  getAdminSliders,
  updateAdminSlider,
  uploadAdminSliderImage,
  type AdminSlider,
} from "@/features/admin/services/admin-sliders.api";

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ?? "";

function sliderImageUrl(url: string | null) {
  if (!url) return "";
  try {
    return new URL(url, apiBase || window.location.origin).toString();
  } catch {
    return url;
  }
}

function getError(error: unknown) {
  return error instanceof Error ? error.message : "عملیات ناموفق بود.";
}

function SliderEditor({
  slider,
  busy,
  onBusy,
  onChanged,
  onError,
  onNotice,
}: {
  slider: AdminSlider;
  busy: boolean;
  onBusy: (id: string | null) => void;
  onChanged: () => Promise<void>;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
}) {
  const [title, setTitle] = useState(slider.DescImage ?? "");
  const [description, setDescription] = useState(slider.Description ?? "");
  const [buttonText, setButtonText] = useState(slider.DescBut ?? "");
  const [targetUrl, setTargetUrl] = useState(slider.UrlSend ?? "");
  const [active, setActive] = useState(Boolean(slider.Status));
  const [file, setFile] = useState<File | null>(null);

  async function save() {
    onBusy(slider.RowID);
    onError(null);
    onNotice(null);
    try {
      await updateAdminSlider(slider.RowID, {
        DescImage: title,
        Description: description,
        DescBut: buttonText,
        UrlSend: targetUrl,
        Status: active,
      });
      if (file) await uploadAdminSliderImage(slider.RowID, file);
      setFile(null);
      onNotice("تغییرات اسلایدر ذخیره شد.");
      await onChanged();
    } catch (error) {
      onError(getError(error));
    } finally {
      onBusy(null);
    }
  }

  async function remove() {
    if (!window.confirm("این اسلایدر و تصویر بارگذاری‌شده‌اش حذف شود؟")) return;
    onBusy(slider.RowID);
    onError(null);
    onNotice(null);
    try {
      await deleteAdminSlider(slider.RowID);
      onNotice("اسلایدر حذف شد.");
      await onChanged();
    } catch (error) {
      onError(getError(error));
    } finally {
      onBusy(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">اسلایدر شماره {slider.RowID}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">نوع: اسلایدر صفحه اصلی</p>
        </div>
        <Badge variant={active ? "default" : "secondary"}>{active ? "فعال" : "غیرفعال"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <div className="aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
              {sliderImageUrl(slider.UrlImage) ? (
                <img src={sliderImageUrl(slider.UrlImage)} alt={title || "تصویر اسلایدر"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ImagePlus className="size-8" />
                  تصویری بارگذاری نشده است
                </div>
              )}
            </div>
            <label className="block text-sm font-medium">جایگزینی تصویر (JPEG، PNG، WebP یا AVIF؛ حداکثر ۸ مگابایت)</label>
            <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            {file && <p className="text-xs text-muted-foreground">فایل انتخاب‌شده: {file.name}</p>}
          </div>
          <div className="space-y-3">
            <label className="block space-y-1.5 text-sm font-medium">
              تیتر روی تصویر
              <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={2000} placeholder="مثلاً پیشنهادهای ویژه" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              توضیحات
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="متن کوتاه روی بنر" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm font-medium">
                متن دکمه
                <Input value={buttonText} onChange={(event) => setButtonText(event.target.value)} maxLength={100} placeholder="مشاهده محصولات" />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                لینک دکمه
                <Input value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="/products" />
              </label>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-semibold">نمایش در صفحه اصلی</p>
                <p className="mt-1 text-xs text-muted-foreground">برای فعال‌کردن، ابتدا باید تصویر وجود داشته باشد.</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} aria-label="وضعیت نمایش اسلایدر" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="destructive" onClick={() => void remove()} disabled={busy}>
            <Trash2 className="ml-2 size-4" /> حذف اسلایدر
          </Button>
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? <Loader2 className="ml-2 size-4 animate-spin" /> : file ? <Upload className="ml-2 size-4" /> : <Save className="ml-2 size-4" />}
            {file ? "ذخیره و بارگذاری تصویر" : "ذخیره تغییرات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminSlidersPage() {
  const [sliders, setSliders] = useState<AdminSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  const loadSliders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSliders(await getAdminSliders());
    } catch (error) {
      setError(getError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadSliders(); }, [loadSliders]);

  async function createSlider(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newFile) {
      setError("برای ساخت اسلایدر، تصویر آن را هم انتخاب کن.");
      return;
    }
    if (newFile.size > 8 * 1024 * 1024) {
      setError("حجم تصویر باید حداکثر ۸ مگابایت باشد.");
      return;
    }
    setBusyId("new");
    setError(null);
    setNotice(null);
    try {
      const slider = await createAdminSlider({
        DescImage: title,
        Description: description,
        DescBut: buttonText,
        UrlSend: targetUrl,
      });
      await uploadAdminSliderImage(slider.RowID, newFile);
      setTitle("");
      setDescription("");
      setButtonText("");
      setTargetUrl("");
      setNewFile(null);
      const fileInput = document.getElementById("new-slider-image") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setNotice("اسلایدر ساخته شد و تصویر آن بارگذاری شد. برای نمایش در سایت، وضعیتش را فعال کن.");
      await loadSliders();
    } catch (error) {
      setError(getError(error));
      await loadSliders();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main dir="rtl" className="min-h-[calc(100vh-56px)] space-y-6 bg-muted/30 px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">پنل مدیریت</p>
          <h1 className="mt-1 text-2xl font-extrabold">مدیریت اسلایدرها</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">ساخت بنر، بارگذاری تصویر، ویرایش متن و لینک دکمه و کنترل نمایش در صفحه اصلی.</p>
        </div>
        <Button variant="outline" onClick={() => void loadSliders()} disabled={loading}>
          <RefreshCw className={`ml-2 size-4 ${loading ? "animate-spin" : ""}`} /> بروزرسانی
        </Button>
      </header>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {notice && <Alert role="status" className="border-emerald-200 bg-emerald-50 text-emerald-900"><AlertDescription>{notice}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ImagePlus className="size-5" /> افزودن اسلایدر جدید</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(event) => void createSlider(event)} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="new-slider-image">تصویر اسلایدر (الزامی)</label>
                <Input id="new-slider-image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setNewFile(event.target.files?.[0] ?? null)} />
                <p className="text-xs text-muted-foreground">تصویر به WebP تبدیل و با اندازه مناسب ذخیره می‌شود. حداکثر حجم فایل ۸ مگابایت است.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium">تیتر روی تصویر<Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={2000} placeholder="عنوان بنر" /></label>
                <label className="space-y-1.5 text-sm font-medium">متن دکمه<Input value={buttonText} onChange={(event) => setButtonText(event.target.value)} maxLength={100} placeholder="مشاهده" /></label>
                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">توضیحات<Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="توضیح کوتاه بنر" /></label>
                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">لینک دکمه<Input value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="/products" /></label>
              </div>
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={busyId !== null}>
                {busyId === "new" ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Upload className="ml-2 size-4" />}
                ساخت اسلایدر و بارگذاری تصویر
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">اسلایدرهای ثبت‌شده</h2>
          <Badge variant="secondary">{sliders.length} مورد</Badge>
        </div>
        {loading ? (
          <Card><CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin" /> در حال دریافت اسلایدرها…</CardContent></Card>
        ) : sliders.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center"><ImagePlus className="size-10 text-muted-foreground" /><p className="font-semibold">هنوز اسلایدری ثبت نشده است.</p><p className="text-sm text-muted-foreground">از فرم بالا اولین اسلایدر را بساز.</p></CardContent></Card>
        ) : sliders.map((slider) => (
          <SliderEditor key={slider.RowID} slider={slider} busy={busyId !== null} onBusy={setBusyId} onChanged={loadSliders} onError={setError} onNotice={setNotice} />
        ))}
      </section>
    </main>
  );
}

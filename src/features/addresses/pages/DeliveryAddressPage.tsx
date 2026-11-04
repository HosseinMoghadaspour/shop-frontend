import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationSelector from "@/features/checkout/components/LocationSelector";
import { createMyAddress } from "@/services/addresses.api";
import { setSelectedAddressId } from "@/lib/store-branch";

export function DeliveryAddressPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [form, setForm] = useState({
    deliverToName: "",
    deliverToMobileNumber: "",
    deliverToPhoneNumber: "",
    Adrs: "",
    PostalCode: "",
  });
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!cityId || !form.deliverToName.trim() || !form.deliverToMobileNumber.trim() || !form.Adrs.trim()) {
      setError("لطفاً شهر، نام گیرنده، شماره موبایل و نشانی را تکمیل کنید.");
      return;
    }
    if (!form.PostalCode.trim()) {
      setError("کد پستی را وارد کنید.");
      return;
    }
    setBusy(true);
    try {
      const id = await createMyAddress({
        cityId,
        deliverToName: form.deliverToName.trim(),
        deliverToMobileNumber: form.deliverToMobileNumber.trim(),
        deliverToPhoneNumber: form.deliverToPhoneNumber.trim() || undefined,
        Adrs: form.Adrs.trim(),
        PostalCode: form.PostalCode.trim(),
        latitude: latitude.trim() ? Number(latitude) : null,
        longitude: longitude.trim() ? Number(longitude) : null,
      });
      setSelectedAddressId(id);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت آدرس انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section dir="rtl" className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Card className="overflow-hidden rounded-3xl border-emerald-900/10 shadow-sm">
        <CardHeader className="bg-emerald-50/70">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="size-5 text-emerald-700" />
            ثبت آدرس تحویل
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            برای نمایش شعب فعال شهر و انتخاب نزدیک‌ترین شعبه، ابتدا آدرس تحویل را ثبت کنید.
          </p>
        </CardHeader>
        <CardContent className="p-5 sm:p-7">
          <form onSubmit={submit} className="space-y-5">
            <LocationSelector
              provinceId={provinceId}
              cityId={cityId}
              onProvinceChange={(id) => { setProvinceId(id); setCityId(null); }}
              onCityChange={setCityId}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نام تحویل‌گیرنده</Label>
                <Input value={form.deliverToName} onChange={(e) => update("deliverToName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>شماره موبایل</Label>
                <Input dir="ltr" value={form.deliverToMobileNumber} onChange={(e) => update("deliverToMobileNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>تلفن ثابت (اختیاری)</Label>
                <Input dir="ltr" value={form.deliverToPhoneNumber} onChange={(e) => update("deliverToPhoneNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>کد پستی</Label>
                <Input dir="ltr" value={form.PostalCode} onChange={(e) => update("PostalCode", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>عرض جغرافیایی (اختیاری)</Label>
                <Input dir="ltr" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" />
              </div>
              <div className="space-y-2">
                <Label>طول جغرافیایی (اختیاری)</Label>
                <Input dir="ltr" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">با واردکردن مختصات محل آدرس، نزدیک‌ترین شعبه دقیق‌تر تشخیص داده می‌شود. در غیر این صورت شعبه پیش‌فرض شهر انتخاب می‌شود.</p>
            <div className="rounded-xl border border-dashed border-emerald-700/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">موقعیت روی نقشه</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    برای تشخیص نزدیک‌ترین شعبه، موقعیت این آدرس را ثبت کنید (اختیاری).
                  </p>
                  {coordinates && <p className="mt-1 text-xs text-emerald-700">موقعیت ثبت شد: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</p>}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={locationLoading || !navigator.geolocation}
                  onClick={() => {
                    setLocationLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                        setLocationLoading(false);
                      },
                      () => {
                        setError("دریافت موقعیت انجام نشد. مجوز مکان‌یابی مرورگر را بررسی کنید.");
                        setLocationLoading(false);
                      },
                      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
                    );
                  }}
                >
                  {locationLoading ? "در حال دریافت موقعیت..." : coordinates ? "به‌روزرسانی موقعیت" : "ثبت موقعیت فعلی"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>نشانی کامل</Label>
              <textarea
                value={form.Adrs}
                onChange={(e) => update("Adrs", e.target.value)}
                rows={4}
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              <Save className="ml-2 size-4" />
              {busy ? "در حال ثبت..." : "ثبت آدرس و ادامه"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

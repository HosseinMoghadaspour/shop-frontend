import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ClipboardList, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { getMyAddresses, type DeliveryAddress } from "@/services/addresses.api";
import { getMyProfile, updateMyProfile, type CustomerProfile } from "@/services/profile.api";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: "", phoneNumber: "", email: "", nationalCode: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getMyProfile().then((result) => {
      if (!mounted) return;
      setProfile(result);
      setProfileForm({
        fullName: result.fullName || "",
        phoneNumber: result.phoneNumber || "",
        email: result.email || "",
        nationalCode: result.nationalCode || "",
      });
    }).catch((error) => {
      if (mounted) setProfileError(error instanceof Error ? error.message : "دریافت اطلاعات حساب انجام نشد.");
    });
    return () => { mounted = false; };
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      const result = await updateMyProfile(profileForm);
      setProfile(result);
      setProfileMessage("اطلاعات حساب با موفقیت ذخیره شد.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "ذخیره اطلاعات حساب انجام نشد.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadAddresses() {
      try {
        setIsLoadingAddresses(true);
        setAddressError(null);

        const result = await getMyAddresses();

        if (!mounted) return;
        setAddresses(result);
      } catch (error) {
        if (!mounted) return;

        setAddressError(
          error instanceof Error
            ? error.message
            : "دریافت آدرس‌ها با خطا مواجه شد.",
        );
      } finally {
        if (mounted) {
          setIsLoadingAddresses(false);
        }
      }
    }

    void loadAddresses();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          حساب کاربری
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          مدیریت اطلاعات حساب و آدرس‌های شما
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-blue-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              اطلاعات حساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-full-name">نام و نام خانوادگی</Label>
              <Input id="account-full-name" value={profileForm.fullName}
                onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="نام و نام خانوادگی" />
            </div>
            <div className="space-y-2">
              <Label>شماره موبایل تأییدشده</Label>
              <Input value={profile?.mobile || user?.MobileNumber || user?.MobileForSMS || user?.Mobile || ""} readOnly dir="ltr" />
              <p className="text-xs text-muted-foreground">برای تغییر شماره موبایل، باید دوباره آن را تأیید کنید.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-phone">تلفن ثابت (اختیاری)</Label>
              <Input id="account-phone" value={profileForm.phoneNumber}
                onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                dir="ltr" placeholder="021..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">ایمیل (اختیاری)</Label>
              <Input id="account-email" type="email" value={profileForm.email}
                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                dir="ltr" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-national-code">کد ملی (اختیاری)</Label>
              <Input id="account-national-code" value={profileForm.nationalCode}
                onChange={(event) => setProfileForm((current) => ({ ...current, nationalCode: event.target.value }))}
                dir="ltr" maxLength={10} />
            </div>
            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            {profileMessage && <p className="text-sm text-blue-700">{profileMessage}</p>}
            <Button className="w-full" onClick={() => void handleSaveProfile()} disabled={isSavingProfile || !profileForm.fullName.trim()}>
              {isSavingProfile ? "در حال ذخیره..." : "ذخیره اطلاعات حساب"}
            </Button>
            <Link to="/delivery-address" className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition hover:bg-muted">
              <MapPin className="h-4 w-4" />
              آدرس‌های من
            </Link>
            <Link to="/orders" className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition hover:bg-muted">
              <ClipboardList className="h-4 w-4" />
              سفارش‌های من
            </Link>
          </CardContent>
        </Card>
        <Card className="border border-blue-950/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              آدرس‌های من
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoadingAddresses && (
              <div
                className="space-y-3 rounded-lg border p-5"
                aria-label="در حال دریافت آدرس‌ها"
              >
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}

            {!isLoadingAddresses && addressError && (
              <Alert variant="destructive">
                <AlertDescription>{addressError}</AlertDescription>
              </Alert>
            )}

            {!isLoadingAddresses && !addressError && addresses.length === 0 && (
              <div className="rounded-lg border p-6 text-center">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="font-medium">هنوز آدرسی ثبت نشده است.</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  هنگام ثبت سفارش می‌توانید آدرس تحویل را وارد کنید.
                </p>
              </div>
            )}

            {!isLoadingAddresses && !addressError && addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="font-medium">
                        <span className="text-muted-foreground">
                          نام گیرنده:
                        </span>{" "}
                        {address.recipient.name || "تحویل گیرنده"}
                      </div>

                      {address.isActive && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                        >
                          فعال
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">محدوده:</span>{" "}
                        {address.province?.name || "-"}
                        {" / "}
                        {address.county?.name || "-"}
                        {" / "}
                        {address.city?.name || "-"}
                      </div>

                      <div>
                        <span className="text-muted-foreground">آدرس:</span>{" "}
                        {address.address || "-"}
                      </div>

                      <div>
                        <span className="text-muted-foreground">کد پستی:</span>{" "}
                        {address.postalCode || "-"}
                      </div>

                      <div>
                        <span className="text-muted-foreground">موبایل:</span>{" "}
                        <span dir="ltr">{address.recipient.mobile || "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

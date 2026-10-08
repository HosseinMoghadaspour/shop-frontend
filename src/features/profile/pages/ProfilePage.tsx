import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ClipboardList, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { getMyAddresses, type DeliveryAddress } from "@/services/addresses.api";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

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

  const userName = user?.RowName?.trim() || "کاربر";

  const mobile = user?.MobileNumber || user?.MobileForSMS || "-";

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-6">
        <span className="text-xs font-bold text-primary">حساب من</span>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">حساب کاربری</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          مدیریت اطلاعات حساب و آدرس‌های شما
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-emerald-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              اطلاعات حساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">نام</p>
              <p className="mt-1 font-medium">{userName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">شماره موبایل</p>
              <p className="mt-1 font-medium" dir="ltr">
                {mobile}
              </p>
            </div>
            <Link
              to="/orders"
              className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition hover:bg-muted"
            >
              <ClipboardList className="h-4 w-4" />
              سفارش‌های من
            </Link>
          </CardContent>
        </Card>
        <Card className="border border-emerald-950/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              آدرس‌های من
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoadingAddresses && (
              <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                در حال دریافت آدرس‌ها...
              </div>
            )}

            {!isLoadingAddresses && addressError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
                {addressError}
              </div>
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
                        <span className="text-muted-foreground">نام گیرنده:</span>{" "}
                        {address.recipient.name || "تحویل گیرنده"}
                        
                      </div>

                      {address.isActive && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                          فعال
                        </span>
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

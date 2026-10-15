
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");

  const requestAdminOtp = useAuthStore(
    (state) => state.requestAdminOtp,
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!mobile.trim()) return;

    try {
      const result = await requestAdminOtp(mobile.trim());

      const params = new URLSearchParams({
        mobile: mobile.trim(),
      });

      // فقط برای محیط توسعه؛ در محیط عملیاتی کد را در URL قرار نده.
      if (import.meta.env.DEV && result.developmentOtp) {
        params.set("developmentOtp", result.developmentOtp);
      }

      navigate(`/admin/verify?${params.toString()}`);
    } catch {
      // خطا در استور ثبت می‌شود.
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center">
        <Card className="w-full rounded-3xl border-0 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-4 px-6 pt-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="size-7" />
            </div>

            <div>
              <CardTitle className="text-2xl font-extrabold">
                پنل مدیریت فروشگاه
              </CardTitle>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                برای ورود، شماره موبایل مدیر را وارد کنید.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="admin-mobile" className="text-sm font-medium">
                  شماره موبایل مدیر
                </label>

                <Input
                  id="admin-mobile"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder="09121234567"
                  className="h-12 rounded-xl"
                  value={mobile}
                  onChange={(event) => {
                    setMobile(event.target.value);
                    clearError();
                  }}
                  required
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl"
                disabled={isLoading || !mobile.trim()}
              >
                {isLoading ? "در حال ارسال کد..." : "دریافت کد ورود"}
              </Button>

              <p className="text-center text-xs leading-6 text-muted-foreground">
                ورود فقط برای شماره‌های دارای دسترسی مدیریت امکان‌پذیر است.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

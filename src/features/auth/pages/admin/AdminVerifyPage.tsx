import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export function AdminVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mobile = searchParams.get("mobile") ?? "";
  const developmentOtp = searchParams.get("developmentOtp") ?? "";

  const [code, setCode] = useState("");

  const verifyAdminOtp = useAuthStore((state) => state.verifyAdminOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!mobile || !code.trim()) return;

    try {
      await verifyAdminOtp(mobile, code.trim());
      navigate("/admin/products", { replace: true });
    } catch {
      // خطا در استور ثبت می‌شود.
    }
  }

  if (!mobile) {
    return (
      <main dir="rtl" className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardContent className="space-y-4 p-6">
            <p>شماره موبایل موجود نیست. لطفاً دوباره وارد شوید.</p>
            <a href="/admin/login">بازگشت به ورود مدیر</a>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center">
        <Card className="w-full rounded-3xl border-0 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-3 px-6 pt-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="size-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold">
              تأیید ورود مدیر
            </CardTitle>
            <p className="text-sm leading-7 text-muted-foreground">
              کد ارسال‌شده برای شماره {mobile} را وارد کنید.
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                aria-label="کد تأیید"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={6}
                placeholder="------"
                className="h-14 rounded-xl text-center text-xl tracking-[0.5em]"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  clearError();
                }}
                required
              />

              {import.meta.env.DEV && developmentOtp && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  کد توسعه: <b dir="ltr">{developmentOtp}</b>
                </p>
              )}

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "در حال بررسی..." : "تأیید و ورود به پنل"}
              </Button>

              <Link
                to="/admin/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowRight className="size-4" />
                تغییر شماره موبایل
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

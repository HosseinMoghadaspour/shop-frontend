
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660),
    )
    .replace(/\D/g, "")
    .slice(0, 6);
}

export function AdminVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mobile = searchParams.get("mobile")?.trim() ?? "";

  const [code, setCode] = useState("");

  const verifyAdminOtp = useAuthStore(
    (state) => state.verifyAdminOtp,
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mobile || code.length !== 6 || isLoading) return;

    clearError();

    try {
      await verifyAdminOtp(mobile, code);

      navigate("/admin/products", { replace: true });
    } catch {
      // پیام خطا از طریق auth.store نمایش داده می‌شود.
    }
  }

  if (!mobile) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12"
      >
        <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl shadow-slate-900/5">
          <CardContent className="space-y-4 p-6">
            <p className="font-semibold">
              شماره موبایل موجود نیست.
            </p>

            <p className="text-sm leading-7 text-muted-foreground">
              لطفاً برای ورود به پنل مدیریت، شماره موبایل خود را دوباره وارد کنید.
            </p>

            <Button className="w-full rounded-xl" onClick={() => {navigate("/admin/login" ,{ replace: true })}}>
                بازگشت به ورود مدیر
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-12"
    >
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
              کد ارسال‌شده برای شماره{" "}
              <span dir="ltr" className="inline-block font-medium">
                {mobile}
              </span>{" "}
              را وارد کنید.
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="admin-otp"
                  className="text-sm font-medium"
                >
                  کد تأیید
                </label>

                <Input
                  id="admin-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  dir="ltr"
                  maxLength={6}
                  placeholder="------"
                  className="h-14 rounded-xl text-center text-xl tracking-[0.5em]"
                  value={code}
                  onChange={(event) => {
                    setCode(normalizeDigits(event.target.value));
                    clearError();
                  }}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="text-sm leading-6 text-destructive"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading
                  ? "در حال بررسی..."
                  : "تأیید و ورود به پنل"}
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

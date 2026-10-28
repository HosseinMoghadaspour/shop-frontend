import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const requestAdminOtp = useAuthStore((state) => state.requestAdminOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!mobile.trim() || redirecting) return;

    clearError();

    try {
      const result = await requestAdminOtp(mobile.trim());

      const params = new URLSearchParams({
        mobile: mobile.trim(),
      });

      // فقط در محیط توسعه
      if (import.meta.env.DEV && result.developmentOtp) {
        params.set("developmentOtp", result.developmentOtp);
      }

      navigate(`/admin/verify?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";

      if (
        message.includes("شما مدیر نیستید") ||
        message.includes("اجازه ورود به پنل مدیریت")
      ) {
        setRedirecting(true);

        window.setTimeout(() => {
          navigate("/", { replace: true });
        }, 2500);
      }
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center">
        <Card className="w-full rounded-3xl border-0 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-4 px-6 pt-8">

            <div>
              <CardTitle className="text-2xl font-extrabold text-center mb-10">
                پنل مدیریت فروشگاه
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-mobile" className="text-sm font-medium leading-6 text-muted-foreground">
                  شماره موبایل مدیر
                </Label>

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
              {redirecting && (
                <p role="alert" className="text-sm text-destructive">
                  شما مدیر نیستید. در حال انتقال به صفحه اصلی...
                </p>
              )}
              <Button
                type="submit"
                className="h-12 w-full rounded-xl"
                disabled={isLoading || !mobile.trim() || redirecting}
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

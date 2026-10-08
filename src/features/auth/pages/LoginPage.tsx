import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShoppingBag } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";

export function LoginPage() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const [mobile, setMobile] =
    useState("");

  const requestOtp =
    useAuthStore(
      (state) => state.requestOtp,
    );

  const isLoading =
    useAuthStore(
      (state) => state.isLoading,
    );

  const error =
    useAuthStore(
      (state) => state.error,
    );

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!mobile.trim()) {
      return;
    }

    try {
      const result =
        await requestOtp(
          mobile.trim(),
        );

      const returnTo =
        searchParams.get(
          "returnTo",
        );

      const params =
        new URLSearchParams();

      params.set(
        "mobile",
        mobile.trim(),
      );

      if (returnTo) {
        params.set(
          "returnTo",
          returnTo,
        );
      }

      if (result.developmentOtp) {
        params.set(
          "developmentOtp",
          result.developmentOtp,
        );
      }

      navigate(
        `/auth/verify?${params.toString()}`,
      );
    } catch {
      // error داخل store قرار گرفته است.
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full border border-emerald-950/5 shadow-xl shadow-emerald-950/5">
        <CardHeader className="px-6 pt-7">
          <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <ShoppingBag className="size-6" />
          </span>
          <CardTitle className="text-xl font-extrabold">به نوا مارکت خوش آمدید</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            برای ادامه خرید، شماره موبایلتان را وارد کنید.
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-7">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="mobile"
                className="text-sm font-medium"
              >
                شماره موبایل
              </label>

              <Input
                id="mobile"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                className="h-12 rounded-xl bg-muted/50"
                placeholder="09121234567"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value,
                  )
                }
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                !mobile.trim()
              }
            >
              {isLoading
                ? "در حال ارسال..."
                : "دریافت کد تأیید"}
            </Button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              اطلاعات شما نزد ما محفوظ است.
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

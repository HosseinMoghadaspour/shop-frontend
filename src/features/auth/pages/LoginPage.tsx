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
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            ورود به حساب کاربری
          </CardTitle>
        </CardHeader>

        <CardContent>
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
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

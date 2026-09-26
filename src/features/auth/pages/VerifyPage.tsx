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

export function VerifyPage() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const mobile =
    searchParams.get("mobile") ?? "";

  const returnTo =
    searchParams.get(
      "returnTo",
    ) ?? "/";


  const [code, setCode] =
    useState("");

  const verifyOtp =
    useAuthStore(
      (state) => state.verifyOtp,
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

    if (
      !mobile ||
      !code.trim()
    ) {
      return;
    }

    try {
      await verifyOtp(
        mobile,
        code.trim(),
      );

      navigate(
        returnTo,
        {
          replace: true,
        },
      );
    } catch {
      // error داخل store
    }
  }

  if (!mobile) {
    navigate(
      "/auth/login",
      {
        replace: true,
      },
    );

    return null;
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            تأیید شماره موبایل
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <p className="text-sm text-muted-foreground">
              کد تأیید ارسال‌شده به{" "}
              <span className="font-medium text-foreground">
                {mobile}
              </span>{" "}
              را وارد کنید.
            </p>

            <Input
              type="text"
              inputMode="numeric"
              dir="ltr"
              maxLength={6}
              placeholder="------"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
            />

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
                code.length !== 6
              }
            >
              {isLoading
                ? "در حال بررسی..."
                : "تأیید و ورود"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

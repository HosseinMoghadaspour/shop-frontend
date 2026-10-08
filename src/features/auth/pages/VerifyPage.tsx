import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

import {
  clearPendingCartAction,
  getPendingCartAction,
} from "@/features/cart/utils/pending-cart";

function getSafeReturnTo(value: string | null): string {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function VerifyPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const mobile = searchParams.get("mobile") ?? "";

  const returnTo = getSafeReturnTo(
    searchParams.get("returnTo"),
  );

  const [code, setCode] = useState("");

  const [cartActionError, setCartActionError] =
    useState<string | null>(null);

  const verifyOtp = useAuthStore(
    (state) => state.verifyOtp,
  );

  const addItem = useCartStore(
    (state) => state.addItem,
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );

  const error = useAuthStore(
    (state) => state.error,
  );

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!mobile || !code.trim()) {
      return;
    }

    setCartActionError(null);

    try {
      await verifyOtp(
        mobile,
        code.trim(),
      );

      const pendingCartAction =
        getPendingCartAction();

      if (pendingCartAction) {
        try {
          await addItem(
            pendingCartAction.goodId,
            pendingCartAction.quantity,
          );

          clearPendingCartAction();
        } catch {
          setCartActionError(
            "ورود با موفقیت انجام شد، اما افزودن محصول به سبد خرید انجام نشد.",
          );

          navigate("/cart", {
            replace: true,
          });

          return;
        }
      }

      navigate(returnTo, {
        replace: true,
      });
    } catch {
      // خطای احراز هویت داخل Auth Store قرار می‌گیرد.
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full border border-emerald-950/5 shadow-xl shadow-emerald-950/5">
        <CardHeader className="px-6 pt-7">
          <CardTitle className="text-xl font-extrabold">تأیید شماره موبایل</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">یک قدم تا ورود امن به حساب کاربری</p>
        </CardHeader>

        <CardContent className="px-6 pb-7">
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
              className="h-14 rounded-xl bg-muted/50 text-center text-xl tracking-[0.5em]"
              placeholder="------"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
            />

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            {cartActionError && (
              <p className="text-sm text-destructive">
                {cartActionError}
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
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              کد تأیید فقط برای ورود به حساب شماست.
            </div>
            <button
              type="button"
              onClick={() => navigate("/auth/login", { replace: true })}
              className="mx-auto flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ArrowRight className="size-3.5" />
              ویرایش شماره موبایل
            </button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

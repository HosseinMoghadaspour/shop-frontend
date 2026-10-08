import { CheckCircle2, ShoppingBag, ClipboardList } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const docNo = searchParams.get("docNo");

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <Card className="w-full border border-emerald-950/5 shadow-xl shadow-emerald-950/5">
        <CardHeader className="items-center px-6 pt-9 text-center">
          <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-12 text-emerald-600" />
          </span>

          <CardTitle className="text-2xl">
            سفارش شما با موفقیت ثبت شد
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8 text-center">
          <p className="text-sm leading-7 text-muted-foreground">
            سفارش شما با موفقیت در سیستم ثبت شد.
            اطلاعات سفارش را می‌توانید از همین صفحه مشاهده کنید.
          </p>

          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            {docNo && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  شماره سفارش
                </span>

                <span className="font-semibold">
                  {docNo}
                </span>
              </div>
            )}

            {orderId && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-muted-foreground">
                  شناسه سفارش
                </span>

                <span className="font-semibold">
                  {orderId}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              <ShoppingBag className="ml-2 h-4 w-4" />
              ادامه خرید
            </Link>
            <Link to="/orders" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border bg-white px-4 text-sm font-semibold transition hover:bg-muted">
              <ClipboardList className="ml-2 h-4 w-4" />
              مشاهده سفارش‌ها
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

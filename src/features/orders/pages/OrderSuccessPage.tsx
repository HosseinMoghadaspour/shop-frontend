import {
  CheckCircle2,
  ShoppingBag,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function OrdersuccessPage() {
  const [searchParam] = useSearchParams();

  const orderId = searchParam.get("orderId");
  const docNo = searchParam.get("docNo");
  const hasOrderId =
    orderId && Number.isInteger(Number(orderId)) && Number(orderId) > 0;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />

          <CardTitle className="text-2xl">سفارش شما با موفقیت ثبت شد</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="text-sm leading-7 text-muted-foreground">
            سفارش شما با موفقیت ثبت شد و برای پردازش به سیستم ارسال شد.
          </p>
          <div className="rounded-xl border bg-muted/30 p-5">
            {docNo && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  شماره سفارش
                </span>

                <span className="font-bold">
                  {Number(docNo).toLocaleString("fa-IR")}
                </span>
              </div>
            )}

            {orderId && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  شناسه سفارش
                </span>

                <span className="font-medium">
                  {Number(orderId).toLocaleString("fa-IR")}
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {hasOrderId && (
              <Button
                className="w-full"
                onClick={() => {
                  window.location.href = `/orders/${orderId}`;
                }}
              >
                <ClipboardList className="ml-2 h-4 w-4" />
                مشاهده جزئیات سفارش
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = "/orders";
              }}
            >
              سفارش‌های من
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" className="w-full">
            <Link to="/products">
              <ShoppingBag className="ml-2 h-4 w-4" />
              ادامه خرید
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

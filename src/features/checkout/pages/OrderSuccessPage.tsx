import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
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
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="mb-3 h-16 w-16 text-green-600" />

          <CardTitle className="text-2xl">
            سفارش شما با موفقیت ثبت شد
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
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
            <Button className="flex-1">
              <Link to="/products">
                <ShoppingBag className="ml-2 h-4 w-4" />
                ادامه خرید
              </Link>
            </Button>

            <Button
              variant="outline"
              className="flex-1"
            >
              <Link to="/orders">
                مشاهده سفارش‌ها
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

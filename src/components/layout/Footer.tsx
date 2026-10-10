import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-950/5 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="mb-4 flex w-fit items-center gap-2 text-lg font-extrabold text-primary">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                <img src="/adinaLogo.png" alt="آدینامارکت" className="h-5 w-5" />
              </span>
             آدینامارکت
            </Link>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              خریدی آسوده، انتخابی هوشمندانه. تجربه‌ای تازه از خرید آنلاین با ارسال سریع و پشتیبانی همراه.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-bold">دسترسی سریع</h2>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link to="/" className="transition hover:text-primary">صفحه اصلی</Link>
              <Link to="/products" className="transition hover:text-primary">همه محصولات</Link>
              <Link to="/orders" className="transition hover:text-primary">پیگیری سفارش</Link>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-bold">راهنمای خرید</h2>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link to="/cart" className="transition hover:text-primary">سبد خرید</Link>
              <Link to="/profile" className="transition hover:text-primary">حساب کاربری</Link>
              <Link to="/auth/login" className="transition hover:text-primary">ورود و ثبت‌نام</Link>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-bold">همراه شماییم</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              وضعیت سفارش‌هایت را به‌سادگی از حساب کاربری دنبال کن.
            </p>
            <Link to="/orders" className="mt-3 inline-flex text-sm font-bold text-primary transition hover:underline">
              پیگیری سفارش‌ها
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-right">
          <span>© تمامی حقوق برای آدینامارکت محفوظ است.</span>
          <span>ساخته‌شده برای یک خرید بهتر</span>
        </div>
      </div>
    </footer>
  );
}

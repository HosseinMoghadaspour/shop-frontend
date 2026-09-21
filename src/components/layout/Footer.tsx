import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="mb-3 font-bold">فروشگاه</h2>

            <p className="text-sm text-muted-foreground">
              فروشگاه اینترنتی شما برای خرید آسان و مطمئن.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-bold">دسترسی سریع</h2>

            <div className="flex flex-col gap-2 text-sm">
              <Link
                to="/products"
                className="text-muted-foreground hover:text-foreground"
              >
                محصولات
              </Link>

              <Link
                to="/cart"
                className="text-muted-foreground hover:text-foreground"
              >
                سبد خرید
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold">پشتیبانی</h2>

            <p className="text-sm text-muted-foreground">
              برای ارتباط با پشتیبانی با ما در تماس باشید.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}

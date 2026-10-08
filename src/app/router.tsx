import { createBrowserRouter } from "react-router-dom";

import { StoreLayout } from "@/layouts/StoreLayout";

import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { ProductDetailsPage } from "@/features/products/pages/ProductDetailsPage";
import { CartPage } from "@/features/cart/pages/CartPage";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { VerifyPage } from "@/features/auth/pages/VerifyPage";
import { CheckoutPage } from "@/features/checkout/pages/CheckoutPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { OrderSuccessPage } from "@/features/checkout/pages/OrderSuccessPage";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { OrderDetailsPage } from "@/features/orders/pages/OrderDetailsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { HomePage } from "@/features/products/pages/HomePage";
import { Link } from "react-router-dom";
import { ArrowRight, SearchX } from "lucide-react";

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-emerald-950/5 bg-white px-6 py-12 text-center shadow-xl shadow-emerald-950/5 sm:px-12">
        <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/8 text-primary">
          <SearchX className="size-10" />
        </span>
        <p className="mt-6 text-sm font-semibold text-primary">صفحه پیدا نشد</p>
        <h1 className="mt-2 text-2xl font-extrabold">اینجا چیزی برای دیدن نیست!</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">آدرسی که وارد کرده‌اید در دسترس نیست یا جابه‌جا شده است.</p>
        <Link to="/" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          برگشت به صفحه اصلی
          <ArrowRight className="mr-2 size-4" />
        </Link>
      </div>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },

      {
        path: "/products",
        element: <ProductsPage />,
      },

      {
        path: "/products/:id",
        element: <ProductDetailsPage />,
      },

      {
        path: "/auth/login",
        element: <LoginPage />,
      },

      {
        path: "/auth/verify",
        element: <VerifyPage />,
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/cart",
            element: <CartPage />,
          },
          {
            path: "/checkout",
            element: <CheckoutPage />,
          },
          {
            path: "/checkout/success",
            element: <OrderSuccessPage />,
          },
          {
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/orders/:id",
            element: <OrderDetailsPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

import { createBrowserRouter } from "react-router-dom";

import { StoreLayout } from "@/layouts/StoreLayout";

import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { ProductDetailsPage } from "@/features/products/pages/ProductDetailsPage";
import { CartPage } from "@/features/cart/pages/CartPage";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { VerifyPage } from "@/features/auth/pages/VerifyPage";

import { ProtectedRoute } from "./ProtectedRoute";

function HomePage() {
  return (
    <div>
      صفحه اصلی فروشگاه
    </div>
  );
}

function NotFoundPage() {
  return (
    <div>
      صفحه مورد نظر پیدا نشد.
    </div>
  );
}

export const router =
  createBrowserRouter([
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
          element:
            <ProductDetailsPage />,
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
          element:
            <ProtectedRoute />,
          children: [
            {
              path: "/cart",
              element: <CartPage />,
            },

            // بعداً:
            // /checkout
            // /orders
            // /profile
            // /addresses
          ],
        },
      ],
    },

    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

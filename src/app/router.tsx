import { createBrowserRouter } from "react-router-dom";
import { StoreLayout } from "@/layouts/StoreLayout";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { ProductDetailsPage } from "@/features/products/pages/ProductDetailsPage";
function HomePage() {
  return <div>صفحه اصلی فروشگاه</div>;
}

function CartPage() {
  return <div>سبد خرید</div>;
}

function NotFoundPage() {
  return <div>صفحه مورد نطر یافت نشد</div>;
}

function LoginPage() {
  return <div>ورود به حساب کاربری</div>;
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
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/auth/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, UserRound, LogOut, ClipboardList } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

const navItems = [
  {
    to: "/",
    label: "خانه",
    end: true,
  },
  {
    to: "/products",
    label: "محصولات",
  },
];

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useAuthStore((state) => state.logout);
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetCart = useCartStore((state) => state.reset);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (!isAuthenticated) {
      resetCart();
      return;
    }
    void fetchCart();
  }, [isInitialized, isAuthenticated, fetchCart, resetCart]);

  async function handleLogout() {
    try {
      await logout();
      resetCart();
      navigate("/");
    } catch {}
  }

  const cartQuantity = cart?.totalQuantity ?? 0;
  const userName = user?.RowName?.trim() || "حساب کاربری";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl font-bold"
          aria-label="صفحه اصلی فروشگاه"
        >
          فروشگاه
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "text-sm transition-colors",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
            aria-label="سبد خرید"
          >
            <ShoppingCart className="h-5 w-5" />

            {cartQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {cartQuantity > 99
                  ? "99+"
                  : cartQuantity.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>

          {/* Authentication */}
          {!isInitialized ? (
            <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                title="سفارش‌های من"
              >
                <ClipboardList className="h-4 w-4" />

                <span className="hidden sm:inline">سفارش‌های من</span>
              </Link>
              <Link
                to="/profile"
                className="hidden max-w-40 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted sm:flex"
                title={userName}
              >
                <UserRound className="h-4 w-4 shrink-0" />

                <span className="truncate">{userName}</span>
              </Link>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="flex h-10 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted"
            >
              <UserRound className="h-5 w-5" />

              <span className="hidden sm:inline">ورود</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

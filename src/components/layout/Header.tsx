import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  UserRound,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

const navItems = [
  { to: "/", label: "صفحه اصلی", end: true },
  { to: "/products", label: "محصولات" },
  { to: "/categories", label: "دسته‌بندی‌ها" },
  { to: "/discounts", label: "تخفیف‌ها" },
  { to: "/blog", label: "وبلاگ" },
  { to: "/contact", label: "تماس با ما" },
];

export function Header() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useAuthStore((state) => state.logout);

  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetCart = useCartStore((state) => state.reset);

  useEffect(() => {
    if (!isInitialized) return;

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
    } catch {
      // خطای خروج را در صورت نیاز مدیریت کن.
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = search.trim();

    if (!query) return;

    navigate(`/products?search=${encodeURIComponent(query)}`);
  }

  const cartQuantity = cart?.itemsCount ?? 0;
  const userName = user?.RowName?.trim() || "حساب کاربری";

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#AEDBC9] backdrop-blur-xl"
    >
      {/* ردیف بالا */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-4 lg:gap-8">
          {/* لوگو */}
          <Link
            to="/"
            aria-label="صفحه اصلی آدینامارکت"
            className="flex shrink-0 items-center gap-2.5"
          >
            <img
              src="/adinaLogo.png"
              alt="لوگوی آدینامارکت"
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
            />

            <span className="flex flex-col">
              <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">
                آدینامارکت
              </span>
            </span>
          </Link>

          {/* جست‌وجو */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="hidden h-11 min-w-0 max-w-[680px] flex-1 items-center rounded-full border border-slate-200 bg-white px-3 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 md:flex"
          >
            <Button variant="ghost"
              type="button"
              onClick={() => navigate("/categories")}
              className="flex shrink-0 items-center gap-1.5 border-l border-slate-200 pl-3 text-xs text-slate-500 transition hover:text-emerald-700"
            >
              همه دسته‌ها
              <ChevronDown className="size-3.5" />
            </Button>

            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی محصول، برند یا دسته‌بندی..."
              aria-label="جستجوی محصولات"
              className="h-full w-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 text-sm text-slate-700 shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 placeholder:text-slate-400"
            />

            <Button variant="ghost"
              type="submit"
              aria-label="جستجو"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-50"
            >
              <Search className="size-5" />
            </Button>
          </form>

          {/* عملیات کاربر */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {!isInitialized ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  title={userName}
                  className="hidden items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 lg:flex"
                >
                  <UserRound className="size-5" />
                  <span className="max-w-28 truncate">{userName}</span>
                </Link>

                <Button variant="ghost"
                  type="button"
                  onClick={() => void handleLogout()}
                  title="خروج از حساب"
                  className="hidden size-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-red-50 hover:text-red-600 sm:flex"
                >
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 sm:px-3"
              >
                <UserRound className="size-5" />
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </Link>
            )}

            {/* سبد خرید */}
            <Link
              to="/cart"
              aria-label={`سبد خرید، ${cartQuantity} محصول`}
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ShoppingCart className="size-[22px]" />

              {cartQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartQuantity > 99
                    ? "99+"
                    : cartQuantity.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>

            {/* منوی موبایل */}
            <Button variant="ghost"
              type="button"
              aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex size-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* جست‌وجوی موبایل */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="mb-3 flex h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-3 md:hidden"
        >
          <Search className="size-4 shrink-0 text-emerald-700" />

          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصولات..."
            aria-label="جستجوی محصولات"
            className="h-full w-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-sm shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 placeholder:text-slate-400"
          />

          <Button variant="ghost"
            type="submit"
            className="text-xs font-medium text-emerald-700"
          >
            جستجو
          </Button>
        </form>

        {/* ردیف پایین دسکتاپ */}

        <nav
          aria-label="منوی اصلی"
          className="hidden h-[42px] items-center justify-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "relative flex items-center px-4 text-[13px] font-medium transition-colors",
                  "after:absolute after:inset-x-4 after:top-7 after:h-0.5 after:rounded-full after:transition-colors",
                  isActive
                    ? "text-emerald-700 after:bg-emerald-600"
                    : "text-slate after:bg-transparent hover:text-emerald-700",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* منوی موبایل */}
        {mobileMenuOpen && (
          <nav
            aria-label="منوی موبایل"
            className="border-t border-slate-100 py-2 md:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    "block rounded-lg px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-emerald-50 font-semibold text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
                >
                  حساب کاربری ({userName})
                </Link>

                <Button variant="ghost"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  خروج از حساب
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

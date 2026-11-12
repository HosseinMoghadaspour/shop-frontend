import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  UserRound,
  LogOut,
  Search,
  ChevronDown,
  Home,
  LayoutGrid,
  Flame,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";
import { StoreBranchSelector } from "@/layouts/StoreBranchSelector";

export function Header() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useAuthStore((state) => state.logout);

  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetCart = useCartStore((state) => state.reset);
  const selectedBranchId = useSelectedBranchId();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      resetCart();
      return;
    }

    void fetchCart();
  }, [isInitialized, isAuthenticated, fetchCart, resetCart, selectedBranchId]);

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

  const mobileNavItems = [
      { to: "/discounts", label: "شگفت‌انگیز", icon: Flame, end: true },
      { to: "/categories", label: "دسته‌ها", icon: LayoutGrid },
      { to: "/", label: "خانه", icon: Home, featured: true },
    { to: "/cart", label: "سبد خرید", icon: ShoppingBag, badge: cartQuantity },
    {
      to: isAuthenticated ? "/profile" : "/auth/login",
      label: isAuthenticated ? "حساب من" : "ورود",
      icon: UserRound,
    },
  ];

  return (
    <>
      <header
        dir="rtl"
        className="sticky top-0 z-40 border-b border-emerald-900/10 bg-[#AEDBC9]/95 shadow-sm backdrop-blur-xl"
      >
        <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8">
          <div className="flex min-h-[66px] items-center justify-between gap-3 sm:min-h-[76px] sm:gap-4 lg:gap-8">
            {/* لوگو */}
            <Link
              to="/"
              aria-label="صفحه اصلی آدینامارکت"
              className="flex shrink-0 items-center gap-2.5"
            >
              <img
                src="/adinaLogo.png"
                alt="لوگوی آدینامارکت"
                className="h-10 w-10 object-contain sm:h-12 sm:w-12 "
              />
              <span className="text-base font-extrabold tracking-tight text-slate-800 sm:text-xl hidden sm:flex">
                آدینامارکت
              </span>
            </Link>

            {/* جست‌وجوی دسکتاپ */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="hidden h-11 min-w-0 max-w-[680px] flex-1 items-center rounded-full border border-slate-200 bg-white px-3 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 md:flex"
            >
              <Button
                variant="ghost"
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
                className="h-full w-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 text-sm text-slate-700 shadow-none outline-none focus-visible:ring-0 placeholder:text-slate-400"
              />
              <Button
                variant="ghost"
                type="submit"
                aria-label="جستجو"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-50"
              >
                <Search className="size-5" />
              </Button>
            </form>

            {/* عملیات دسکتاپ */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              {!isInitialized ? (
                <div className="h-9 w-20 animate-pulse rounded-lg bg-white/50" />
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    title={userName}
                    className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-700 transition hover:bg-white/60 hover:text-emerald-800"
                  >
                    <UserRound className="size-5" />
                    <span className="max-w-28 truncate">{userName}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => void handleLogout()}
                    title="خروج از حساب"
                    className="size-10 rounded-xl text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="size-5" />
                  </Button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white/60 hover:text-emerald-800"
                >
                  <UserRound className="size-5" />
                  ورود / ثبت‌نام
                </Link>
              )}

              <Link
                to="/cart"
                aria-label={`سبد خرید، ${cartQuantity} محصول`}
                className="relative flex size-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white/60 hover:text-emerald-800"
              >
                <ShoppingCart className="size-[22px]" />
                {cartQuantity > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white ring-2 ring-[#AEDBC9]">
                    {cartQuantity > 99 ? "99+" : cartQuantity.toLocaleString("fa-IR")}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* جست‌وجوی موبایل */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="mb-3 flex h-10 items-center rounded-full border border-emerald-900/10 bg-white/80 px-3 shadow-sm md:hidden"
          >
            <Search className="size-4 shrink-0 text-emerald-700" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی محصولات..."
              aria-label="جستجوی محصولات"
              className="h-full w-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-sm shadow-none outline-none focus-visible:ring-0 placeholder:text-slate-400"
            />
            <Button
              variant="ghost"
              type="submit"
              className="h-8 rounded-full px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 border-"
            >
              جستجو
            </Button>
          </form>

        

          {/* منوی افقی دسکتاپ */}
          <nav
            aria-label="منوی اصلی"
            className="hidden h-[42px] items-center justify-center gap-1 md:flex"
          >
            {[
              { to: "/", label: "صفحه اصلی", end: true },
              { to: "/products", label: "محصولات" },
              { to: "/categories", label: "دسته‌بندی‌ها" },
              { to: "/discounts", label: "تخفیف‌ها" },
              { to: "/blog", label: "وبلاگ" },
              { to: "/contact", label: "تماس با ما" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "relative flex items-center px-4 text-[13px] font-medium transition-colors",
                    "after:absolute after:inset-x-4 after:top-7 after:h-0.5 after:rounded-full after:transition-colors",
                    isActive
                      ? "text-emerald-800 after:bg-emerald-600"
                      : "text-slate-700 after:bg-transparent hover:text-emerald-700",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* نوار ناوبری پایین موبایل */}
      <nav
        dir="rtl"
        aria-label="ناوبری اصلی موبایل"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-900/10 bg-[#AEDBC9]/55 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,60,45,0.09)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid h-[68px] max-w-lg grid-cols-5 items-center px-2">
          {mobileNavItems.map(({ to, label, icon: Icon, end, featured, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "group relative flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-emerald-800" : "text-slate-500 hover:text-emerald-700",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-600" />
                  )}
                  <span
                    className={[
                      "relative flex items-center justify-center transition-all duration-200",
                      isActive
                        && "mb-1 -mt-7 size-12 rounded-2xl border-4 border-white bg-emerald-700 text-white shadow-lg text-emerald-700"

                    ].join(" ")}
                  >
                    <Icon className={featured ? "size-5" : "size-[19px]"} />
                    {!!badge && badge > 0 && (
                      <span className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {badge > 99 ? "99+" : badge.toLocaleString("fa-IR")}
                      </span>
                    )}
                  </span>
                  <span>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

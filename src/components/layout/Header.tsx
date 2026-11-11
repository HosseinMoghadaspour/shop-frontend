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
  Home,
  Package,
  LayoutGrid,
  Percent,
  Newspaper,
  Phone,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";
import { StoreBranchSelector } from "@/layouts/StoreBranchSelector";

const navItems = [
  { to: "/", label: "صفحه اصلی", end: true, icon: Home },
  { to: "/products", label: "محصولات", icon: Package },
  { to: "/categories", label: "دسته‌بندی‌ها", icon: LayoutGrid },
  { to: "/discounts", label: "تخفیف‌ها", icon: Percent },
  { to: "/blog", label: "وبلاگ", icon: Newspaper },
  { to: "/contact", label: "تماس با ما", icon: Phone },
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
      setMobileMenuOpen(false);
      navigate("/");
    } catch {
      // خطای خروج را در صورت نیاز مدیریت کن.
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = search.trim();
    if (!query) return;

    setMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  }

  const cartQuantity = cart?.itemsCount ?? 0;
  const userName = user?.RowName?.trim() || "حساب کاربری";

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 border-b border-emerald-900/10 bg-[#AEDBC9]/95 shadow-sm backdrop-blur-xl"
    >
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-[68px] items-center justify-between gap-3 sm:min-h-[76px] sm:gap-4 lg:gap-8">
          {/* لوگو */}
          <Link
            to="/"
            aria-label="صفحه اصلی آدینامارکت"
            className="flex shrink-0 items-center gap-2.5"
          >
            <img
              src="/adinaLogo.png"
              alt="لوگوی آدینامارکت"
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            />
            <span className="text-base font-extrabold tracking-tight text-slate-800 sm:text-xl">
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

          {/* عملیات کاربر */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!isInitialized ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-white/50" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  title={userName}
                  className="hidden items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-700 transition hover:bg-white/60 hover:text-emerald-800 lg:flex"
                >
                  <UserRound className="size-5" />
                  <span className="max-w-28 truncate">{userName}</span>
                </Link>

                <Button
                  variant="ghost"
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
                className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-white/60 hover:text-emerald-800 sm:flex"
              >
                <UserRound className="size-5" />
                <span>ورود / ثبت‌نام</span>
              </Link>
            )}

            <Link
              to="/cart"
              aria-label={`سبد خرید، ${cartQuantity} محصول`}
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white/60 hover:text-emerald-800"
            >
              <ShoppingCart className="size-[22px]" />
              {cartQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white ring-2 ring-[#AEDBC9]">
                  {cartQuantity > 99 ? "99+" : cartQuantity.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>

            {/* منوی همبرگری موبایل */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    type="button"
                    aria-label="باز کردن منوی اصلی"
                    className="flex size-10 items-center justify-center rounded-xl border-emerald-900/10 bg-white/70 text-emerald-950 shadow-sm hover:bg-white md:hidden"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent
                side="right"
                showCloseButton={false}
                className="w-[min(88vw,360px)] gap-0 border-l border-emerald-900/10 bg-[#F5FBF8] p-0"
              >
                <SheetHeader className="border-b border-emerald-900/10 bg-gradient-to-bl from-[#D9F1E6] via-[#EAF7F0] to-white px-5 pb-5 pt-6 text-right">
                  <div className="mb-3 flex items-center justify-between">
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <img
                        src="/adinaLogo.png"
                        alt="آدینامارکت"
                        className="size-11 object-contain"
                      />
                      <span className="text-lg font-black text-emerald-950">
                        آدینامارکت
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="بستن منو"
                      className="rounded-xl text-slate-600 hover:bg-white"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                  <SheetTitle className="text-right text-base font-extrabold text-slate-900">
                    سلام، {isAuthenticated ? userName : "به آدینامارکت خوش آمدید"}
                  </SheetTitle>
                  <SheetDescription className="text-right text-xs leading-6 text-slate-600">
                    از اینجا سریع‌تر به بخش‌های فروشگاه دسترسی پیدا کن.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-5">
                  <p className="mb-3 px-2 text-[11px] font-bold tracking-wide text-slate-400">
                    منوی فروشگاه
                  </p>

                  <nav aria-label="منوی موبایل" className="space-y-1.5">
                    {navItems.map(({ to, label, end, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          [
                            "group flex items-center justify-between rounded-2xl px-3.5 py-3.5 text-sm transition-all",
                            isActive
                              ? "bg-emerald-700 font-bold text-white shadow-md shadow-emerald-900/15"
                              : "text-slate-700 hover:bg-white hover:text-emerald-800",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span className="flex items-center gap-3">
                              <span
                                className={[
                                  "flex size-9 items-center justify-center rounded-xl transition-colors",
                                  isActive
                                    ? "bg-white/15 text-white"
                                    : "bg-emerald-100/80 text-emerald-800 group-hover:bg-emerald-100",
                                ].join(" ")}
                              >
                                <Icon className="size-[18px]" />
                              </span>
                              {label}
                            </span>
                            <ArrowLeft
                              className={[
                                "size-4 transition-transform",
                                isActive
                                  ? "text-white/80"
                                  : "text-slate-400 group-hover:-translate-x-1",
                              ].join(" ")}
                            />
                          </>
                        )}
                      </NavLink>
                    ))}
                  </nav>

                  <div className="my-5 border-t border-emerald-900/10" />

                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                      >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                          <UserRound className="size-[18px]" />
                        </span>
                        حساب کاربری
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-right text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-rose-100">
                          <LogOut className="size-[18px]" />
                        </span>
                        خروج از حساب کاربری
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
                    >
                      <UserRound className="size-4" />
                      ورود / ثبت‌نام
                    </Link>
                  )}
                </div>

                <div className="border-t border-emerald-900/10 bg-white/70 px-5 py-4">
                  <p className="text-center text-[11px] font-medium text-slate-500">
                    خریدی آسان، مطمئن و لذت‌بخش
                  </p>
                </div>
              </SheetContent>
            </Sheet>
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
            className="h-8 rounded-full px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
          >
            جستجو
          </Button>
        </form>

        {isAuthenticated && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-900/10 py-2">
            <span className="hidden text-xs font-medium text-emerald-950/70 sm:inline">
              ارسال بر اساس آدرس و شعبه انتخابی شما
            </span>
            <StoreBranchSelector />
          </div>
        )}

        {/* منوی دسکتاپ */}
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
  );
}

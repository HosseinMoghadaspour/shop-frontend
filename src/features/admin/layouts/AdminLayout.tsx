import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  FolderTree,
  Images,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

const navigation = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "مدیریت کالاها", icon: PackageSearch },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { to: "/admin/sliders", label: "مدیریت اسلایدرها", icon: Images },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f8f6] text-slate-900">
      {mobileOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[270px] flex-col border-l border-emerald-950/10 bg-white transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-[88px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/15">
          <img src="/adinaLogo.png" alt="آدینا" className="size-full object-contain" />
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight">فروشگاه آدینامارکت</p>
            <p className="mt-1 text-xs text-slate-500">پنل مدیریت فروشگاه</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="mr-auto text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="بستن منو">
            <X className="size-5" />
          </Button>
        </div>

        <div className="px-4 pt-7">
          <nav className="space-y-1.5">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/10" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"}`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span>{label}</span>
                <ChevronLeft className="mr-auto size-4 opacity-0 transition group-hover:opacity-70" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Button variant="ghost" className="mt-3 w-full justify-start text-slate-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => void handleLogout()}>
            <LogOut className="ml-2 size-4" /> خروج از حساب
          </Button>
        </div>
      </aside>

      <div className="min-h-screen lg:mr-[270px]">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">
          <Button type="button" variant="outline" size="icon" aria-label="باز کردن منو" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-extrabold">پنل مدیریت فروشگاه</span>
        </div>
        <main className="mx-auto w-full max-w-[1280px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

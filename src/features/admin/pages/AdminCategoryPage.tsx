import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownWideNarrow,
  Apple,
  Baby,
  Bike,
  BookOpen,
  Cake,
  Carrot,
  Check,
  Cherry,
  ClipboardList,
  Coffee,
  CookingPot,
  Cookie,
  CupSoda,
  Dumbbell,
  Fish,
  Flower2,
  Gift,
  Heart,
  House,
  Leaf,
  Milk,
  Monitor,
  Package,
  PawPrint,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sprout,
  Stethoscope,
  Trees,
  Utensils,
  Wheat,
  Eye,
  EyeOff,
  FolderTree,
  LogOut,
  RefreshCw,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";
import {
  getAdminCategories,
  setCategoryDisplayOrder,
  setCategoryIcon,
  setCategoryVisibility,
  type AdminCategoriesResult,
  type AdminCategory,
  type CategoryVisibilityFilter,
} from "@/features/admin/services/admin-categories.api";

const PAGE_SIZE = 20;
const CATEGORY_ICONS = [
  { name: "ShoppingBasket", label: "سبد خرید", icon: ShoppingBasket },
  { name: "Sprout", label: "جوانه و نشاء", icon: Sprout },
  { name: "Leaf", label: "برگ", icon: Leaf },
  { name: "Flower2", label: "گل", icon: Flower2 },
  { name: "Trees", label: "درخت", icon: Trees },
  { name: "Carrot", label: "سبزیجات", icon: Carrot },
  { name: "Apple", label: "میوه", icon: Apple },
  { name: "Cherry", label: "گیلاس", icon: Cherry },
  { name: "Wheat", label: "غلات", icon: Wheat },
  { name: "Milk", label: "لبنیات", icon: Milk },
  { name: "Fish", label: "ماهی", icon: Fish },
  { name: "Coffee", label: "قهوه", icon: Coffee },
  { name: "Cake", label: "شیرینی و کیک", icon: Cake },
  { name: "Cookie", label: "بیسکویت", icon: Cookie },
  { name: "Utensils", label: "ظروف و خوراک", icon: Utensils },
  { name: "CookingPot", label: "لوازم آشپزخانه", icon: CookingPot },
  { name: "CupSoda", label: "نوشیدنی", icon: CupSoda },
  { name: "Package", label: "کالا و بسته", icon: Package },
  { name: "Shirt", label: "پوشاک", icon: Shirt },
  { name: "Smartphone", label: "موبایل", icon: Smartphone },
  { name: "Monitor", label: "کامپیوتر", icon: Monitor },
  { name: "BookOpen", label: "کتاب", icon: BookOpen },
  { name: "PawPrint", label: "حیوانات", icon: PawPrint },
  { name: "Dumbbell", label: "ورزش", icon: Dumbbell },
  { name: "Bike", label: "دوچرخه", icon: Bike },
  { name: "Baby", label: "کودک", icon: Baby },
  { name: "Heart", label: "سلامت و مراقبت", icon: Heart },
  { name: "Gift", label: "هدیه", icon: Gift },
  { name: "House", label: "خانه", icon: House },
  { name: "ClipboardList", label: "عمومی و فهرست", icon: ClipboardList },
  { name: "Stethoscope", label: "پزشکی", icon: Stethoscope },
] as const;
const numberFormat = new Intl.NumberFormat("fa-IR");
const emptyResult: AdminCategoriesResult = {
  categories: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 },
};

function categoryImageUrl(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url, import.meta.env.VITE_API_URL || window.location.origin).toString();
  } catch {
    return url;
  }
}

export function AdminCategoriesPage() {
  const logout = useAuthStore((state) => state.logout);
  const [result, setResult] = useState(emptyResult);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<CategoryVisibilityFilter>("all");
  const [page, setPage] = useState(1);
  const [sortDrafts, setSortDrafts] = useState<Record<number, string>>({});
  const [iconPickerCategoryId, setIconPickerCategoryId] = useState<number | null>(null);
  const [iconSearch, setIconSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCategories({
        search: search.trim() || undefined,
        visibility,
        page,
        limit: PAGE_SIZE,
      });
      setResult(data);
      setSortDrafts(Object.fromEntries(data.categories.map((category) => [category.id, String(category.sortOrder)])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت دسته‌بندی‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [search, visibility, page]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function toggleVisibility(category: AdminCategory) {
    const nextValue = !category.isVisible;
    setBusyAction(`visibility-${category.id}`);
    setError(null);
    setNotice(null);
    try {
      await setCategoryVisibility(category.id, nextValue);
      setNotice(nextValue ? `نمایش «${category.name}» فعال شد.` : `«${category.name}» از سایت مخفی شد.`);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت نمایش ناموفق بود.");
    } finally {
      setBusyAction(null);
    }
  }

  async function saveSortOrder(category: AdminCategory) {
    const rawValue = sortDrafts[category.id] ?? String(category.sortOrder);
    const sortOrder = Number(rawValue);
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999999) {
      setError("ترتیب نمایش باید عدد صحیح بین صفر تا ۹۹۹۹۹۹ باشد.");
      return;
    }

    setBusyAction(`order-${category.id}`);
    setError(null);
    setNotice(null);
    try {
      await setCategoryDisplayOrder(category.id, sortOrder);
      setNotice(`ترتیب نمایش «${category.name}» ذخیره شد.`);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ترتیب نمایش ناموفق بود.");
    } finally {
      setBusyAction(null);
    }
  }

  async function saveCategoryIcon(category: AdminCategory, iconName: string | null) {
    setBusyAction(`icon-${category.id}`);
    setError(null);
    setNotice(null);
    try {
      await setCategoryIcon(category.id, iconName);
      setNotice(iconName
        ? `آیکون «${CATEGORY_ICONS.find((item) => item.name === iconName)?.label ?? iconName}» برای «${category.name}» ذخیره شد.`
        : `آیکون اختصاصی «${category.name}» حذف شد.`);
      setIconPickerCategoryId(null);
      setIconSearch("");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره آیکون ناموفق بود.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.assign("/admin/login");
    }
  }

  const filters: { value: CategoryVisibilityFilter; label: string }[] = [
    { value: "all", label: "همه" },
    { value: "visible", label: "نمایش داده‌شده" },
    { value: "hidden", label: "مخفی" },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="mt-1 text-2xl font-extrabold">مدیریت نمایش دسته‌بندی‌ها</h1>
              <p className="mt-1 text-sm text-slate-500">اطلاعات اصلی دسته‌بندی‌ها از سیستم حسابداری دریافت می‌شود.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadCategories()} disabled={loading}>
              <RefreshCw className="ml-2 size-4" /> به‌روزرسانی
            </Button>
            <Button variant="outline" onClick={() => void handleLogout()}>
              <LogOut className="ml-2 size-4" /> خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="جست‌وجو بر اساس نام یا کد دسته‌بندی..."
                  className="h-11 pr-9"
                  aria-label="جست‌وجوی دسته‌بندی"
                />
              </div>
              <Button type="submit" className="h-11">
                <Search className="ml-2 size-4" /> جست‌وجو
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" aria-label="فیلتر وضعیت نمایش">
                {filters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={visibility === filter.value ? "default" : "outline"}
                    onClick={() => {
                      setVisibility(filter.value);
                      setPage(1);
                    }}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                تعداد: {numberFormat.format(result.pagination.total)}
                <span className="mx-2">•</span>
                صفحه {numberFormat.format(result.pagination.page)} از {numberFormat.format(result.pagination.totalPages)}
              </p>
            </div>
          </CardContent>
        </Card>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

        {loading ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">در حال دریافت دسته‌بندی‌ها...</CardContent></Card>
        ) : result.categories.length === 0 ? (
          <Card><CardContent className="p-10 text-center">
            <FolderTree className="mx-auto size-9 text-muted-foreground" />
            <p className="mt-3 font-semibold">دسته‌بندی‌ای پیدا نشد.</p>
            <p className="mt-1 text-sm text-muted-foreground">عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید.</p>
          </CardContent></Card>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {result.categories.map((category) => {
            //  const image = categoryImageUrl(category.image);
              const isBusy = busyAction === `visibility-${category.id}` || busyAction === `order-${category.id}` || busyAction === `icon-${category.id}`;
              return (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {/* <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
                        {image ? <img src={image} alt={category.name} className="size-full object-contain" loading="lazy" /> : <FolderTree className="size-7 text-slate-400" />}
                      </div> */}
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700" title={category.iconName ? `آیکون: ${category.iconName}` : "آیکون پیش‌فرض"}>
                        {(() => {
                          const SelectedIcon = CATEGORY_ICONS.find((item) => item.name === category.iconName)?.icon;
                          return SelectedIcon ? <SelectedIcon className="size-6" /> : <FolderTree className="size-6" />;
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base leading-7">{category.name || "بدون نام"}</CardTitle>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge variant="outline">کد: {category.code || "—"}</Badge>
                          <Badge variant={category.isActive ? "secondary" : "destructive"}>
                            {category.isActive ? "فعال در حسابداری" : "غیرفعال در حسابداری"}
                          </Badge>
                          <Badge variant={category.isVisible ? "default" : "outline"}>
                            {category.isVisible ? "نمایش در سایت" : "مخفی در سایت"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 rounded-xl border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">آیکون دسته‌بندی</p>
                          <p className="mt-1 text-xs text-muted-foreground">{CATEGORY_ICONS.find((item) => item.name === category.iconName)?.label ?? (category.iconName ? category.iconName : "آیکون پیش‌فرض")}</p>
                        </div>
                        <div className="flex gap-2">
                          {category.iconName && <Button type="button" size="sm" variant="ghost" disabled={isBusy} onClick={() => void saveCategoryIcon(category, null)}>حذف آیکون</Button>}
                          <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={() => { setIconPickerCategoryId((current) => current === category.id ? null : category.id); setIconSearch(""); }}>
                            {iconPickerCategoryId === category.id ? "بستن فهرست" : "انتخاب آیکون"}
                          </Button>
                        </div>
                      </div>
                      {iconPickerCategoryId === category.id && (
                        <div className="space-y-3 border-t pt-3">
                          <div className="relative">
                            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={iconSearch} onChange={(event) => setIconSearch(event.target.value)} placeholder="جست‌وجوی آیکون..." className="pr-9" aria-label="جست‌وجوی آیکون" />
                          </div>
                          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                            {CATEGORY_ICONS.filter((item) => `${item.label} ${item.name}`.toLocaleLowerCase("fa").includes(iconSearch.trim().toLocaleLowerCase("fa"))).map((item) => {
                              const Icon = item.icon;
                              const selected = category.iconName === item.name;
                              return (
                                <button key={item.name} type="button" disabled={isBusy} onClick={() => void saveCategoryIcon(category, item.name)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center text-xs transition hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 ${selected ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`} aria-pressed={selected}>
                                  <Icon className="size-6" />
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          {CATEGORY_ICONS.filter((item) => `${item.label} ${item.name}`.toLocaleLowerCase("fa").includes(iconSearch.trim().toLocaleLowerCase("fa"))).length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">آیکونی با این عبارت پیدا نشد.</p>}
                          {busyAction === `icon-${category.id}` && <p className="text-xs text-emerald-700">در حال ذخیره آیکون...</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {category.isVisible ? <Eye className="size-4 text-emerald-700" /> : <EyeOff className="size-4 text-slate-500" />}
                        نمایش این دسته‌بندی در سایت
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={category.isVisible ? "outline" : "default"}
                        disabled={isBusy || (!category.isActive && !category.isVisible)}
                        onClick={() => void toggleVisibility(category)}
                      >
                        {busyAction === `visibility-${category.id}` ? "در حال ذخیره..." : category.isVisible ? "مخفی کردن" : "نمایش در سایت"}
                      </Button>
                    </div>
                    {!category.isActive && <p className="text-xs leading-6 text-amber-700">این دسته‌بندی در حسابداری غیرفعال است؛ فعال‌سازی نمایش از این پنل امکان‌پذیر نیست.</p>}

                    {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1 space-y-2">
                        <label htmlFor={`sort-${category.id}`} className="flex items-center gap-2 text-sm font-medium">
                          <ArrowDownWideNarrow className="size-4 text-muted-foreground" /> ترتیب نمایش
                        </label>
                        <Input
                          id={`sort-${category.id}`}
                          type="number"
                          min={0}
                          max={999999}
                          step={1}
                          value={sortDrafts[category.id] ?? String(category.sortOrder)}
                          onChange={(event) => setSortDrafts((current) => ({ ...current, [category.id]: event.target.value }))}
                          className="h-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy || (sortDrafts[category.id] ?? String(category.sortOrder)) === String(category.sortOrder)}
                        onClick={() => void saveSortOrder(category)}
                      >
                        <Check className="ml-2 size-4" />
                        {busyAction === `order-${category.id}` ? "در حال ذخیره..." : "ذخیره ترتیب"}
                      </Button>
                    </div> */}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}

        {!loading && result.pagination.totalPages > 1 && (
          <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="صفحه‌بندی دسته‌بندی‌ها">
            <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>قبلی</Button>
            <span className="text-sm text-muted-foreground">صفحه {numberFormat.format(page)} از {numberFormat.format(result.pagination.totalPages)}</span>
            <Button variant="outline" disabled={page >= result.pagination.totalPages || loading} onClick={() => setPage((current) => Math.min(result.pagination.totalPages, current + 1))}>بعدی</Button>
          </nav>
        )}
      </div>
    </main>
  );
}

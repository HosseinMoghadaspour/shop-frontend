import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  FolderOpen,
  Home,
  Package,
  Search,
  X,
  ArrowRight,
} from "lucide-react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/services/api/client";

interface CategoryItem {
  id: number;
  code: string;
  name: string;
  url: string | null;
  onlineCategoryImage: string | null;
  iconName: string | null;
  children: CategoryItem[];
}

interface CategoriesResponse {
  success: boolean;
  data: CategoryItem[];
}

function flattenCategories(
  categories: CategoryItem[],
  ancestors: CategoryItem[] = [],
): Array<{ category: CategoryItem; ancestors: CategoryItem[] }> {
  return categories.flatMap((category) => [
    { category, ancestors },
    ...flattenCategories(category.children ?? [], [...ancestors, category]),
  ]);
}

function findCategoryPath(
  categories: CategoryItem[],
  id: number,
  ancestors: CategoryItem[] = [],
): CategoryItem[] | null {
  for (const category of categories) {
    const path = [...ancestors, category];
    if (category.id === id) return path;
    const nested = findCategoryPath(category.children ?? [], id, path);
    if (nested) return nested;
  }
  return null;
}

function getCategoryIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Package;
  const normalizedName = iconName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[-_\s]/g, "")
    .toLowerCase();
  const entry = Object.entries(icons).find(
    ([name]) => name.toLowerCase() === normalizedName,
  );
  return (entry?.[1] as LucideIcon | undefined) ?? Package;
}

function CategoryTile({ category }: { category: CategoryItem }) {
  const Icon = getCategoryIcon(category.iconName);
  const hasChildren = (category.children?.length ?? 0) > 0;
  const destination = hasChildren
    ? `/categories?categoryId=${category.id}`
    : `/products?categoryId=${category.id}`;

  return (
    <Link
      to={destination}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-950/5 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      aria-label={hasChildren
        ? `مشاهده زیرمجموعه‌های ${category.name}`
        : `مشاهده محصولات دسته‌بندی ${category.name}`}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-800 group-hover:text-emerald-800">
          {category.name}
        </span>
        <span className="mt-1 block text-[11px] text-slate-400">
          {hasChildren ? `${category.children.length.toLocaleString("fa-IR")} زیر‌دسته` : "مشاهده محصولات"}
        </span>
      </span>
      <ChevronLeft className="size-4 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-emerald-700" />
    </Link>
  );
}

export function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const selectedId = Number(searchParams.get("categoryId"));
  const hasSelectedId = Number.isSafeInteger(selectedId) && selectedId > 0;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get<CategoriesResponse>("/categories");
      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error("پاسخ دسته‌بندی‌ها معتبر نیست.");
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesQuery.data ?? [];
  const allCategories = useMemo(() => flattenCategories(categories), [categories]);
  const selectedPath = useMemo(
    () => hasSelectedId ? findCategoryPath(categories, selectedId) : null,
    [categories, hasSelectedId, selectedId],
  );
  const selectedCategory = selectedPath?.[selectedPath.length - 1] ?? null;
  const visibleCategories = selectedCategory
    ? selectedCategory.children ?? []
    : categories;

  const normalizedSearch = search.trim().toLocaleLowerCase("fa");
  const filteredCategories = useMemo(
    () => allCategories.filter(({ category }) =>
      category.name.toLocaleLowerCase("fa").includes(normalizedSearch),
    ),
    [allCategories, normalizedSearch],
  );

  return (
    <section dir="rtl" className="mx-auto max-w-7xl px-4 py-7 sm:py-10">
      <div className="relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-800 px-5 py-7 text-white shadow-lg shadow-emerald-950/10 sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">
            <FolderOpen className="size-3.5" />
            راهنمای خرید
          </span>
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">
            {selectedCategory?.name ?? "دسته‌بندی محصولات"}
          </h1>
          <p className="mt-2 text-sm leading-7 text-emerald-50/80">
            {selectedCategory
              ? "زیر‌دسته موردنظرت را انتخاب کن تا به محصولات همان گروه برسی."
              : "دسته موردنظرت را انتخاب کن و مرحله‌به‌مرحله به محصولات مرتبط برس."}
          </p>
        </div>
        <div className="pointer-events-none absolute -left-8 -top-16 size-56 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 left-36 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <nav aria-label="مسیر دسته‌بندی" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/categories" className="inline-flex items-center gap-1.5 transition hover:text-emerald-700">
          <Home className="size-4" /> همه دسته‌ها
        </Link>
        {selectedPath?.map((category) => (
          <span key={category.id} className="inline-flex items-center gap-2">
            <ChevronLeft className="size-4 text-slate-300" />
            {category.id === selectedId ? (
              <span className="font-bold text-emerald-800">{category.name}</span>
            ) : (
              <Link className="transition hover:text-emerald-700" to={`/categories?categoryId=${category.id}`}>
                {category.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            {normalizedSearch ? "نتایج جست‌وجو" : selectedCategory ? "زیر‌دسته‌ها" : "دسته‌های اصلی"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {allCategories.length.toLocaleString("fa-IR")} دسته‌بندی در فروشگاه
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بین دسته‌بندی‌ها..."
            aria-label="جستجو بین دسته‌بندی‌ها"
            className="h-11 rounded-xl border-slate-200 bg-white pr-10 pl-10"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              aria-label="پاک کردن جستجو"
              className="absolute left-1 top-1/2 size-8 -translate-y-1/2 text-slate-400"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-[76px] rounded-2xl" />
          ))}
        </div>
      ) : categoriesQuery.isError ? (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <p className="font-semibold text-slate-800">دریافت دسته‌بندی‌ها با خطا مواجه شد.</p>
          <p className="mt-2 text-sm text-slate-500">لطفاً اتصال اینترنت را بررسی و دوباره تلاش کن.</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => void categoriesQuery.refetch()}>
            تلاش مجدد
          </Button>
        </div>
      ) : hasSelectedId && !selectedCategory ? (
        <div className="rounded-2xl border border-dashed bg-white px-5 py-12 text-center">
          <FolderOpen className="mx-auto size-9 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">این دسته‌بندی پیدا نشد یا در فروشگاه فعال نیست.</p>
          <Link to="/categories" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900">
            <ArrowRight className="size-4" /> بازگشت به دسته‌های اصلی
          </Link>
        </div>
      ) : normalizedSearch ? (
        filteredCategories.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map(({ category, ancestors }) => (
              <div key={category.id} className="min-w-0">
                <CategoryTile category={category} />
                {ancestors.length > 0 && (
                  <p className="mt-1 px-3 text-[11px] text-slate-400">
                    {ancestors.map((item) => item.name).join(" / ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white px-5 py-12 text-center">
            <Search className="mx-auto size-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">دسته‌بندی‌ای با این نام پیدا نشد.</p>
            <Button variant="link" className="mt-1 text-emerald-700" onClick={() => setSearch("")}>
              پاک کردن جست‌وجو
            </Button>
          </div>
        )
      ) : visibleCategories.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </div>
      ) : selectedCategory ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <Package className="mx-auto size-9 text-emerald-600" />
          <p className="mt-3 font-bold text-slate-800">این دسته‌بندی زیر‌دسته‌ای ندارد.</p>
          <p className="mt-1 text-sm text-slate-500">برای مشاهده کالاهای این گروه وارد صفحه محصولات شو.</p>
          <Link to={`/products?categoryId=${selectedCategory.id}`} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800">
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          هنوز دسته‌بندی‌ای برای نمایش وجود ندارد.
        </div>
      )}
    </section>
  );
}

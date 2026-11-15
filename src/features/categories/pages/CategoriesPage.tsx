import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, FolderOpen, Package, Search, X } from "lucide-react";
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
  children?: CategoryItem[];
}

interface CategoriesResponse {
  success: boolean;
  data: CategoryItem[];
}

function flattenCategories(
  categories: CategoryItem[],
  parentName = "",
): Array<CategoryItem & { parentName: string }> {
  return categories.flatMap((category) => [
    { ...category, parentName },
    ...flattenCategories(category.children ?? [], category.name),
  ]);
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

  return (
    <Link
      to={`/products?categoryId=${category.id}`}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-950/5 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      aria-label={`مشاهده محصولات دسته‌بندی ${category.name}`}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-800 group-hover:text-emerald-800">
          {category.name}
        </span>
        <span className="mt-1 block text-[11px] text-slate-400">
          مشاهده محصولات
        </span>
      </span>
      <ChevronLeft className="size-4 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-emerald-700" />
    </Link>
  );
}

export function CategoriesPage() {
  const [search, setSearch] = useState("");

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
  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories],
  );
  const normalizedSearch = search.trim().toLocaleLowerCase("fa");
  const filteredCategories = useMemo(
    () =>
      flatCategories.filter((category) =>
        category.name.toLocaleLowerCase("fa").includes(normalizedSearch),
      ),
    [flatCategories, normalizedSearch],
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
            دسته‌بندی محصولات
          </h1>
          <p className="mt-2 text-sm leading-7 text-emerald-50/80">
            دسته موردنظرت را انتخاب کن و محصولات مرتبط را یک‌جا ببین.
          </p>
        </div>
        <div className="pointer-events-none absolute -left-8 -top-16 size-56 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 left-36 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">همه دسته‌ها</h2>
          <p className="mt-1 text-xs text-slate-500">
            {flatCategories.length.toLocaleString("fa-IR")} دسته‌بندی در فروشگاه
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
          <p className="font-semibold text-slate-800">
            دریافت دسته‌بندی‌ها با خطا مواجه شد.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            لطفاً اتصال اینترنت را بررسی و دوباره تلاش کن.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={() => void categoriesQuery.refetch()}
          >
            تلاش مجدد
          </Button>
        </div>
      ) : normalizedSearch ? (
        filteredCategories.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <div key={category.id} className="min-w-0">
                <CategoryTile category={category} />
                {category.parentName && (
                  <p className="mt-1 px-3 text-[11px] text-slate-400">
                    زیرمجموعه {category.parentName}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white px-5 py-12 text-center">
            <Search className="mx-auto size-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">
              دسته‌بندی‌ای با این نام پیدا نشد.
            </p>
            <Button
              variant="link"
              className="mt-1 text-emerald-700"
              onClick={() => setSearch("")}
            >
              نمایش همه دسته‌ها
            </Button>
          </div>
        )
      ) : categories.length ? (
        <div className="space-y-7">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.iconName);
            return (
              <section
                key={category.id}
                className="rounded-3xl border border-emerald-950/5 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Link
                    to={`/products?categoryId=${category.id}`}
                    className="group flex min-w-0 items-center gap-3"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-extrabold text-slate-900 group-hover:text-emerald-800">
                        {category.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        مشاهده همه محصولات این دسته
                      </span>
                    </span>
                  </Link>
                  <Link
                    to={`/products?categoryId=${category.id}`}
                    className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    مشاهده همه
                  </Link>
                </div>

                {category.children?.length ? (
                  <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {category.children.map((child) => (
                      <CategoryTile key={child.id} category={child} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    برای مشاهده محصولات این دسته، روی عنوان آن کلیک کن.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          هنوز دسته‌بندی‌ای برای نمایش وجود ندارد.
        </div>
      )}
    </section>
  );
}

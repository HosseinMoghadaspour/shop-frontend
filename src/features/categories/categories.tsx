import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/services/api/client";
import { RefreshCw, icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoriesItem {
  id: number;
  code: string;
  name: string;
  url: string | null;
  onlineCategoryImage: string | null;
  iconName: string | null;
}

function getCategoryIcon(iconName: string | null): LucideIcon {
  if (!iconName) return icons.Package;

  // پشتیبانی از نام‌هایی مانند ShoppingBasket و shopping-basket
  const normalizedName = iconName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

  const iconEntry = Object.entries(icons).find(
    ([name]) => name.toLowerCase() === normalizedName.replace(/-/g, ""),
  );

  return (iconEntry?.[1] as LucideIcon | undefined) ?? icons.Package;
}

export function Category() {
  const [categories, setCategories] = useState<CategoriesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const response = await apiClient.get<{
        success: boolean;
        data: CategoriesItem[];
      }>("/admin/categories");

      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error("پاسخ دسته‌بندی‌ها معتبر نیست.");
      }

      console.log(response.data.data);

      setCategories(response.data.data);
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!api) return;

    const updateIndex = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    updateIndex();
    api.on("select", updateIndex);
    api.on("reInit", updateIndex);

    return () => {
      api.off("select", updateIndex);
      api.off("reInit", updateIndex);
    };
  }, [api]);

  useEffect(() => {
    if (!api || categories.length < 2) return;

    const timeoutId = window.setTimeout(() => {
      api.scrollNext();
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [api, selectedIndex, categories.length]);

  if (isLoading) {
    return (
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6"
      >
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-[105px] min-w-[125px] flex-1 rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section dir="rtl" className="mx-auto w-full px-4 py-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            دریافت دسته‌بندی‌های فروشگاه با مشکل مواجه شد.
          </p>
          <Button variant="outline" onClick={() => void fetchCategories()}>
            <RefreshCw className="ms-2 size-4" />
            تلاش مجدد
          </Button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section
      dir="rtl"
      aria-label="دسته‌بندی محصولات فروشگاه"
      className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-6"
    >
      <Carousel
        setApi={setApi}
        opts={{
          loop: categories.length > 1,
          align: "start",
          direction: "rtl",
        }}
        className="relative w-full"
      >
        <CarouselContent className="-ms-2 items-stretch">
          {categories.map((category, index) => {
            const isActive = index === selectedIndex;
            const Icon = getCategoryIcon(category.iconName);

            const card = (
              <article
                className={[
                  "flex h-[125px] flex-col items-center justify-center",
                  "gap-2 rounded-xl border px-3 py-3",
                  "border-emerald-600 bg-gradient-to-b from-white to-slate-50",
                  "text-[#215E21] shadow-sm transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-emerald-300",
                  "hover:from-emerald-500 hover:to-emerald-700",
                  "hover:text-white hover:shadow-md",
                ].join(" ")}
              >
                <Icon
                  className="size-10 shrink-0 transition-colors"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <h3 className="w-full truncate text-center text-xs font-semibold sm:text-sm  mt-4">
                  {category.name}
                </h3>
              </article>
            );

            return (
              <CarouselItem
                key={category.id}
                className="basis-[145px] ps-5 sm:basis-[155px] lg:basis-[160px] mt-2"
              >
                {category.url ? (
                  <a
                    href={category.url}
                    aria-label={`مشاهده دسته‌بندی ${category.name}`}
                    className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    {card}
                  </a>
                ) : (
                  card
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export default Category;

import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ShoppingBasket } from "lucide-react";
import {
  Baby,
  Bike,
  Shirt,
  Laptop,
  House,
  SprayCan,
  Apple,
  FolderOpen,
} from "lucide-react";
import { apiClient } from "@/services/api/client";

interface CategoriesItem {
  id: number;
  code: string;
  name: string;
  url: string | null;
  onlineCategoryImage: string | null;
}

const categoryIcons = [
  Baby,
  Bike,
  Shirt,
  Laptop,
  House,
  SprayCan,
  Apple,
];

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
      }>("/categories");

      if (
        !response.data.success ||
        !Array.isArray(response.data.data)
      ) {
        throw new Error("پاسخ دسته‌بندی‌ها معتبر نیست.");
      }

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
          <Button
            variant="outline"
            onClick={() => void fetchCategories()}
          >
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
            const Icon = category.onlineCategoryImage || "";

            const card = (
              <article
                className={[
                  "flex h-[105px] flex-col items-center justify-center",
                  "gap-2 rounded-xl border px-3 py-3",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  "focus-visible:outline-none",
                   "hover:border-emerald-600 hover:bg-gradient-to-b hover:from-emerald-500 hover:to-emerald-700 hover:text-white hover:shadow-md border-slate-200/80 bg-gradient-to-b from-white to-slate-50 text-slate-700 shadow-sm hover:border-emerald-300",
                ].join(" ")}
              >
                <img
                  src={Icon}
                  className={[
                    "size-8 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#174e60]",
                  ].join(" ")}
                  aria-hidden="true"
                />

                <h3 className="w-full truncate text-center text-xs font-semibold sm:text-sm">
                  {category.name}
                </h3>
              </article>
            );

            return (
              <CarouselItem
                key={category.id}
                className="basis-[145px] ps-2 sm:basis-[155px] lg:basis-[160px]"
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

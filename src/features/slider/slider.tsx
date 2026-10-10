import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowUpLeft, RefreshCw } from "lucide-react";
import { apiClient } from "@/services/api/client";

interface SliderItem {
  RowID: string;
  DescBut: string;
  DescImage: string;
  Description: string;
  Status: boolean;
  Type: number;
  UrlImage: string;
  UrlSend: string;
}

export function Slider() {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function getSliders() {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await apiClient.get<SliderItem[]>("/sliders");

        if (!isMounted) return;

        const activeSlides = (response.data ?? []).filter(
          (slide) => slide.Status && slide.UrlImage,
        );

        setSlides(activeSlides);
      } catch (error) {
        console.error("خطا در دریافت اسلایدرها:", error);

        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void getSliders();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    updateSelectedIndex();

    api.on("select", updateSelectedIndex);
    api.on("reInit", updateSelectedIndex);

    return () => {
      api.off("select", updateSelectedIndex);
      api.off("reInit", updateSelectedIndex);
    };
  }, [api, slides.length]);

  // حرکت خودکار هر ۵ ثانیه
  useEffect(() => {
    if (!api || slides.length < 2) return;

    const timeoutId = window.setTimeout(() => {
      api.scrollNext();
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [api, slides.length, selectedIndex]);
  // مسیر تصویر از سرور بک‌اند
  const getImageUrl = (path: string) => {
    if (/^https?:\/\//i.test(path)) return path;

    const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)
      ?.replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    return `${baseUrl ?? ""}/${path.replace(/^\/+/, "")}`;
  };

  if (isLoading) {
    return (
      <section
        className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8"
        aria-label="در حال بارگذاری بنرها"
      >
        <Skeleton className="aspect-[16/7] w-full rounded-2xl sm:aspect-[16/6] lg:aspect-[16/5]" />
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="mx-auto max-w-[1600px] px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            دریافت بنرهای فروشگاه با مشکل مواجه شد.
          </p>

          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="ms-2 size-4" />
            تلاش مجدد
          </Button>
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section
      dir="rtl"
      className=" w-full max-w-[1600px] sm:px-6 lg:px-8"
      aria-label="بنرهای فروشگاه"
    >
      <Carousel
        setApi={setApi}
        opts={{
          loop: slides.length > 1,
          align: "start",
          direction: "rtl",
        }}
        className="group relative"
      >
        <CarouselContent className="-ms-0">
          {slides.map((slide) => {
            const imageUrl = getImageUrl(slide.UrlImage);
            const hasButton = Boolean(
              slide.DescBut.trim() && slide.UrlSend.trim(),
            );

            return (
              <CarouselItem key={slide.RowID} className="basis-full ps-0">
                <article className="relative isolate aspect-[16/9] overflow-hidden rounded-2xl shadow-sm sm:aspect-[16/7] lg:aspect-[16/5]">
                  <img
                    src={imageUrl}
                    alt={slide.DescImage || "بنر فروشگاه"}
                    className="absolute inset-0 size-full object-cover"
                    fetchPriority="high"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />

                  {/* لایه گرادیانی برای خوانایی نوشته */}
                  <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/30 to-transparent" />

                  <div className="relative z-10 flex h-full items-center">
                    <div className="max-w-[85%] space-y-3 px-5 py-6 text-white sm:max-w-[65%] sm:px-10 lg:max-w-[55%] lg:px-16">
                      {slide.DescImage && (
                        <h2 className="text-xl font-extrabold leading-relaxed drop-shadow sm:text-3xl lg:text-5xl">
                          {slide.DescImage}
                        </h2>
                      )}

                      {slide.Description && (
                        <p className="line-clamp-3 max-w-xl text-xs leading-6 text-white/90 sm:text-sm sm:leading-7 lg:text-base">
                          {slide.Description}
                        </p>
                      )}

                      {hasButton && (
                        <a
                          href={slide.UrlSend}
                          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
                        >
                          {slide.DescBut}
                          <ArrowUpLeft className="ms-2 size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {slides.length > 1 && (
          <>
            <CarouselPrevious
              aria-label="بنر قبلی"
              className="start-1 z-20 size-9 border-white/30 bg-background/80 shadow-lg backdrop-blur transition-opacity sm:size-11 sm:opacity-0 sm:group-hover:opacity-100"
            />

            <CarouselNext
              aria-label="بنر بعدی"
              className="end-1 z-20 size-9 border-white/30 bg-background/80 shadow-lg backdrop-blur transition-opacity sm:size-11 sm:opacity-0 sm:group-hover:opacity-100"
            />

            <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-2 sm:bottom-5">
              {slides.map((slide, index) => (
                <button
                  key={slide.RowID}
                  type="button"
                  aria-label={`رفتن به بنر ${index + 1}`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    selectedIndex === index
                      ? "w-8 bg-white shadow"
                      : "w-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </section>
  );
}

export default Slider;

import { useCallback, useEffect, useState } from "react";
import {
  LogOut,
  Search,
  Upload,
  Star,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  PackageSearch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";

import {
  deleteProductImage,
  getAdminProducts,
  setDefaultProductImage,
  setProductVisibility,
  uploadProductImages,
  type AdminProduct,
  type AdminProductsResult,
} from "@/features/admin/services/admin-products.api";

const initialResult: AdminProductsResult = {
  products: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

const money = new Intl.NumberFormat("fa-IR");

function imageUrl(url: string | null) {
  if (!url) return "";

  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function ProductCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminProductsPage() {
  const logout = useAuthStore((state: any) => state.logout);

  const [result, setResult] = useState(initialResult);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminProducts({
        search: search.trim() || undefined,
        visibility,
        page,
        limit: 20,
      });
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت فهرست کالاها ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, visibility, page]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function toggleVisibility(product: AdminProduct) {
    const actionKey = `visibility-${product.id}`;
    setBusyAction(actionKey);
    setError(null);
    setNotice(null);

    try {
      await setProductVisibility(product.id, !product.isVisible);
      setNotice(
        !product.isVisible
          ? "نمایش کالا در سایت فعال شد."
          : "نمایش کالا در سایت غیرفعال شد.",
      );
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت ناموفق بود.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUpload(
    product: AdminProduct,
    files: FileList | null,
    input: HTMLInputElement,
  ) {
    if (!files?.length) return;
    const selected = Array.from(files);

    if (selected.length > 10) {
      setError("حداکثر ۱۰ تصویر انتخاب کنید.");
      input.value = "";
      return;
    }

    const tooLarge = selected.find((file) => file.size > 8 * 1024 * 1024);
    if (tooLarge) {
      setError(`حجم تصویر «${tooLarge.name}» بیشتر از ۸ مگابایت است.`);
      input.value = "";
      return;
    }

    setBusyAction(`upload-${product.id}`);
    setError(null);
    setNotice(null);

    try {
      await uploadProductImages(product.id, selected);
      setNotice(
        `تصاویر «${product.name ?? product.code ?? product.id}» بارگذاری شدند.`,
      );
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "بارگذاری تصاویر ناموفق بود.",
      );
    } finally {
      setBusyAction(null);
      input.value = "";
    }
  }

  async function makeDefault(product: AdminProduct, imageId: number) {
    setBusyAction(`default-${imageId}`);
    setError(null);
    setNotice(null);

    try {
      await setDefaultProductImage(product.id, imageId);
      setNotice("تصویر پیش‌فرض تغییر کرد.");
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "تغییر تصویر پیش‌فرض ناموفق بود.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function removeImage(product: AdminProduct, imageId: number) {
    if (!window.confirm("از حذف این تصویر مطمئن هستید؟")) return;

    setBusyAction(`delete-${imageId}`);
    setError(null);
    setNotice(null);

    try {
      await deleteProductImage(product.id, imageId);
      setNotice("تصویر حذف شد.");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف تصویر ناموفق بود.");
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

  return (
    <main dir="rtl" className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-emerald-700">پنل مدیریت</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              مدیریت کالاها و تصاویر
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              اطلاعات کالا از سیستم حسابداری دریافت می‌شود.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => void loadProducts()}
              disabled={loading}
            >
              <RefreshCw
                className={`ml-2 size-4 ${loading ? "animate-spin" : ""}`}
              />
              بروزرسانی
            </Button>
            <Button variant="outline" onClick={() => void handleLogout()}>
              <LogOut className="ml-2 size-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <form
              onSubmit={handleSearch}
              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="جست‌وجو با نام یا کد کالا..."
                  className="h-11 pr-9"
                  aria-label="جست‌وجوی کالا"
                />
              </div>

              <Select
                value={visibility}
                onValueChange={(value) => {
                  setVisibility(value as typeof visibility);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11" aria-label="فیلتر وضعیت نمایش">
                  <SelectValue placeholder="وضعیت نمایش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه کالاها</SelectItem>
                  <SelectItem value="visible">نمایش در سایت فعال</SelectItem>
                  <SelectItem value="hidden">مخفی در سایت</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="h-11">
                <Search className="ml-2 size-4" />
                جست‌وجو
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                تعداد نتایج:{" "}
                <strong className="text-foreground">
                  {money.format(result.pagination.total)}
                </strong>
              </span>
              <span>
                صفحه {money.format(result.pagination.page)} از{" "}
                {money.format(result.pagination.totalPages)}
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {notice && (
          <Alert
            className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
            role="status"
          >
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <section className="space-y-4" aria-label="در حال بارگذاری کالاها">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </section>
        ) : result.products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <PackageSearch className="size-8 text-muted-foreground" />
              </div>
              <p className="font-semibold">کالایی پیدا نشد.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                عبارت جست‌وجو یا فیلتر نمایش را تغییر دهید.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="فهرست کالاها">
            {result.products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3 flex flex-wrap items-center gap-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base leading-7">
                        {product.name || product.alias || "بدون نام"}
                      </CardTitle>
                      <Badge variant="secondary">
                        کد: {product.code || "—"}
                      </Badge>
                      <Badge
                        variant={product.isActive ? "default" : "outline"}
                        className={
                          product.isActive
                            ? "bg-emerald-700 hover:bg-emerald-700"
                            : "border-amber-300 text-amber-700"
                        }
                      >
                        {product.isActive
                          ? "فعال در حسابداری"
                          : "غیرفعال در حسابداری"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      قیمت فروش:{" "}
                      <span className="font-semibold text-foreground">
                        {money.format(product.salePrice)}
                      </span>
                      {product.discountPrice != null &&
                        product.discountPrice > 0 && (
                          <span className="mr-3">
                            قیمت تخفیف:{" "}
                            <span className="font-semibold text-foreground">
                              {money.format(product.discountPrice)}
                            </span>
                          </span>
                        )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <Switch
                        id={`visibility-${product.id}`}
                        checked={product.isVisible}
                        onCheckedChange={() => void toggleVisibility(product)}
                        disabled={
                          busyAction === `visibility-${product.id}` ||
                          !product.isActive
                        }
                        aria-label={`تغییر نمایش ${product.name ?? product.code ?? product.id}`}
                      />
                      <Label
                        htmlFor={`visibility-${product.id}`}
                        className="cursor-pointer text-sm font-medium"
                      >
                        نمایش در سایت
                      </Label>
                      <Badge
                        variant={product.isVisible ? "default" : "secondary"}
                        className={
                          product.isVisible
                            ? "bg-emerald-700 hover:bg-emerald-700"
                            : ""
                        }
                      >
                        {product.isVisible ? "نمایش داده می‌شود" : "مخفی است"}
                      </Badge>
                      {!product.isActive && (
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          برای نمایش، ابتدا وضعیت فعال کالا در حسابداری بررسی
                          شود.
                        </p>
                      )}
                    </div>

                    <Button
                      className="relative w-full lg:w-auto mb-3"
                      disabled={busyAction === `upload-${product.id}`}
                    >
                      <Label className="flex cursor-pointer items-center justify-center gap-2">
                        <Upload className="size-4" />
                        {busyAction === `upload-${product.id}`
                          ? "در حال آپلود..."
                          : "افزودن تصاویر"}
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          multiple
                          className="absolute inset-0 cursor-pointer opacity-0"
                          disabled={busyAction === `upload-${product.id}`}
                          onChange={(event) => {
                            const input = event.currentTarget;
                            void handleUpload(product, input.files, input);
                          }}
                        />
                      </Label>
                    </Button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-3 bg-muted/20 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <ImageIcon className="size-4 text-muted-foreground" />
                      تصاویر کالا ({money.format(product.images.length)})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      هر تصویر حداکثر ۸ مگابایت؛ تا ۱۰ تصویر
                    </p>
                  </div>

                  {product.images.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-background px-4 py-10 text-center">
                      <ImageIcon className="mx-auto mb-2 size-7 text-muted-foreground/60" />
                      <p className="text-sm text-muted-foreground">
                        هنوز تصویری برای این کالا ثبت نشده است.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                      {product.images.map((image) => (
                        <Card
                          key={image.id}
                          className="overflow-hidden rounded-xl bg-background"
                        >
                          <div className="relative aspect-square bg-muted/50">
                            {image.url ? (
                              <img
                                src={imageUrl(image.url)}
                                alt={image.alt || product.name || "تصویر کالا"}
                                loading="lazy"
                                className="size-full object-contain p-2"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                تصویر در دسترس نیست
                              </div>
                            )}
                            {image.isDefault && (
                              <Badge className="absolute right-2 top-2 bg-emerald-700 hover:bg-emerald-700">
                                پیش‌فرض
                              </Badge>
                            )}
                          </div>
                          <CardContent className="space-y-2 p-2">
                            {!image.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={busyAction === `default-${image.id}`}
                                onClick={() =>
                                  void makeDefault(product, image.id)
                                }
                              >
                                <Star className="ml-1 size-3.5" />
                                پیش‌فرض کردن
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-destructive hover:text-destructive"
                              disabled={busyAction === `delete-${image.id}`}
                              onClick={() =>
                                void removeImage(product, image.id)
                              }
                            >
                              <Trash2 className="ml-1 size-3.5" />
                              حذف تصویر
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {!loading && result.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              قبلی
            </Button>
            <span className="text-sm text-muted-foreground">
              صفحه {money.format(page)} از{" "}
              {money.format(result.pagination.totalPages)}
            </span>
            <Button
              variant="outline"
              disabled={page >= result.pagination.totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(result.pagination.totalPages, current + 1),
                )
              }
            >
              بعدی
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

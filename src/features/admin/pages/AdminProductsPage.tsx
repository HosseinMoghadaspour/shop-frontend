
import { useCallback, useEffect, useState } from "react";
import { LogOut, Search, Upload, Star, Trash2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const baseUrl =
    import.meta.env.VITE_API_URL || window.location.origin;

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

export function AdminProductsPage() {
  const logout = useAuthStore((state) => state.logout);

  const [result, setResult] = useState(initialResult);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<
    "all" | "visible" | "hidden"
  >("all");
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
        err instanceof Error
          ? err.message
          : "دریافت فهرست کالاها ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, visibility, page]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function handleSearch(event: React.FormEvent) {
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
      setError("در هر بار حداکثر ۱۰ تصویر انتخاب کنید.");
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
      setNotice(`تصاویر «${product.name ?? product.code ?? product.id}» بارگذاری شدند.`);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری تصاویر ناموفق بود.");
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
      setError(err instanceof Error ? err.message : "تغییر تصویر پیش‌فرض ناموفق بود.");
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
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              پنل مدیریت
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">
              مدیریت کالاها و تصاویر
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              اطلاعات کالا از سیستم حسابداری دریافت می‌شود.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => void loadProducts()}
              disabled={loading}
            >
              <RefreshCw className="ml-2 size-4" />
              بروزرسانی
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="ml-2 size-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="جست‌وجو با نام یا کد کالا..."
                className="h-11 pr-9"
              />
            </div>

            <select
              value={visibility}
              onChange={(event) => {
                setVisibility(event.target.value as typeof visibility);
                setPage(1);
              }}
              className="h-11 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30"
              aria-label="فیلتر وضعیت نمایش"
            >
              <option value="all">همه کالاها</option>
              <option value="visible">نمایش در سایت فعال</option>
              <option value="hidden">مخفی در سایت</option>
            </select>

            <Button type="submit" className="h-11">
              جست‌وجو
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <span>
              تعداد نتایج: {money.format(result.pagination.total)}
            </span>
            <span>
              صفحه {money.format(result.pagination.page)} از{" "}
              {money.format(result.pagination.totalPages)}
            </span>
          </div>
        </section>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
            در حال دریافت کالاها...
          </div>
        ) : result.products.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="font-semibold">کالایی پیدا نشد.</p>
            <p className="mt-2 text-sm text-slate-500">
              عبارت جست‌وجو یا فیلتر نمایش را تغییر دهید.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {result.products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold">
                        {product.name || product.alias || "بدون نام"}
                      </h2>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        کد: {product.code || "—"}
                      </span>

                      <span
                        className={
                          product.isActive
                            ? "rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                            : "rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700"
                        }
                      >
                        {product.isActive ? "فعال در حسابداری" : "غیرفعال در حسابداری"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      قیمت فروش: {money.format(product.salePrice)}{" "}
                      {product.discountPrice != null &&
                        product.discountPrice > 0 && (
                          <span className="mr-2">
                            | قیمت تخفیف: {money.format(product.discountPrice)}
                          </span>
                        )}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium">
                        نمایش در سایت
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={product.isVisible}
                        aria-label={`تغییر نمایش ${product.name ?? product.code ?? product.id}`}
                        disabled={
                          busyAction === `visibility-${product.id}` ||
                          !product.isActive
                        }
                        onClick={() => void toggleVisibility(product)}
                        className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          product.isVisible ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
                            product.isVisible ? "right-1" : "right-6"
                          }`}
                        />
                      </button>

                      <span className="text-sm text-slate-500">
                        {product.isVisible ? "در سایت نمایش داده می‌شود" : "در سایت مخفی است"}
                      </span>

                      {!product.isActive && (
                        <span className="text-xs text-amber-700">
                          برای نمایش، ابتدا وضعیت فعال کالا در حسابداری بررسی شود.
                        </span>
                      )}
                    </div>
                  </div>

                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800">
                    <Upload className="size-4" />
                    {busyAction === `upload-${product.id}` ? "در حال آپلود..." : "افزودن تصاویر"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      className="sr-only"
                      disabled={busyAction === `upload-${product.id}`}
                      onChange={(event) => {
                        const input = event.currentTarget;
                        void handleUpload(product, input.files, input);
                      }}
                    />
                  </label>
                </div>

                <div className="border-t bg-slate-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold">
                      تصاویر کالا ({money.format(product.images.length)})
                    </h3>
                    <p className="text-xs text-slate-500">
                      هر تصویر حداکثر ۸ مگابایت؛ هر بار تا ۱۰ تصویر
                    </p>
                  </div>

                  {product.images.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white px-4 py-8 text-center text-sm text-slate-500">
                      هنوز تصویری برای این کالا ثبت نشده است.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                      {product.images.map((image) => (
                        <div
                          key={image.id}
                          className="overflow-hidden rounded-xl border bg-white"
                        >
                          <div className="relative aspect-square bg-slate-100">
                            {image.url ? (
                              <img
                                src={imageUrl(image.url)}
                                alt={image.alt || product.name || "تصویر کالا"}
                                loading="lazy"
                                className="size-full object-contain"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-xs text-slate-400">
                                تصویر در دسترس نیست
                              </div>
                            )}

                            {image.isDefault && (
                              <span className="absolute right-2 top-2 rounded-md bg-emerald-700 px-2 py-1 text-xs font-medium text-white">
                                پیش‌فرض
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 p-2">
                            {!image.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={busyAction === `default-${image.id}`}
                                onClick={() => void makeDefault(product, image.id)}
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
                              onClick={() => void removeImage(product, image.id)}
                            >
                              <Trash2 className="ml-1 size-3.5" />
                              حذف تصویر
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && result.pagination.totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3" aria-label="صفحه‌بندی کالاها">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              قبلی
            </Button>
            <span className="text-sm text-slate-600">
              صفحه {money.format(page)} از {money.format(result.pagination.totalPages)}
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
          </nav>
        )}
      </div>
    </main>
  );
}

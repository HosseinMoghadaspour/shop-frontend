
import { getFooter } from "@/services/footer.api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  MessageCircleHeart,
  Send,
  MessageCircle,
  MapPin,
  Phone,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { getApiAssetUrl } from "@/lib/api-url";

export function Footer() {
  const footerQuery = useQuery({
    queryKey: ["footer"],
    queryFn: getFooter,
    staleTime: 1000 * 60 * 30,
  });

  const footer = footerQuery.data;

  if (footerQuery.isLoading) {
    return (
      <footer className="mt-16 animate-pulse bg-blue-50">
        <div className="mx-auto max-w-[1440px] px-4 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-white"
              />
            ))}
          </div>
        </div>
      </footer>
    );
  }

  if (!footer) return null;

  const socialLinks = [
    {
      title: "اینستاگرام",
      handle: footer.InstagramHandle,
      icon: Send,
      url: footer.InstagramHandle
        ? `https://instagram.com/${footer.InstagramHandle}`
        : null,
    },
    {
      title: "تلگرام",
      handle: footer.TelegramHandle,
      icon: Send,
      url: footer.TelegramHandle
        ? `https://t.me/${footer.TelegramHandle}`
        : null,
    },
    {
      title: "واتساپ",
      handle: footer.WhatsAppHandle,
      icon: MessageCircle,
      url: footer.WhatsAppHandle
        ? `https://wa.me/${footer.WhatsAppHandle}`
        : null,
    },
    {
      title: "ایتا",
      handle: footer.EtaHandle,
      icon: Send,
      url: footer.EtaHandle
        ? `https://eitaa.com/${footer.EtaHandle}`
        : null,
    },
    {
      title: "روبیکا",
      handle: footer.Rubikahandle,
      icon: MessageCircleHeart,
      url: footer.Rubikahandle
        ? `https://rubika.ir/${footer.Rubikahandle}`
        : null,
    },
  ].filter((item) => item.url);

  const logoUrl = footer.LogoImageUrl
    ? getApiAssetUrl(footer.LogoImageUrl)
    : null;

  const enamadUrl = footer.EnamadImageUrl
    ? getApiAssetUrl(footer.EnamadImageUrl)
    : null;

  const samandehiUrl = footer.SamandehiUrl
    ? getApiAssetUrl(footer.SamandehiUrl)
    : null;

  const reziUrl = footer.ReziImageUrl
    ? getApiAssetUrl(footer.ReziImageUrl)
    : null;

  const quickLinks = [
    { title: "صفحه اصلی", to: "/" },
    { title: "همه محصولات", to: "/products" },
    { title: "پیگیری سفارش", to: "/orders" },
    { title: "سبد خرید", to: "/cart" },
    { title: "حساب کاربری", to: "/profile" },
    ...(footer.LinkAboutUs
      ? [{ title: "درباره ما", to: footer.LinkAboutUs }]
      : []),
    ...(footer.LinkContactUs
      ? [{ title: "تماس با ما", to: footer.LinkContactUs }]
      : []),
  ];

  return (
    <footer
      id="contact"
      className="relative mt-16 overflow-hidden border-t border-blue-100 bg-gradient-to-b from-white to-blue-50/70"
    >
      {/* تزئین پس زمینه */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-80 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        {/* بخش اصلی فوتر */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12 lg:py-16">

          {/* معرفی فروشگاه */}
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="mb-6 flex w-fit items-center gap-3"
            >
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={footer.SiteName || ""}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <img
                    src="/adinaLogo.png"
                    alt={footer.SiteName || ""}
                    className="h-10 w-10 object-contain"
                  />
                )}
              </div>

              <div>
                <span className="block text-lg font-black text-blue-950">
                  {footer.SiteName}
                </span>
                <span className="mt-1 block text-xs text-blue-500">
                  خرید آسان، مطمئن و سریع
                </span>
              </div>
            </Link>

            <p className="max-w-md whitespace-pre-line text-sm leading-8 text-slate-600">
              {footer.AboutText}
            </p>

            {/* شبکه های اجتماعی */}
            {socialLinks.length > 0 && (
              <div className="mt-7">
                <h3 className="mb-4 text-sm font-bold text-blue-950">
                  در شبکه‌های اجتماعی همراه ما باشید
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={item.title}
                        href={item.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.title}
                        aria-label={item.title}
                        className="group flex size-11 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0033ff] hover:bg-[#0033ff] hover:text-white hover:shadow-lg hover:shadow-blue-200"
                      >
                        <Icon className="size-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* لینک ها */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 flex items-center gap-2 text-base font-extrabold text-blue-950">
              <span className="h-5 w-1 rounded-full bg-[#0033ff]" />
              دسترسی سریع
            </h2>

            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#0033ff]"
                  >
                    <ArrowLeft className="size-3.5 text-blue-300 transition-transform group-hover:-translate-x-1 group-hover:text-[#0033ff]" />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ارتباط با ما */}
          <div className="lg:col-span-3">
            <h2 className="mb-6 flex items-center gap-2 text-base font-extrabold text-blue-950">
              <span className="h-5 w-1 rounded-full bg-[#0033ff]" />
              ارتباط با ما
            </h2>

            <div className="space-y-4">
              {footer.Phone1 && (
                <a
                  href={`tel:${footer.Phone1}`}
                  className="group flex items-center gap-3 rounded-xl border border-blue-100/70 bg-white/80 p-3 transition-all hover:border-blue-200 hover:shadow-sm"
                  dir="rtl"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0033ff]">
                    <Phone className="size-5" />
                  </div>

                  <div>
                    <span className="mb-1 block text-xs text-slate-400">
                      شماره تماس
                    </span>
                    <span className="text-sm font-bold text-blue-950">
                      {footer.Phone1}
                    </span>
                  </div>
                </a>
              )}

              {footer.Phone2 && (
                <a
                  href={`tel:${footer.Phone2}`}
                  className="group flex items-center gap-3 rounded-xl border border-blue-100/70 bg-white/80 p-3 transition-all hover:border-blue-200 hover:shadow-sm"
                  dir="rtl"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0033ff]">
                    <Phone className="size-5" />
                  </div>

                  <div>
                    <span className="mb-1 block text-xs text-slate-400">
                      شماره تماس دوم
                    </span>
                    <span className="text-sm font-bold text-blue-950">
                      {footer.Phone2}
                    </span>
                  </div>
                </a>
              )}

              {footer.Address && (
                <div className="flex items-start gap-3 rounded-xl border border-blue-100/70 bg-white/80 p-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0033ff]">
                    <MapPin className="size-5" />
                  </div>

                  <div>
                    <span className="mb-1 block text-xs text-slate-400">
                      آدرس
                    </span>
                    <span className="whitespace-pre-line text-sm leading-7 text-blue-950">
                      {footer.Address}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* نمادهای اعتماد */}
          <div className="lg:col-span-3">
            <h2 className="mb-6 flex items-center gap-2 text-base font-extrabold text-blue-950">
              <span className="h-5 w-1 rounded-full bg-[#0033ff]" />
              نمادهای اعتماد
            </h2>

            <div className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-center gap-4">

                {enamadUrl && (
                  <a
                    href={footer.EnamadImageUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-24 items-center justify-center rounded-xl border border-slate-100 bg-white p-3 transition hover:shadow-md"
                  >
                    <img
                      src={enamadUrl}
                      alt="نماد اعتماد الکترونیکی"
                      className="max-h-full max-w-full object-contain"
                    />
                  </a>
                )}

                {samandehiUrl && (
                  <a
                    href={footer.SamandehiUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-24 items-center justify-center rounded-xl border border-slate-100 bg-white p-3 transition hover:shadow-md"
                  >
                    <img
                      src={samandehiUrl}
                      alt="نماد ساماندهی"
                      className="max-h-full max-w-full object-contain"
                    />
                  </a>
                )}

                {reziUrl && (
                  <div className="flex size-24 items-center justify-center rounded-xl border border-slate-100 bg-white p-3">
                    <img
                      src={reziUrl}
                      alt="نماد رضایت"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                {!enamadUrl && !samandehiUrl && !reziUrl && (
                  <div className="py-4 text-center">
                    <ShieldCheck className="mx-auto mb-3 size-10 text-blue-200" />
                    <p className="text-sm text-slate-400">
                      اطلاعات نمادهای اعتماد در دسترس نیست
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs leading-6 text-slate-500">
                خرید امن و آسوده را با ما تجربه کنید
              </p>
            </div>
          </div>
        </div>

        {/* نوار پایین */}
        <div className="border-t border-blue-100 py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-right">
            <p className="text-xs leading-6 text-slate-500">
              {footer.Copyright}
            </p>

            <div className="flex items-center gap-2 text-xs text-blue-600">
              <ShieldCheck className="size-4" />
              <span>تجربه خرید امن و آسان</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

import { getFooter } from "@/services/footer.api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  MessageCircleHeart,
  Send,
  MessageCircle,
  MapPin,
  Phone,
  ExternalLink,
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
      <footer className="mt-16 h-64 animate-pulse bg-[#AEDBC9]" />
    );
  }

  if (!footer) return null;

  const socialLinks = [
    {
      title: "اینستاگرام",
      handle: footer.InstagramHandle,
      icon: MessageCircleHeart ,
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
      icon: MessageCircle,
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

  return (
    <footer className="mt-16 border-t border-emerald-950/10 bg-[#AEDBC9]">
      <div className="mx-auto max-w-7xl px-4 py-12">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">

          {/* معرفی سایت */}
          <div>
            <Link
              to="/"
              className="mb-5 flex w-fit items-center gap-3 text-lg font-extrabold text-primary"
            >
              <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={footer.SiteName || ""}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src="/adinaLogo.png"
                    alt={footer.SiteName || ""}
                    className="h-7 w-7 object-contain"
                  />
                )}
              </span>

              {footer.SiteName}
            </Link>

            <p className="max-w-sm whitespace-pre-line text-sm leading-8 text-emerald-950/70">
              {footer.AboutText}
            </p>
          </div>

          {/* دسترسی سریع */}
          <div>
            <h2 className="mb-5 font-bold text-emerald-950">
              دسترسی سریع
            </h2>

            <div className="flex flex-col gap-4 text-sm text-emerald-950/70">
              <Link to="/" className="transition hover:text-primary">
                صفحه اصلی
              </Link>

              <Link to="/products" className="transition hover:text-primary">
                همه محصولات
              </Link>

              <Link to="/orders" className="transition hover:text-primary">
                پیگیری سفارش
              </Link>

              <Link to="/cart" className="transition hover:text-primary">
                سبد خرید
              </Link>

              <Link to="/profile" className="transition hover:text-primary">
                حساب کاربری
              </Link>

              {footer.LinkAboutUs && (
                <Link
                  to={footer.LinkAboutUs}
                  className="transition hover:text-primary"
                >
                  درباره ما
                </Link>
              )}

              {footer.LinkContactUs && (
                <Link
                  to={footer.LinkContactUs}
                  className="transition hover:text-primary"
                >
                  تماس با ما
                </Link>
              )}
            </div>
          </div>

          {/* ارتباط با ما */}
          <div>
            <h2 className="mb-5 font-bold text-emerald-950">
              ارتباط با ما
            </h2>

            <div className="flex flex-col gap-4 text-sm text-emerald-950/70">

              {footer.Phone1 && (
                <a
                  href={`tel:${footer.Phone1}`}
                  className="flex items-center gap-2 transition hover:text-primary"
                  dir="rtl"
                >
                  <Phone className="size-4 shrink-0" />
                  <span>{footer.Phone1}</span>
                </a>
              )}

              {footer.Phone2 && (
                <a
                  href={`tel:${footer.Phone2}`}
                  className="flex items-center gap-2 transition hover:text-primary"
                  dir="rtl"
                >
                  <Phone className="size-4 shrink-0" />
                  <span>{footer.Phone2}</span>
                </a>
              )}

              {footer.Address && (
                <div className="flex items-start gap-2 leading-7">
                  <MapPin className="mt-1 size-4 shrink-0" />
                  <span className="whitespace-pre-line">
                    {footer.Address}
                  </span>
                </div>
              )}

            </div>

            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-emerald-950">
                  ما را دنبال کنید
                </h3>

                <div className="flex flex-wrap gap-2">
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
                        className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-emerald-900 transition hover:bg-primary hover:text-white"
                      >
                        <Icon className="size-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* نمادهای اعتماد */}
          <div>
            <h2 className="mb-5 font-bold text-emerald-950">
              نمادهای اعتماد
            </h2>

            <div className="flex flex-wrap items-center gap-3">

              {enamadUrl && (
                <a
                  href={footer.EnamadImageUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-24 w-24 items-center justify-center rounded-xl bg-white p-3"
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
                  className="flex h-24 w-24 items-center justify-center rounded-xl bg-white p-3"
                >
                  <img
                    src={samandehiUrl}
                    alt="نماد ساماندهی"
                    className="max-h-full max-w-full object-contain"
                  />
                </a>
              )}

              {reziUrl && (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white p-3">
                  <img
                    src={reziUrl}
                    alt="نماد رضایت"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* کپی رایت */}
        <div className="mt-10 gap-3 border-t border-emerald-950/10 pt-6 text-center text-xs sm:flex-row sm:items-center ">
          <span>
            {footer.Copyright}
          </span>
        </div>

      </div>
    </footer>
  );
}

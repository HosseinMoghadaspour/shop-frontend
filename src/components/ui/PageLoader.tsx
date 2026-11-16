import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({
  label = "در حال بارگذاری صفحه...",
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      dir="rtl"
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-white/90 px-5 backdrop-blur-md"
    >
      <div className="flex flex-col items-center">
        <div className="relative flex size-32 items-center justify-center">
          <span className="absolute inset-1 rounded-full border-2 border-emerald-100" />
          <span className="adina-loader__orbit absolute inset-1 rounded-full border-[3px] border-transparent border-t-emerald-700 border-l-emerald-300" />
          <span className="adina-loader__glow absolute inset-5 rounded-[2rem] bg-emerald-100/70 blur-xl" />
          <span className="adina-loader__logo-wrap relative flex size-[5.25rem] items-center justify-center rounded-[1.65rem] border border-emerald-100/80 bg-white p-3 shadow-[0_12px_35px_rgba(16,91,67,0.14)]">
            <img
              src="/adinaLogo.png"
              alt="لوگوی آدینامارکت"
              className="adina-loader__logo h-full w-full object-contain"
              fetchPriority="high"
            />
          </span>
        </div>

        <p className="mt-4 text-base font-black tracking-tight text-emerald-950">
          آدینامارکت
        </p>
        <p className="mt-1.5 text-xs font-medium text-emerald-900/55">
          {label}
        </p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          <span className="adina-loader__dot size-1.5 rounded-full bg-emerald-700" />
          <span className="adina-loader__dot adina-loader__dot--delay-1 size-1.5 rounded-full bg-emerald-600" />
          <span className="adina-loader__dot adina-loader__dot--delay-2 size-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

export function RouteLoadingOverlay() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timeoutId = window.setTimeout(() => setVisible(false), 420);

    return () => window.clearTimeout(timeoutId);
  }, [location.key]);

  return visible ? <PageLoader label="در حال آماده‌سازی صفحه..." /> : null;
}

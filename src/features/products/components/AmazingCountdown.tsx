import { useEffect, useState } from "react";
import { Flame, Sparkles, Zap } from "lucide-react";

const DAY = 24 * 60 * 60 * 1000;

const STORAGE_KEY = "amazing-offer-end";

export function AmazingCountdown() {
  const [remaining, setRemaining] = useState(DAY);

  useEffect(() => {
    const now = Date.now();
    const saved = Number(localStorage.getItem(STORAGE_KEY));

    let endTime = saved;

    if (!saved || !Number.isFinite(saved)) {
      endTime = now + DAY;
    } else if (now >= saved) {
      endTime = saved + (Math.floor((now - saved) / DAY) + 1) * DAY;
    }

    localStorage.setItem(STORAGE_KEY, String(endTime));

    const update = () => {
      const current = Date.now();

      if (current >= endTime) {
        endTime += (Math.floor((current - endTime) / DAY) + 1) * DAY;
        localStorage.setItem(STORAGE_KEY, String(endTime));
      }

      setRemaining(endTime - current);
    };

    update();
    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const format = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="relative isolate overflow-hidden rounded-3xl text-rose-600 bg-rose-200 border- p-3">
      {/* <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-rose-400/20 blur-3xl" /> */}

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* تایمر */}
        <div className="shrink-0">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold ">
            <Zap className="size-4" />
            زمان باقی‌مانده
          </div>

          <div
            dir="ltr"
            className="flex items-center justify-center gap-2 sm:gap-3"
          >
            {[
              { value: hours, label: "ساعت" },
              { value: minutes, label: "دقیقه" },
              { value: seconds, label: "ثانیه" },
            ].map((item, index) => (
              <div
                key={item.label}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="flex min-w-[65px] flex-col items-center rounded-2xl border border-white/20 bg-white/15 px-2 py-1 sm:min-w-[60px]">
                  <span className="font-mono text-xl font-black tabular-nums">
                    {format(item.value)}
                  </span>
                  <span className="text-xs font-bold">
                    {item.label}
                  </span>
                </div>

                {index !== 2 && (
                  <span className="text-sm font-black">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

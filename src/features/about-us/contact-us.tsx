
import { useState, type FormEvent } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Headset,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

interface ContactForm {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

const contactMethods = [
  {
    icon: Phone,
    title: "تماس تلفنی",
    value: "021-12345678",
    description: "پاسخگویی در ساعات کاری",
    href: "tel:02112345678",
  },
  {
    icon: Mail,
    title: "ایمیل",
    value: "info@example.com",
    description: "ارتباط از طریق ایمیل",
    href: "mailto:info@example.com",
  },
  {
    icon: MapPin,
    title: "آدرس فروشگاه",
    value: "آدرس فروشگاه شما",
    description: "مشتاق دیدار شما هستیم",
    href: undefined,
  },
];

const initialForm: ContactForm = {
  name: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactUs() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^09\d{9}$/.test(form.phone)) {
      alert("شماره موبایل معتبر وارد کنید.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: اتصال به API ارسال پیام تماس با ما

      console.log("Contact form:", form);

      setIsSubmitted(true);
      setForm(initialForm);
    } catch {
      alert("ارسال پیام با خطا مواجه شد. لطفاً مجدداً تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8faf9]">

      {/* Contact methods */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactMethods.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#16805e] transition group-hover:bg-[#103d32] group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800">
                      {item.title}
                    </h3>

                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-2 block truncate text-sm font-bold text-[#16805e]"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm font-bold text-gray-800">
                        {item.value}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-12">

          {/* Form */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9 lg:col-span-7">
            <div className="mb-8">
              <span className="text-xs font-bold text-[#16805e]">
                ارسال درخواست
              </span>

              <h2 className="mt-3 text-2xl font-black text-gray-900">
                با ما در ارتباط باشید
              </h2>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                اطلاعات خود را وارد کنید تا کارشناسان ما در اولین فرصت
                با شما تماس بگیرند.
              </p>
            </div>

            {isSubmitted ? (
              <div className="rounded-2xl bg-emerald-50 px-5 py-12 text-center">
                <CheckCircle2
                  size={48}
                  className="mx-auto text-emerald-600"
                />

                <h3 className="mt-5 text-lg font-black text-gray-900">
                  پیام شما با موفقیت ثبت شد
                </h3>

                <p className="mt-3 text-sm text-gray-500">
                  از ارتباط شما سپاسگزاریم.
                </p>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-sm font-bold text-[#16805e] hover:underline"
                >
                  ارسال پیام جدید
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      نام و نام خانوادگی
                      <span className="text-red-500"> *</span>
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      placeholder="نام خود را وارد کنید"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16805e] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      شماره موبایل
                      <span className="text-red-500"> *</span>
                    </label>

                    <input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      dir="ltr"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      maxLength={11}
                      placeholder="09123456789"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16805e] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    موضوع پیام
                  </label>

                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="موضوع درخواست شما"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16805e] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    متن پیام
                    <span className="text-red-500"> *</span>
                  </label>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={5}
                    placeholder="پیام خود را اینجا بنویسید..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-7 outline-none transition placeholder:text-gray-400 focus:border-[#16805e] focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />

                  <div className="mt-2 text-left text-xs text-gray-400">
                    {form.message.length} / 2000
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#103d32] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#16805e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isLoading ? "در حال ارسال..." : "ارسال پیام"}

                  <Send size={17} />
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:col-span-5">

            {/* Support box */}
            <div className="relative overflow-hidden rounded-3xl bg-[#103d32] p-7 text-white sm:p-8">
              <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/[0.04]" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                  <Headset size={28} />
                </div>

                <h3 className="mt-6 text-xl font-black">
                  نیاز به راهنمایی دارید؟
                </h3>

                <p className="mt-4 text-sm leading-8 text-white/65">
                  برای مشاوره خرید، پیگیری سفارش یا دریافت اطلاعات
                  بیشتر درباره محصولات، با کارشناسان فروشگاه تماس بگیرید.
                </p>

                <a
                  href="tel:02112345678"
                  className="mt-7 flex items-center justify-between rounded-xl bg-white/10 px-5 py-4 transition hover:bg-white/20"
                >
                  <span className="text-sm font-bold">
                    تماس با پشتیبانی
                  </span>
                  <ArrowLeft size={19} />
                </a>
              </div>
            </div>

            {/* Working hours */}
            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#16805e]">
                  <Clock size={22} />
                </div>

                <h3 className="font-black text-gray-900">
                  ساعات پاسخگویی
                </h3>
              </div>

              <div className="mt-7 space-y-5">
                {[
                  ["شنبه تا چهارشنبه", "۹:۰۰ تا ۱۸:۰۰"],
                  ["پنجشنبه", "۹:۰۰ تا ۱۴:۰۰"],
                  ["جمعه و تعطیلات", "تعطیل"],
                ].map(([day, time]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-500">{day}</span>

                    <span
                      className={`font-bold ${
                        time === "تعطیل"
                          ? "text-red-500"
                          : "text-gray-800"
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
              <h3 className="font-black text-gray-900">
                ما را در شبکه‌های اجتماعی دنبال کنید
              </h3>

              <div className="mt-5 flex gap-3">
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="اینستاگرام"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition hover:bg-emerald-50 hover:text-[#16805e]"
                >
                  {/* <Instagram size={22} /> */}
                </a>

                <a
                  href="mailto:info@example.com"
                  aria-label="ایمیل"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition hover:bg-emerald-50 hover:text-[#16805e]"
                >
                  <Mail size={22} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

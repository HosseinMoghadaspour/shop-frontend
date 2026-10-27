import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Outlet } from "react-router-dom";

export function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col text-foreground bg-[#EDF7F3]">
      <Header />
      <main className="mx-auto w-full max-w-[1000px] flex-1 p-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

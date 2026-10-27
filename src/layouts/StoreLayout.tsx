import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Outlet } from "react-router-dom";

export function StoreLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-foreground md:px-4 md:py-6">
      <div className="@container mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background shadow-xl md:min-h-[calc(100vh-3rem)] md:overflow-hidden md:rounded-2xl md:ring-1 md:ring-slate-200">
        <Header />
        <main className="w-full min-w-0 flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

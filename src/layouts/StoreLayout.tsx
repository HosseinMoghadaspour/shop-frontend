import { Header } from "@/components/layout/Header";
import { Outlet } from "react-router-dom";

export function StoreLayout() {
  return (
    <div className="flex min-h-scren flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer />
    </div>
  );
}


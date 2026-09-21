import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, UserRound } from "lucide-react";

const navItems = [
  {
    to: "/",
    label: "خانه",
    end: true,
  },
  {
    to: "/products",
    label: "محصولات",
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl font-bold"
          aria-label="صفحه اصلی فروشگاه"
        >
          فروشگاه
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "text-sm trnansition-colors",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join("")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 item-center justify-center rounded-md hover:bg-muted"
            aria-label="سبد خرید"
          >
            <ShoppingCart className="h-5 w-5 mt-3" />
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              0
            </span>
          </Link>

          <Link
            to="/auth/login"
            className="flex h-10 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted"
          >
            <UserRound className="h-5 w-5" />
            <span className="hidden sm:inline">ورود</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

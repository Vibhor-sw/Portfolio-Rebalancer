import { NavLink } from "react-router-dom";
import { LayoutDashboard, SlidersHorizontal, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/optimizer", label: "Optimizer", icon: SlidersHorizontal },
  { to: "/how-it-works", label: "How It Works", icon: BookOpen },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 h-16 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur">
      <div className="grid h-full grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5", isActive && "fill-accent")} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

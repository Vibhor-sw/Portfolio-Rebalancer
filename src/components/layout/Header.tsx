import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { USER_PROFILE } from "@/lib/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SideDrawer } from "./SideDrawer";

export function Header() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const firstName = USER_PROFILE.name.split(" ")[0];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="rounded-md p-1.5 hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold leading-tight">Hey {firstName}</p>
          <p className="text-[11px] text-muted-foreground">Portfolio Rebalancer</p>
        </div>
        <button onClick={() => navigate("/settings")} aria-label="Settings">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{USER_PROFILE.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </header>
      <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

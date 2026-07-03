import { useNavigate } from "react-router-dom";
import { USER_PROFILE } from "@/lib/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const navigate = useNavigate();
  const firstName = USER_PROFILE.name.split(" ")[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div>
        <p className="text-sm font-semibold leading-tight">Hey {firstName}</p>
        <p className="text-[11px] text-muted-foreground">Portfolio Rebalancer</p>
      </div>
      <button onClick={() => navigate("/settings")} aria-label="Settings">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{USER_PROFILE.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </button>
    </header>
  );
}

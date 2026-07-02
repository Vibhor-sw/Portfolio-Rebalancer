import { TrendingUp, TrendingDown } from "lucide-react";
import { MARKET_INDICES } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function MarketTicker() {
  const items = [...MARKET_INDICES, ...MARKET_INDICES];

  return (
    <div className="sticky top-[57px] z-20 overflow-hidden border-b border-border bg-secondary/60 py-1.5">
      <div className="flex w-max animate-ticker gap-6 whitespace-nowrap px-4">
        {items.map((idx, i) => {
          const positive = idx.changePercent >= 0;
          return (
            <div key={`${idx.name}-${i}`} className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold">{idx.name}</span>
              <span className="text-muted-foreground">{idx.value.toLocaleString("en-IN")}</span>
              <span className={cn("flex items-center gap-0.5 font-medium", positive ? "text-success" : "text-destructive")}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? "+" : ""}
                {idx.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

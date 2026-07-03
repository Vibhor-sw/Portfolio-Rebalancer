import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Recommendation } from "@/lib/types";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface RecommendationItemProps {
  reco: Recommendation;
  onAdjust: (delta: number) => void;
}

const ACTION_STYLES: Record<string, string> = {
  BUY: "text-success",
  SELL: "text-destructive",
  HOLD: "text-muted-foreground",
};

export function RecommendationItem({ reco, onAdjust }: RecommendationItemProps) {
  const currentQty = reco.kind === "stock" ? reco.currentQty : reco.currentUnits;
  const newQty = reco.kind === "stock" ? reco.newQty : reco.newUnits;
  const price = reco.kind === "stock" ? reco.ltp : reco.nav;
  const currentValue = currentQty * price;
  const newValue = newQty * price;
  const step = reco.kind === "stock" ? 1 : Math.max(1, Math.round(currentQty * 0.01)) || 1;
  const delta = newQty - currentQty;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className={cn("text-sm font-medium", ACTION_STYLES[reco.action])}>
            {reco.name} {reco.external && <Badge variant="secondary" className="ml-1 px-1 py-0 text-[9px]">External</Badge>}
          </p>
          <p className="text-[11px] text-muted-foreground">{reco.symbol}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAdjust(-step)}
            disabled={newQty <= 0}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border disabled:opacity-30"
          >
            <Minus className="h-3 w-3" />
          </button>
          {delta !== 0 && (
            <span className={cn("min-w-[24px] text-center text-xs font-semibold", delta > 0 ? "text-success" : "text-destructive")}>
              {delta > 0 ? "+" : ""}
              {reco.kind === "stock" ? delta : delta.toFixed(2)}
            </span>
          )}
          <button onClick={() => onAdjust(step)} className="flex h-6 w-6 items-center justify-center rounded-full border border-border">
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <p className="text-muted-foreground">Qty</p>
          <p className="font-medium">
            {currentQty} → {newQty}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Value</p>
          <p className="font-medium">
            {formatCurrency(currentValue)} → {formatCurrency(newValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Allocation%</p>
          <p className={cn("font-medium", ACTION_STYLES[reco.action])}>
            {formatPercent(reco.currentAllocation)} → {formatPercent(reco.newAllocation)}
          </p>
        </div>
      </div>
    </div>
  );
}

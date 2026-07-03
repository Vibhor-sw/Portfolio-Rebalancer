import { Card, CardContent } from "@/components/ui/card";
import type { Recommendation } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface AllocationSummaryProps {
  recommendations: Recommendation[];
  totalPool: number;
}

function valueOf(r: Recommendation) {
  const qty = r.kind === "stock" ? r.newQty : r.newUnits;
  const price = r.kind === "stock" ? r.ltp : r.nav;
  return qty * price;
}

export function AllocationSummary({ recommendations, totalPool }: AllocationSummaryProps) {
  const buyValue = recommendations.filter((r) => r.action === "BUY").reduce((s, r) => s + valueOf(r), 0);
  const sellValue = recommendations.filter((r) => r.action === "SELL").reduce((s, r) => s + valueOf(r), 0);
  const holdValue = recommendations.filter((r) => r.action === "HOLD").reduce((s, r) => s + valueOf(r), 0);
  const available = Math.max(0, totalPool - buyValue - sellValue - holdValue);

  const pct = (v: number) => (totalPool ? (v / totalPool) * 100 : 0);

  return (
    <Card>
      <CardContent className="space-y-2 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available for Utilizing:</span>
          <span className="font-semibold text-success">
            {formatCurrency(available)} ({formatPercent(pct(available))})
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Buy: <span className="font-medium text-success">{formatPercent(pct(buyValue))}</span>
          </span>
          <span>
            Sell: <span className="font-medium text-destructive">{formatPercent(pct(sellValue))}</span>
          </span>
          <span>
            Hold: <span className="font-medium text-foreground">{formatPercent(pct(holdValue))}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

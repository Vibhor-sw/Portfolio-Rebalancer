import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

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

  const segments = [
    { label: "Buy", value: buyValue, color: "bg-success" },
    { label: "Sell", value: sellValue, color: "bg-destructive" },
    { label: "Hold", value: holdValue, color: "bg-muted-foreground" },
    { label: "Available", value: available, color: "bg-warning" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Allocation Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-lg font-bold">{formatCurrency(available)}</p>
          <p className="text-xs text-muted-foreground">Available for Utilization</p>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          {segments.map((s) => (
            <div key={s.label} className={s.color} style={{ width: `${pct(s.value)}%` }} title={`${s.label}: ${pct(s.value).toFixed(1)}%`} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
          {segments.map((s) => (
            <div key={s.label}>
              <p className="font-semibold">{pct(s.value).toFixed(0)}%</p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

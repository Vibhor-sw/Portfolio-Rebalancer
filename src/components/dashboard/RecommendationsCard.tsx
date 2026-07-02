import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StockHolding, MutualFundHolding, InvestmentModel } from "@/lib/types";
import { generateRecommendations } from "@/lib/portfolio";
import { useExternalInvestment } from "@/contexts/ExternalInvestmentContext";
import { cn } from "@/lib/utils";

interface RecommendationsCardProps {
  stocks: StockHolding[];
  mutualFunds: MutualFundHolding[];
  model: InvestmentModel;
  onOptimize: () => void;
}

interface DisplayItem {
  name: string;
  typeLabel: string;
  external?: boolean;
}

const SECTION_STYLES: Record<string, string> = {
  BUY: "text-success",
  SELL: "text-destructive",
  HOLD: "text-muted-foreground",
};

export function RecommendationsCard({ stocks, mutualFunds, model, onOptimize }: RecommendationsCardProps) {
  const { hasFetched, includeExternal, investments } = useExternalInvestment();
  const { stockRecos, mfRecos } = generateRecommendations(stocks, mutualFunds, model);
  const all = [...stockRecos, ...mfRecos];

  const toDisplay = (r: (typeof all)[number]): DisplayItem => ({
    name: r.name,
    typeLabel: r.kind === "stock" ? "Stock" : r.category,
  });

  const externalSells: DisplayItem[] =
    hasFetched && includeExternal
      ? investments.slice(0, 2).map((inv) => ({ name: inv.name, typeLabel: inv.type, external: true }))
      : [];

  const buy = all.filter((r) => r.action === "BUY").slice(0, 3).map(toDisplay);
  const sell = [...all.filter((r) => r.action === "SELL").slice(0, 2).map(toDisplay), ...externalSells];
  const hold = all.filter((r) => r.action === "HOLD").slice(0, 3).map(toDisplay);

  const sections: [string, DisplayItem[]][] = [
    ["BUY", buy],
    ["SELL", sell],
    ["HOLD", hold],
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Optimizer Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(([label, items]) => (
          <div key={label}>
            <p className={cn("mb-1.5 text-xs font-semibold uppercase tracking-wide", SECTION_STYLES[label])}>{label}</p>
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing here right now.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, idx) => (
                  <Badge key={`${label}-${idx}`} variant="outline" className="gap-1.5 py-1">
                    {item.name}
                    <span className="text-[10px] text-muted-foreground">{item.typeLabel}</span>
                    {item.external && (
                      <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                        External
                      </Badge>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}

        <Button className="w-full" onClick={onOptimize}>
          Optimize My Portfolio
        </Button>
      </CardContent>
    </Card>
  );
}

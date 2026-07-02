import * as React from "react";
import { Info, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { useExternalInvestment } from "@/contexts/ExternalInvestmentContext";

interface PortfolioSummaryCardProps {
  currentValue: number;
  investedValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  todaysChange: number;
  todaysChangePercent: number;
  onOpenDrilldown: () => void;
  externalToggleDisabled?: boolean;
}

export function PortfolioSummaryCard({
  currentValue,
  investedValue,
  unrealizedPL,
  unrealizedPLPercent,
  todaysChange,
  todaysChangePercent,
  onOpenDrilldown,
  externalToggleDisabled,
}: PortfolioSummaryCardProps) {
  const [view, setView] = React.useState<"today" | "total">("total");
  const { hasFetched, includeExternal, setIncludeExternal } = useExternalInvestment();

  const plValue = view === "today" ? todaysChange : unrealizedPL;
  const plPercent = view === "today" ? todaysChangePercent : unrealizedPLPercent;
  const isPositive = plValue >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle>Equity Portfolio</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <button aria-label="Info" className="text-muted-foreground hover:text-foreground">
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              Values include Stocks and all Equity Mutual Fund categories: Large Cap, Mid Cap, Small Cap, and Flexi Cap.
            </PopoverContent>
          </Popover>
        </div>
        <button onClick={onOpenDrilldown} aria-label="View breakdown" className="text-muted-foreground hover:text-primary">
          <PieChartIcon className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="inline-flex rounded-lg bg-secondary p-1 text-xs font-medium">
          {(["today", "total"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1.5 capitalize transition-colors",
                view === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight">{formatCurrency(currentValue)}</p>
          <p className="text-xs text-muted-foreground">Current Value</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold">{formatCurrency(investedValue)}</p>
            <p className="text-xs text-muted-foreground">Invested Value</p>
          </div>
          <div>
            <p className={cn("text-sm font-semibold", isPositive ? "text-success" : "text-destructive")}>
              {isPositive ? "+" : ""}
              {formatCurrency(plValue)} ({formatPercent(plPercent, { showSign: true })})
            </p>
            <p className="text-xs text-muted-foreground">Unrealized P/L</p>
          </div>
        </div>

        {hasFetched && (
          <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
            <span className="text-xs font-medium">Include External Investments</span>
            <Switch
              checked={externalToggleDisabled ? false : includeExternal}
              onCheckedChange={setIncludeExternal}
              disabled={externalToggleDisabled}
            />
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={onOpenDrilldown}>
          View Breakdown
        </Button>
      </CardContent>
    </Card>
  );
}

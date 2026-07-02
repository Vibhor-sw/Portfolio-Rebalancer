import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserDetailsCard } from "@/components/optimizer/UserDetailsCard";
import { PortfolioSummaryCard } from "@/components/dashboard/PortfolioSummaryCard";
import { OptimizationBreakdown } from "@/components/optimizer/OptimizationBreakdown";
import { InvestmentModelsDialog } from "@/components/optimizer/InvestmentModelsDialog";
import { OptimizerFlowDialog } from "@/components/optimizer/OptimizerFlowDialog";
import { DrilldownPieChart } from "@/components/dashboard/DrilldownPieChart";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { useRebalance } from "@/contexts/RebalanceContext";
import { portfolioAggregate, instrumentClassBreakdown } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import { formatCurrency, cn } from "@/lib/utils";

export default function Optimizer() {
  const navigate = useNavigate();
  const { selectedPortfolio } = usePortfolio();
  const { holdings } = useHoldings();
  const rebalance = useRebalance();
  const [flowOpen, setFlowOpen] = React.useState(false);
  const [modelsOpen, setModelsOpen] = React.useState(false);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);
  const [drilldownOpen, setDrilldownOpen] = React.useState(false);

  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const aggregate = portfolioAggregate(stocks, mutualFunds);
  const breakdown = instrumentClassBreakdown(stocks, mutualFunds);

  React.useEffect(() => {
    if (!rebalance.rebalanceScope) setFlowOpen(true);
  }, [rebalance.rebalanceScope]);

  const optimizableValue =
    rebalance.selectedInstruments.length > 0
      ? rebalance.selectedInstruments.reduce((sum, c) => sum + breakdown[c], 0)
      : aggregate.currentValue;

  return (
    <MobileShell>
      <div className="space-y-4">
        <UserDetailsCard />

        <PortfolioSummaryCard
          currentValue={aggregate.currentValue}
          investedValue={aggregate.investedValue}
          unrealizedPL={aggregate.unrealizedPL}
          unrealizedPLPercent={aggregate.unrealizedPLPercent}
          todaysChange={aggregate.currentValue * 0.0042}
          todaysChangePercent={0.42}
          onOpenDrilldown={() => setDrilldownOpen(true)}
          externalToggleDisabled
        />

        <Card>
          <CardContent className="space-y-2 py-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{formatCurrency(optimizableValue)}</span> of{" "}
              {formatCurrency(aggregate.currentValue)} is eligible for optimization based on your selections.
            </p>
            <button onClick={() => setBreakdownOpen(true)} className="text-xs font-medium text-primary hover:underline">
              View Details
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Optimized Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold">Select the Model</p>
                  <button onClick={() => setModelsOpen(true)} className="text-muted-foreground hover:text-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 space-y-1.5">
                  {INVESTMENT_MODELS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => rebalance.setSelectedModel(m.key)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                        rebalance.selectedModel === m.key ? "border-primary bg-accent" : "border-border"
                      )}
                    >
                      <span className="font-medium">
                        {m.icon} {m.name}
                      </span>
                      <span className="text-muted-foreground">{m.expectedReturn}% return</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">2</span>
              <div>
                <p className="text-sm font-semibold">View and Modify Recommendations</p>
                <p className="text-xs text-muted-foreground">Review BUY / SELL / HOLD suggestions and adjust quantities.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">3</span>
              <div>
                <p className="text-sm font-semibold">Confirm Orders</p>
                <p className="text-xs text-muted-foreground">Final review before execution.</p>
              </div>
            </div>

            <Button className="w-full" onClick={() => navigate("/rebalancer")}>
              Run Optimizer
            </Button>
          </CardContent>
        </Card>
      </div>

      <OptimizerFlowDialog open={flowOpen} onOpenChange={setFlowOpen} onComplete={() => {}} />
      <InvestmentModelsDialog open={modelsOpen} onOpenChange={setModelsOpen} />
      <DrilldownPieChart open={drilldownOpen} onOpenChange={setDrilldownOpen} stocks={stocks} mutualFunds={mutualFunds} />

      <Dialog open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Optimization Breakdown</DialogTitle>
          </DialogHeader>
          <OptimizationBreakdown breakdown={breakdown} targetPcts={rebalance.targetPcts} totalValue={aggregate.currentValue} />
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}

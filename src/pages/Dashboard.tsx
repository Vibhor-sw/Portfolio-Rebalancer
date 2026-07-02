import * as React from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { PortfolioSummaryCard } from "@/components/dashboard/PortfolioSummaryCard";
import { ExternalInvestmentsCard } from "@/components/dashboard/ExternalInvestmentsCard";
import { ProductDetailsCard } from "@/components/dashboard/ProductDetailsCard";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";
import { DrilldownPieChart } from "@/components/dashboard/DrilldownPieChart";
import { OptimizerFlowDialog } from "@/components/optimizer/OptimizerFlowDialog";
import { useHoldings } from "@/contexts/HoldingsContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useExternalInvestment } from "@/contexts/ExternalInvestmentContext";
import { portfolioAggregate, instrumentClassBreakdown } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import type { InstrumentClass } from "@/lib/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { holdings } = useHoldings();
  const { selectedPortfolio } = usePortfolio();
  const { investments, hasFetched, includeExternal } = useExternalInvestment();
  const [drilldownOpen, setDrilldownOpen] = React.useState(false);
  const [optimizerOpen, setOptimizerOpen] = React.useState(false);

  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const internalAggregate = portfolioAggregate(stocks, mutualFunds);
  const externalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
  const externalInvested = investments.reduce((s, i) => s + i.investedValue, 0);

  const combinedCurrent = hasFetched && includeExternal ? internalAggregate.currentValue + externalCurrent : internalAggregate.currentValue;
  const combinedInvested = hasFetched && includeExternal ? internalAggregate.investedValue + externalInvested : internalAggregate.investedValue;
  const combinedPL = combinedCurrent - combinedInvested;
  const combinedPLPercent = combinedInvested ? (combinedPL / combinedInvested) * 100 : 0;

  const todaysChange = combinedCurrent * 0.0042;
  const todaysChangePercent = 0.42;

  const internalBreakdown = instrumentClassBreakdown(stocks, mutualFunds);
  const externalBreakdown: Record<InstrumentClass, number> = {
    Stocks: investments.filter((i) => i.type === "Stocks").reduce((s, i) => s + i.currentValue, 0),
    "Large Cap MF": investments.filter((i) => i.type === "Large Cap MF").reduce((s, i) => s + i.currentValue, 0),
    "Mid Cap MF": investments.filter((i) => i.type === "Mid Cap MF").reduce((s, i) => s + i.currentValue, 0),
    "Small Cap MF": investments.filter((i) => i.type === "Small Cap MF").reduce((s, i) => s + i.currentValue, 0),
    "Flexi Cap MF": investments.filter((i) => i.type === "Flexi Cap MF").reduce((s, i) => s + i.currentValue, 0),
  };

  return (
    <MobileShell className="px-0 pt-0">
      <MarketTicker />
      <div className="space-y-4 px-4 pt-4">
        <PortfolioSummaryCard
          currentValue={combinedCurrent}
          investedValue={combinedInvested}
          unrealizedPL={combinedPL}
          unrealizedPLPercent={combinedPLPercent}
          todaysChange={todaysChange}
          todaysChangePercent={todaysChangePercent}
          onOpenDrilldown={() => setDrilldownOpen(true)}
        />
        <ExternalInvestmentsCard />
        <ProductDetailsCard internal={internalBreakdown} external={externalBreakdown} />
        <RecommendationsCard
          stocks={stocks}
          mutualFunds={mutualFunds}
          model={INVESTMENT_MODELS[0]}
          onOptimize={() => setOptimizerOpen(true)}
        />
      </div>

      <DrilldownPieChart open={drilldownOpen} onOpenChange={setDrilldownOpen} stocks={stocks} mutualFunds={mutualFunds} />
      <OptimizerFlowDialog
        open={optimizerOpen}
        onOpenChange={setOptimizerOpen}
        onComplete={() => navigate("/optimizer")}
      />
    </MobileShell>
  );
}

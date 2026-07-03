import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActionSection } from "@/components/rebalancer/ActionSection";
import { AllocationSummary } from "@/components/rebalancer/AllocationSummary";
import { AddCashDialog } from "@/components/rebalancer/AddCashDialog";
import { PaymentDialog } from "@/components/rebalancer/PaymentDialog";
import { DualPieChart, type DualPieDatum } from "@/components/rebalancer/DualPieChart";
import { WhatIfFab } from "@/components/rebalancer/WhatIfFab";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { useRebalance } from "@/contexts/RebalanceContext";
import {
  deriveStocks,
  deriveMfs,
  generateRecommendations,
  groupBy,
  instrumentClassBreakdown,
  recommendationClassBreakdown,
  totalEquityValue,
} from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import { INSTRUMENT_CLASS_COLORS, buildColorMap } from "@/lib/chartColors";
import { cn, formatCurrency } from "@/lib/utils";
import type { InstrumentClass, ModelKey, Recommendation } from "@/lib/types";

const CLASSES: InstrumentClass[] = ["Stocks", "Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];

export default function Rebalancer() {
  const navigate = useNavigate();
  const { selectedPortfolio } = usePortfolio();
  const { holdings } = useHoldings();
  const rebalance = useRebalance();
  const [tab, setTab] = React.useState<"stocks" | "mf">("stocks");
  const [addCashOpen, setAddCashOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);

  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const model = INVESTMENT_MODELS.find((m) => m.key === rebalance.selectedModel) ?? INVESTMENT_MODELS[0];

  const { stockRecos, mfRecos } = generateRecommendations(stocks, mutualFunds, model, {
    additionalCash: rebalance.additionalCash,
    qtyAdjustments: rebalance.qtyAdjustments,
  });

  const totalPool = totalEquityValue(stocks, mutualFunds) + rebalance.additionalCash;

  const handleAdjust = (id: string, kind: "stock" | "mf", delta: number) => {
    const source = kind === "stock" ? stockRecos : mfRecos;
    const item = source.find((r) => r.id === id);
    if (!item) return;
    const current = item.kind === "stock" ? item.newQty : item.newUnits;
    rebalance.setQtyAdjustment(id, Math.max(0, current + delta));
  };

  const handleConfirmOrders = () => {
    if (!rebalance.disclaimerAccepted) return;
    if (rebalance.additionalCash > 0 && !paymentOpen) {
      setPaymentOpen(true);
      return;
    }
    rebalance.setRebalanceScope(tab === "stocks" ? "stocks" : "mutualFunds");
    navigate("/execute-orders");
  };

  const groupKeyStock = (r: Recommendation) => (r.kind === "stock" ? r.sector : "");
  const groupKeyMf = (r: Recommendation) => (r.kind === "mf" ? r.marketCap : "");

  const currentRecos: Recommendation[] = tab === "stocks" ? stockRecos : mfRecos;

  // Overall portfolio mix: current holdings vs. this plan's optimized mix.
  const currentClassBreakdown = instrumentClassBreakdown(stocks, mutualFunds);
  const optimizedClassBreakdown = recommendationClassBreakdown(stockRecos, mfRecos);
  const overallPieData: DualPieDatum[] = CLASSES.map((c) => ({
    name: c,
    currentValue: currentClassBreakdown[c],
    newValue: optimizedClassBreakdown[c],
    color: INSTRUMENT_CLASS_COLORS[c],
  }));

  // Previous vs optimized, grouped by sector (stocks) / category (mutual funds).
  const dStocks = deriveStocks(stocks);
  const dMfs = deriveMfs(mutualFunds);
  const sectorsPrev = groupBy(dStocks, (s) => s.sector);
  const sectorsOptimized = groupBy(stockRecos, (r) => r.sector);
  const stockSectorNames = Array.from(new Set([...Object.keys(sectorsPrev), ...Object.keys(sectorsOptimized)]));
  const stockColorMap = buildColorMap(stockSectorNames);
  const stockComparePieData: DualPieDatum[] = stockSectorNames.map((sector) => ({
    name: sector,
    currentValue: (sectorsPrev[sector] ?? []).reduce((s, x) => s + x.currentValue, 0),
    newValue: (sectorsOptimized[sector] ?? []).reduce((s, x) => s + x.newQty * x.ltp, 0),
    color: stockColorMap[sector],
  }));

  const categoriesPrev = groupBy(dMfs, (m) => m.category) as Record<string, typeof dMfs>;
  const categoriesOptimized = groupBy(mfRecos, (r) => r.category) as Record<string, typeof mfRecos>;
  const mfCategoryNames = Array.from(new Set([...Object.keys(categoriesPrev), ...Object.keys(categoriesOptimized)]));
  const mfColorMap = buildColorMap(mfCategoryNames);
  const mfComparePieData: DualPieDatum[] = mfCategoryNames.map((category) => ({
    name: category,
    currentValue: (categoriesPrev[category] ?? []).reduce((s, x) => s + x.currentValue, 0),
    newValue: (categoriesOptimized[category] ?? []).reduce((s, x) => s + x.newUnits * x.nav, 0),
    color: mfColorMap[category],
  }));

  return (
    <MobileShell showBottomNav={false} className="pb-24">
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold">Optimized Portfolio</h1>
          <p className="text-xs text-muted-foreground">Review and adjust your rebalancing plan.</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Overall Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <DualPieChart data={overallPieData} leftLabel="Current" rightLabel="Optimized" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pick the model Best suited for you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {INVESTMENT_MODELS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => rebalance.setSelectedModel(m.key as ModelKey)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    rebalance.selectedModel === m.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {m.icon} {m.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
              <div>
                <p className="text-sm font-bold text-success">{model.expectedReturn}%</p>
                <p className="text-[10px] text-muted-foreground">Expected Returns</p>
              </div>
              <div>
                <p className="text-sm font-bold">{model.volatility}%</p>
                <p className="text-[10px] text-muted-foreground">Volatility Rate</p>
              </div>
              <div>
                <p className="text-sm font-bold">{model.sharpeRatio}</p>
                <p className="text-[10px] text-muted-foreground">Sharpe Ratio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Compare Your Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "stocks" | "mf")}>
              <TabsList className="w-full">
                <TabsTrigger value="stocks" className="flex-1">
                  Stocks
                </TabsTrigger>
                <TabsTrigger value="mf" className="flex-1">
                  Mutual Funds
                </TabsTrigger>
              </TabsList>
              <TabsContent value="stocks">
                <DualPieChart data={stockComparePieData} leftLabel="Previous" rightLabel="Optimized" />
              </TabsContent>
              <TabsContent value="mf">
                <DualPieChart data={mfComparePieData} leftLabel="Previous" rightLabel="Optimized" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AllocationSummary recommendations={[...stockRecos, ...mfRecos]} totalPool={totalPool} />

        <Button variant="outline" size="sm" className="w-full" onClick={() => setAddCashOpen(true)}>
          {rebalance.additionalCash > 0 ? `Additional Cash: ${formatCurrency(rebalance.additionalCash)} · Edit` : "Add Cash"}
        </Button>

        {tab === "stocks" ? (
          <div className="space-y-4">
            <ActionSection label="BUY" items={stockRecos.filter((r) => r.action === "BUY")} groupKey={groupKeyStock} onAdjust={handleAdjust} unitNoun="stock" />
            <ActionSection label="SELL" items={stockRecos.filter((r) => r.action === "SELL")} groupKey={groupKeyStock} onAdjust={handleAdjust} unitNoun="stock" />
            <ActionSection label="HOLD" items={stockRecos.filter((r) => r.action === "HOLD")} groupKey={groupKeyStock} onAdjust={handleAdjust} unitNoun="stock" />
          </div>
        ) : (
          <div className="space-y-4">
            <ActionSection label="BUY" items={mfRecos.filter((r) => r.action === "BUY")} groupKey={groupKeyMf} onAdjust={handleAdjust} unitNoun="fund" />
            <ActionSection label="SELL" items={mfRecos.filter((r) => r.action === "SELL")} groupKey={groupKeyMf} onAdjust={handleAdjust} unitNoun="fund" />
            <ActionSection label="HOLD" items={mfRecos.filter((r) => r.action === "HOLD")} groupKey={groupKeyMf} onAdjust={handleAdjust} unitNoun="fund" />
          </div>
        )}

        <Card>
          <CardContent className="flex items-start gap-2.5 py-4">
            <Checkbox
              id="disclaimer"
              checked={rebalance.disclaimerAccepted}
              onCheckedChange={(c) => rebalance.setDisclaimerAccepted(!!c)}
            />
            <label htmlFor="disclaimer" className="text-xs leading-relaxed text-muted-foreground">
              I understand that these are recommendations and not guaranteed returns. I accept the risks involved
              in rebalancing my portfolio.
            </label>
          </CardContent>
        </Card>

        <Button className="w-full" disabled={!rebalance.disclaimerAccepted} onClick={handleConfirmOrders}>
          Confirm Orders
        </Button>
        <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => navigate("/optimizer")}>
          Back to Optimizer
        </Button>
      </div>

      <WhatIfFab />

      <AddCashDialog
        open={addCashOpen}
        onOpenChange={setAddCashOpen}
        currentAmount={rebalance.additionalCash}
        onSave={(amt) => rebalance.setAdditionalCash(amt)}
      />
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={rebalance.additionalCash}
        onSuccess={() => {
          toast.success("Payment confirmed");
          rebalance.setRebalanceScope(tab === "stocks" ? "stocks" : "mutualFunds");
          navigate("/execute-orders");
        }}
      />
    </MobileShell>
  );
}

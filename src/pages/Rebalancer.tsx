import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActionSection } from "@/components/rebalancer/ActionSection";
import { AllocationSummary } from "@/components/rebalancer/AllocationSummary";
import { AddCashDialog } from "@/components/rebalancer/AddCashDialog";
import { PaymentDialog } from "@/components/rebalancer/PaymentDialog";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { useRebalance } from "@/contexts/RebalanceContext";
import { generateRecommendations, totalEquityValue } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import { cn, formatCurrency } from "@/lib/utils";
import type { ModelKey, Recommendation } from "@/lib/types";

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

  return (
    <MobileShell showBottomNav={false}>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold">Rebalancer</h1>
          <p className="text-xs text-muted-foreground">Review and adjust your rebalancing plan.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {INVESTMENT_MODELS.map((m) => (
            <button
              key={m.key}
              onClick={() => rebalance.setSelectedModel(m.key as ModelKey)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                rebalance.selectedModel === m.key ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground"
              )}
            >
              {m.icon} {m.name}
            </button>
          ))}
        </div>

        <AllocationSummary recommendations={[...stockRecos, ...mfRecos]} totalPool={totalPool} />

        <Button variant="outline" size="sm" className="w-full" onClick={() => setAddCashOpen(true)}>
          {rebalance.additionalCash > 0 ? `Additional Cash: ${formatCurrency(rebalance.additionalCash)} · Edit` : "Add Cash"}
        </Button>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "stocks" | "mf")}>
          <TabsList className="w-full">
            <TabsTrigger value="stocks" className="flex-1">
              Stocks
            </TabsTrigger>
            <TabsTrigger value="mf" className="flex-1">
              Mutual Funds
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stocks" className="space-y-4">
            <ActionSection label="BUY" items={currentRecos.filter((r) => r.action === "BUY")} groupKey={groupKeyStock} onAdjust={handleAdjust} />
            <ActionSection label="SELL" items={currentRecos.filter((r) => r.action === "SELL")} groupKey={groupKeyStock} onAdjust={handleAdjust} />
            <ActionSection label="HOLD" items={currentRecos.filter((r) => r.action === "HOLD")} groupKey={groupKeyStock} onAdjust={handleAdjust} />
          </TabsContent>
          <TabsContent value="mf" className="space-y-4">
            <ActionSection label="BUY" items={currentRecos.filter((r) => r.action === "BUY")} groupKey={groupKeyMf} onAdjust={handleAdjust} />
            <ActionSection label="SELL" items={currentRecos.filter((r) => r.action === "SELL")} groupKey={groupKeyMf} onAdjust={handleAdjust} />
            <ActionSection label="HOLD" items={currentRecos.filter((r) => r.action === "HOLD")} groupKey={groupKeyMf} onAdjust={handleAdjust} />
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="flex items-start gap-2.5 py-4">
            <Checkbox
              id="disclaimer"
              checked={rebalance.disclaimerAccepted}
              onCheckedChange={(c) => rebalance.setDisclaimerAccepted(!!c)}
            />
            <label htmlFor="disclaimer" className="text-xs leading-relaxed text-muted-foreground">
              I agree to the terms and conditions and understand that these are algorithmically generated
              recommendations, not investment advice.
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/optimizer")}>
            Back to Optimizer
          </Button>
          <Button className="flex-1" disabled={!rebalance.disclaimerAccepted} onClick={handleConfirmOrders}>
            Confirm Orders
          </Button>
        </div>
      </div>

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

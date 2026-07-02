import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExecutionTimeline } from "@/components/execution/ExecutionTimeline";
import { OrderCards, type OrderCardData } from "@/components/execution/OrderCards";
import { STEPS_BY_MODE, ACTION_LABEL_BY_MODE, type ExecutionModeVariant } from "@/components/execution/steps";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { useRebalance } from "@/contexts/RebalanceContext";
import { generateRecommendations } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";

export default function ExecutionFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPortfolio } = usePortfolio();
  const { holdings } = useHoldings();
  const rebalance = useRebalance();

  const mode: ExecutionModeVariant = ((location.state as { mode?: string } | null)?.mode as ExecutionModeVariant) || "conservative";
  const steps = STEPS_BY_MODE[mode];
  const [currentStep, setCurrentStep] = React.useState(0);

  const model = INVESTMENT_MODELS.find((m) => m.key === rebalance.selectedModel) ?? INVESTMENT_MODELS[0];
  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const { stockRecos, mfRecos } = generateRecommendations(stocks, mutualFunds, model, {
    additionalCash: rebalance.additionalCash,
    qtyAdjustments: rebalance.qtyAdjustments,
  });

  const orders: OrderCardData[] = [
    ...stockRecos
      .filter((r) => r.action !== "HOLD")
      .map((r) => ({ id: r.id, name: r.name, qty: Math.abs(r.newQty - r.currentQty), price: r.ltp, unitLabel: "shares", type: r.action as "BUY" | "SELL" })),
    ...mfRecos
      .filter((r) => r.action !== "HOLD")
      .map((r) => ({
        id: r.id,
        name: r.name,
        qty: Math.abs(r.newUnits - r.currentUnits),
        price: r.nav,
        unitLabel: "units",
        type: r.action as "BUY" | "SELL",
      })),
  ].filter((o) => o.qty > 0);

  const isComplete = currentStep >= steps.length - 1;

  const handleSettle = () => {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  return (
    <MobileShell showBottomNav={false}>
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold">Execution in Progress</h1>
          <p className="text-xs text-muted-foreground capitalize">{mode.replace("_", " ")} execution mode</p>
        </div>

        <Card>
          <CardContent className="py-4">
            <ExecutionTimeline mode={mode} currentStep={currentStep} />
          </CardContent>
        </Card>

        <OrderCards orders={orders} mode={mode} currentStep={currentStep} totalSteps={steps.length} />

        {isComplete ? (
          <Card className="border-success bg-success/5">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="text-sm font-semibold">Your portfolio has been rebalanced successfully!</p>
              <div className="mt-2 flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button className="flex-1" onClick={() => navigate("/order-success")}>
                  View Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button className="w-full" onClick={handleSettle}>
            {currentStep === 0 ? ACTION_LABEL_BY_MODE[mode] : "Continue"}
          </Button>
        )}
      </div>
    </MobileShell>
  );
}

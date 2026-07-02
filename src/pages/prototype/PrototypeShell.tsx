import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExecutionTimeline } from "@/components/execution/ExecutionTimeline";
import { OrderCards, type OrderCardData } from "@/components/execution/OrderCards";
import { STEPS_BY_MODE, ACTION_LABEL_BY_MODE, type ExecutionModeVariant } from "@/components/execution/steps";

const MOCK_ORDERS: OrderCardData[] = [
  { id: "p-1", name: "Vodafone Idea", qty: 500, price: 12.4, unitLabel: "shares", type: "SELL" },
  { id: "p-2", name: "Yes Bank", qty: 300, price: 21.8, unitLabel: "shares", type: "SELL" },
  { id: "p-3", name: "SBI Small Cap Fund", qty: 210.5, price: 168.3, unitLabel: "units", type: "SELL" },
  { id: "p-4", name: "HDFC Top 100 Fund", qty: 45.2, price: 912.6, unitLabel: "units", type: "BUY" },
  { id: "p-5", name: "Parag Parikh Flexi Cap Fund", qty: 88.9, price: 78.4, unitLabel: "units", type: "BUY" },
  { id: "p-6", name: "Larsen & Toubro", qty: 25, price: 3620, unitLabel: "shares", type: "BUY" },
];

interface PrototypeShellProps {
  mode: ExecutionModeVariant;
  title: string;
}

export function PrototypeShell({ mode, title }: PrototypeShellProps) {
  const navigate = useNavigate();
  const steps = STEPS_BY_MODE[mode];
  const [currentStep, setCurrentStep] = React.useState(0);
  const isComplete = currentStep >= steps.length - 1;

  return (
    <MobileShell showBottomNav={false}>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/execution-mode")} className="rounded-full p-1.5 hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-xs text-muted-foreground">Live prototype · mock data for stakeholder review</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-4">
            <ExecutionTimeline mode={mode} currentStep={currentStep} />
          </CardContent>
        </Card>

        <OrderCards orders={MOCK_ORDERS} mode={mode} currentStep={currentStep} totalSteps={steps.length} />

        {isComplete ? (
          <Card className="border-success bg-success/5">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="text-sm font-semibold">Prototype flow complete.</p>
              <Button variant="outline" className="mt-2 w-full" onClick={() => navigate("/execution-mode")}>
                Back to Execution Mode
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button className="w-full" onClick={() => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))}>
            {currentStep === 0 ? ACTION_LABEL_BY_MODE[mode] : "Continue"}
          </Button>
        )}
      </div>
    </MobileShell>
  );
}

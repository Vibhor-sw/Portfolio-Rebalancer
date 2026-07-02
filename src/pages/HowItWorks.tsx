import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIZATION = [
  { name: "Stocks", value: 10, color: "#1e3a8a" },
  { name: "Large Cap", value: 35, color: "#b91c1c" },
  { name: "Mid Cap", value: 25, color: "#dc2626" },
  { name: "Small Cap", value: 15, color: "#ef4444" },
  { name: "Flexi Cap", value: 15, color: "#f87171" },
];

const RESEARCH_CHECK = [
  { name: "Vodafone Idea", verdict: "Exit" as const },
  { name: "Yes Bank", verdict: "Exit" as const },
  { name: "Suzlon Energy", verdict: "Exit" as const },
  { name: "HDFC Mid Cap", verdict: "Pass" as const },
  { name: "SBI Small Cap", verdict: "Pass" as const },
  { name: "Kotak Emerging Equity", verdict: "Pass" as const },
];

const RECOMMENDED_MIX = [
  { name: "HDFC Top 100 Fund", action: "Hold" as const },
  { name: "Parag Parikh Flexi Cap Fund", action: "Buy" as const },
  { name: "ICICI Prudential Bluechip Fund", action: "Hold" as const },
  { name: "Nippon India Small Cap Fund", action: "Buy" as const },
  { name: "UTI Flexi Cap Fund", action: "Buy" as const },
];

const REBALANCE_TABLE = [
  { asset: "Vodafone Idea (Stock)", current: "8%", target: "0%", action: "Reduce" },
  { asset: "Large Cap MF", current: "20%", target: "35%", action: "Increase" },
  { asset: "Small Cap MF", current: "22%", target: "15%", action: "Reduce" },
  { asset: "Flexi Cap MF", current: "8%", target: "15%", action: "Increase" },
];

const STEP_TITLES = [
  "Understanding Your Portfolio",
  "Smart Categorization",
  "Research Insight Check",
  "Compare With Recommended Mix",
  "Personalized Allocation",
  "Rebalance Calculation",
  "Action Plan",
];

function PieSlice({ data }: { data: typeof CATEGORIZATION }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const radius = 80;
  const cx = 100;
  const cy = 100;

  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48">
      {data.map((d, idx) => {
        const startAngle = (cumulative / total) * 2 * Math.PI;
        cumulative += d.value;
        const endAngle = (cumulative / total) * 2 * Math.PI;
        const x1 = cx + radius * Math.sin(startAngle);
        const y1 = cy - radius * Math.cos(startAngle);
        const x2 = cx + radius * Math.sin(endAngle);
        const y2 = cy - radius * Math.cos(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        return (
          <motion.path
            key={d.name}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={d.color}
            stroke="hsl(var(--card))"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

export default function HowItWorks() {
  const [step, setStep] = React.useState(0);
  const totalSteps = STEP_TITLES.length;

  const goTo = (idx: number) => setStep(Math.min(Math.max(idx, 0), totalSteps - 1));

  return (
    <MobileShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold">How It Works</h1>
          <p className="text-xs text-muted-foreground">Step {step + 1} of {totalSteps}</p>
        </div>

        <div className="flex gap-1">
          {STEP_TITLES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn("h-1.5 flex-1 rounded-full transition-colors", idx <= step ? "bg-primary" : "bg-secondary")}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="rounded-full border border-border p-2 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-center text-sm font-semibold">{STEP_TITLES[step]}</p>
          <button
            onClick={() => goTo(step + 1)}
            disabled={step === totalSteps - 1}
            className="rounded-full border border-border p-2 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Card>
                <CardContent className="space-y-3 py-5 text-sm">
                  <p>
                    We start by analyzing every equity instrument in your portfolio — Stocks and Equity Mutual Funds
                    across Large Cap, Mid Cap, Small Cap, and Flexi Cap categories.
                  </p>
                  <p className="text-muted-foreground">
                    Only the Equity asset class is in scope. Debt, Gold, and other assets are excluded from this
                    analysis.
                  </p>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <CardContent className="space-y-3 py-5">
                  <p className="text-sm">Your holdings are categorized by instrument type and market-cap segment.</p>
                  <div className="space-y-2">
                    {CATEGORIZATION.map((c, idx) => (
                      <div key={c.name}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{c.name}</span>
                          <span className="font-medium">{c.value}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: c.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.value}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardContent className="space-y-2 py-5">
                  <p className="mb-2 text-sm">Every holding is evaluated against our research desk's conviction calls.</p>
                  {RESEARCH_CHECK.map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-sm">{r.name}</span>
                      <span className={cn("flex items-center gap-1 text-xs font-semibold", r.verdict === "Exit" ? "text-destructive" : "text-success")}>
                        {r.verdict === "Exit" ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {r.verdict}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="space-y-2 py-5">
                  <p className="mb-2 text-sm">We compare your current mix against our recommended model portfolio.</p>
                  {RECOMMENDED_MIX.map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-sm">{r.name}</span>
                      <Badge variant={r.action === "Buy" ? "success" : "outline"}>{r.action}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardContent className="space-y-3 py-5">
                  <p className="text-center text-sm">Here's your personalized target allocation.</p>
                  <PieSlice data={CATEGORIZATION} />
                  <div className="flex flex-wrap justify-center gap-3 text-[11px]">
                    {CATEGORIZATION.map((c) => (
                      <span key={c.name} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card>
                <CardContent className="space-y-2 py-5">
                  <p className="mb-2 text-sm">Current vs target allocation for key positions:</p>
                  {REBALANCE_TABLE.map((r) => (
                    <div key={r.asset} className="rounded-lg bg-secondary/50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{r.asset}</span>
                        <Badge variant={r.action === "Increase" ? "success" : "destructive"}>{r.action}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.current} → {r.target}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 6 && (
              <Card>
                <CardContent className="space-y-4 py-6 text-center">
                  <p className="text-sm font-semibold">Your Action Plan is Ready</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xl font-bold text-destructive">2</p>
                      <p className="text-xs text-muted-foreground">Exit</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-success">3</p>
                      <p className="text-xs text-muted-foreground">Buy</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-muted-foreground">4</p>
                      <p className="text-xs text-muted-foreground">Hold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MobileShell>
  );
}

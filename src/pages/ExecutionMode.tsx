import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Zap, ChevronDown, ShieldAlert } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useRebalance, type ExecutionModeChoice } from "@/contexts/RebalanceContext";
import { cn } from "@/lib/utils";

const MODES: {
  key: Exclude<ExecutionModeChoice, null>;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  pros: string[];
  cons: string[];
}[] = [
  {
    key: "conservative",
    title: "Conservative Execution",
    badge: "Low Risk · Recommended",
    icon: Lock,
    description: "Wait for settlement before buying (T+2 days).",
    pros: ["Zero risk of fund shortfall", "Fully compliant", "No provisional credit", "Simple to understand"],
    cons: ["T+2 settlement delay", "May miss market opportunities", "You'll see orders as \"pending\" meanwhile"],
  },
  {
    key: "instant",
    title: "Instant Execution",
    badge: "Fastest",
    icon: Zap,
    description: "Execute immediately using provisional credit.",
    pros: ["Immediate execution", "Best user experience", "Captures market prices instantly"],
    cons: ["Settlement risk if sell fails", "Requires 5-10% haircut buffer", "Needs regulatory compliance"],
  },
];

export default function ExecutionMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const rebalance = useRebalance();
  const from = (location.state as { from?: string } | null)?.from ?? "rebalancer";

  const [selected, setSelected] = React.useState<Exclude<ExecutionModeChoice, null>>(
    (localStorage.getItem("defaultExecutionMode") as Exclude<ExecutionModeChoice, null>) || "conservative"
  );
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [riskDisclosureOpen, setRiskDisclosureOpen] = React.useState(false);

  const handleContinue = () => {
    rebalance.setExecutionMode(selected);
    navigate("/execution-flow", { state: { mode: selected } });
  };

  const handleSaveDefault = () => {
    localStorage.setItem("defaultExecutionMode", selected);
    toast.success(`${selected === "conservative" ? "Conservative" : "Instant"} set as default execution mode`);
    navigate("/settings");
  };

  const handlePreview = (key: string) => {
    if (key === "instant") {
      setRiskDisclosureOpen(true);
    } else {
      setPreviewOpen(true);
    }
  };

  return (
    <MobileShell showBottomNav={false}>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold">Choose Execution Mode</h1>
          <p className="text-xs text-muted-foreground">How should we execute your BUY and SELL orders?</p>
        </div>

        <RadioGroup value={selected} onValueChange={(v) => setSelected(v as Exclude<ExecutionModeChoice, null>)}>
          {MODES.map((mode) => (
            <Card key={mode.key} className={cn("transition-colors", selected === mode.key && "border-primary")}>
              <CardContent className="space-y-3 py-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <RadioGroupItem value={mode.key} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-semibold">
                        <mode.icon className="h-4 w-4" /> {mode.title}
                      </span>
                      <Badge variant={mode.key === "conservative" ? "success" : "warning"}>{mode.badge}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                </label>

                <Collapsible open={expanded === mode.key} onOpenChange={(o) => setExpanded(o ? mode.key : null)}>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-primary">
                    Show more
                    <ChevronDown className={cn("h-3 w-3 transition-transform", expanded === mode.key && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2 text-xs">
                    <div>
                      <p className="font-medium text-success">Pros</p>
                      <ul className="list-disc pl-4 text-muted-foreground">
                        {mode.pros.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-destructive">Cons</p>
                      <ul className="list-disc pl-4 text-muted-foreground">
                        {mode.cons.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    {mode.key === "instant" && (
                      <div className="rounded-md bg-warning/10 p-2 text-[11px] text-warning">
                        Haircut: 8% safety buffer · Max credit: 92% of sell value · SEBI guidelines apply.
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handlePreview(mode.key)}>
                        Preview UX
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => navigate(`/prototype/${mode.key}`)}
                      >
                        Live Prototype
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>

        {from === "settings" ? (
          <Button className="w-full" onClick={handleSaveDefault}>
            Save as Default
          </Button>
        ) : (
          <Button className="w-full" onClick={handleContinue}>
            Continue to Execution
          </Button>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Preview: What You'll See</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Your sell orders are submitted immediately.</p>
            <p>2. We wait for T+2 settlement before placing your buy orders.</p>
            <p>3. Order status will show as "Settling" until funds clear, then "Complete".</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={riskDisclosureOpen} onOpenChange={setRiskDisclosureOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-warning" /> Risk Disclosure
            </DialogTitle>
            <DialogDescription>Please review before previewing Instant Execution.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Settlement risk: if your sell order fails, buy orders may be squared off or billed to you.</li>
            <li>Margin calls may apply if provisional credit exceeds realized proceeds.</li>
            <li>Subject to SEBI regulatory requirements for provisional credit.</li>
          </ul>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setRiskDisclosureOpen(false);
                setPreviewOpen(true);
              }}
            >
              I Understand, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}

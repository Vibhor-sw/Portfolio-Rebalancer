import * as React from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { InstrumentClass } from "@/lib/types";
import { instrumentClassBreakdown, totalEquityValue } from "@/lib/portfolio";
import { useHoldings } from "@/contexts/HoldingsContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useRebalance, type PortfolioTypeChoice, type DiversifyChoice } from "@/contexts/RebalanceContext";

interface OptimizerFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  /** When true, the dialog cannot be dismissed without completing a valid selection (no close icon, outside click, or escape). */
  mandatory?: boolean;
}

const PAGES: { key: PortfolioTypeChoice; title: string; description: string }[] = [
  {
    key: "only_stocks",
    title: "Only Stocks",
    description: "Your current portfolio is 100% stocks.",
  },
  {
    key: "stocks_mfs",
    title: "Stocks & MFs",
    description: "Your current portfolio has both Stocks and Equity Mutual Funds.",
  },
  {
    key: "only_mfs",
    title: "Only MFs",
    description: "Your current portfolio is 100% Equity Mutual Funds.",
  },
];

const ALL_INSTRUMENTS: InstrumentClass[] = ["Stocks", "Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];

const SUGGESTED: Record<InstrumentClass, number> = {
  Stocks: 25,
  "Large Cap MF": 30,
  "Mid Cap MF": 20,
  "Small Cap MF": 10,
  "Flexi Cap MF": 15,
};

export function OptimizerFlowDialog({ open, onOpenChange, onComplete, mandatory }: OptimizerFlowDialogProps) {
  const { holdings } = useHoldings();
  const { selectedPortfolio } = usePortfolio();
  const rebalance = useRebalance();

  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const totalValue = totalEquityValue(stocks, mutualFunds) || 1;
  const breakdown = instrumentClassBreakdown(stocks, mutualFunds);

  const [pageIdx, setPageIdx] = React.useState(0);
  const [diversify, setDiversify] = React.useState<DiversifyChoice>("same");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [selectedInstruments, setSelectedInstruments] = React.useState<Set<InstrumentClass>>(new Set(ALL_INSTRUMENTS));
  const [targetPcts, setTargetPcts] = React.useState<Record<InstrumentClass, number>>(SUGGESTED);

  const page = PAGES[pageIdx];
  const isSingleType = page.key === "only_stocks" || page.key === "only_mfs";

  const resetPageState = React.useCallback(() => {
    setDiversify("same");
    setAdvancedOpen(false);
    setSelectedInstruments(new Set(ALL_INSTRUMENTS));
    setTargetPcts(SUGGESTED);
  }, []);

  const goToPage = (idx: number) => {
    setPageIdx((idx + PAGES.length) % PAGES.length);
    resetPageState();
  };

  const targetTotal = ALL_INSTRUMENTS.reduce((sum, k) => sum + (targetPcts[k] || 0), 0);
  const targetValid = Math.round(targetTotal) === 100;

  // For a single-type portfolio (Only Stocks / Only MFs), choosing "Diversify" means the user
  // wants to bring in the complementary instrument type, which requires external research —
  // internal-only optimization isn't offered in that case.
  const showInternalOption = !(isSingleType && diversify === "diversify");
  const internalDisabled = !targetValid;

  const handleConfirm = (includeExternalReco: boolean) => {
    if (!targetValid) {
      toast.error("Target allocation must total 100%");
      return;
    }
    rebalance.setPortfolioType(page.key);
    rebalance.setDiversifyChoice(isSingleType ? diversify : null);
    rebalance.setSelectedInstruments(Array.from(selectedInstruments));
    rebalance.setTargetPcts(targetPcts);
    rebalance.setIncludeExternalReco(includeExternalReco);
    rebalance.setRebalanceScope(page.key === "only_stocks" ? "stocks" : page.key === "only_mfs" ? "mutualFunds" : "both");
    toast.success(includeExternalReco ? "External-aware optimization started" : "Internal optimization started");
    onOpenChange(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={mandatory ? () => {} : onOpenChange}>
      <DialogContent
        className="max-w-sm"
        hideClose={mandatory}
        onInteractOutside={(e) => mandatory && e.preventDefault()}
        onEscapeKeyDown={(e) => mandatory && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Optimize My Portfolio</DialogTitle>
          <DialogDescription>
            {mandatory
              ? "Your input is required before you can view optimized recommendations."
              : "Choose how you'd like your equity portfolio optimized."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <button onClick={() => goToPage(pageIdx - 1)} aria-label="Previous" className="rounded-full p-1.5 hover:bg-accent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold">{page.title}</p>
          </div>
          <button onClick={() => goToPage(pageIdx + 1)} aria-label="Next" className="rounded-full p-1.5 hover:bg-accent">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center gap-1.5">
          {PAGES.map((p, idx) => (
            <button
              key={p.key}
              onClick={() => goToPage(idx)}
              aria-label={`Go to ${p.title}`}
              className={cn("h-1.5 w-1.5 rounded-full transition-all", idx === pageIdx ? "w-4 bg-primary" : "bg-border")}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {page.description} By making a selection, you provide your consent to optimize as per pre-defined logic.
        </p>

        {isSingleType && (
          <div className="inline-flex w-full rounded-lg bg-secondary p-1 text-xs font-medium">
            {(["same", "diversify"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setDiversify(v)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 transition-colors",
                  diversify === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                {v === "same" ? "Same Instruments" : "Diversify"}
              </button>
            ))}
          </div>
        )}

        <button onClick={() => setAdvancedOpen((o) => !o)} className="text-xs font-medium text-primary hover:underline text-left">
          {advancedOpen ? "Hide Advanced Settings" : "Advanced"}
        </button>

        {advancedOpen && (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6"></TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead className="text-right">Curr.%</TableHead>
                  <TableHead className="text-right">Sugg.%</TableHead>
                  <TableHead className="text-right">Target%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_INSTRUMENTS.map((instrument) => {
                  const currentPct = (breakdown[instrument] / totalValue) * 100;
                  return (
                    <TableRow key={instrument}>
                      <TableCell>
                        <Checkbox
                          checked={selectedInstruments.has(instrument)}
                          onCheckedChange={(checked) => {
                            setSelectedInstruments((prev) => {
                              const next = new Set(prev);
                              if (checked) next.add(instrument);
                              else next.delete(instrument);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-xs">{instrument}</TableCell>
                      <TableCell className="text-right text-xs">{currentPct.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-xs">{SUGGESTED[instrument]}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={targetPcts[instrument]}
                          onChange={(e) =>
                            setTargetPcts((prev) => ({ ...prev, [instrument]: Number(e.target.value) || 0 }))
                          }
                          className="h-7 w-16 text-right text-xs"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className={cn("text-right text-xs font-medium", targetValid ? "text-success" : "text-destructive")}>
              Total: {targetTotal.toFixed(1)}% {targetValid ? "✓" : "(must equal 100%)"}
            </p>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={() => handleConfirm(true)} disabled={!targetValid}>
            Require External Reco
          </Button>
          {showInternalOption && (
            <Button variant="outline" className="w-full" onClick={() => handleConfirm(false)} disabled={internalDisabled}>
              Only Internal Optimization
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

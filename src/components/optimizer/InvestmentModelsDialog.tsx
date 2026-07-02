import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { INVESTMENT_MODELS } from "@/lib/mockData";

interface InvestmentModelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestmentModelsDialog({ open, onOpenChange }: InvestmentModelsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Investment Models</DialogTitle>
          <DialogDescription>Pick the strategy that best matches your goals.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {INVESTMENT_MODELS.map((m) => (
            <div key={m.key} className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">
                {m.icon} {m.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.tagline}</p>
              <p className="mt-1.5 text-xs leading-relaxed">{m.description}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div>
                  <p className="font-semibold text-success">{m.expectedReturn}%</p>
                  <p className="text-muted-foreground">Return</p>
                </div>
                <div>
                  <p className="font-semibold">{m.volatility}%</p>
                  <p className="text-muted-foreground">Volatility</p>
                </div>
                <div>
                  <p className="font-semibold">{m.sharpeRatio}</p>
                  <p className="text-muted-foreground">Sharpe</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

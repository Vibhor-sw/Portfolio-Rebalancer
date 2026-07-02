import * as React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onSuccess: () => void;
}

export function PaymentDialog({ open, onOpenChange, amount, onSuccess }: PaymentDialogProps) {
  const [status, setStatus] = React.useState<"idle" | "processing" | "success">("idle");

  React.useEffect(() => {
    if (open) setStatus("idle");
  }, [open]);

  const handlePay = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 900);
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => status !== "processing" && onOpenChange(o)}>
      <DialogContent className="max-w-sm" hideClose={status === "processing"}>
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>Complete payment for the additional cash investment.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-6">
          {status === "idle" && (
            <>
              <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
              <p className="text-xs text-muted-foreground">via UPI / Net Banking (simulated)</p>
              <Button className="w-full" onClick={handlePay}>
                Pay Now
              </Button>
            </>
          )}
          {status === "processing" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing payment…</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Payment Successful</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAmount: number;
  onSave: (amount: number) => void;
}

export function AddCashDialog({ open, onOpenChange, currentAmount, onSave }: AddCashDialogProps) {
  const [amount, setAmount] = React.useState(String(currentAmount || ""));

  React.useEffect(() => {
    if (open) setAmount(String(currentAmount || ""));
  }, [open, currentAmount]);

  const handleSave = () => {
    const n = Number(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    onSave(n);
    toast.success(`₹${n.toLocaleString("en-IN")} added to your rebalancing pool`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Cash</DialogTitle>
          <DialogDescription>Add additional investment amount to factor into rebalancing.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="cash-amount">Amount (₹)</Label>
          <Input id="cash-amount" type="number" placeholder="e.g. 100000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSave}>
            Add Cash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

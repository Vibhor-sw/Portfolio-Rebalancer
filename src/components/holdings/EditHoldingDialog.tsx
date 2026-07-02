import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StockHolding, MutualFundHolding } from "@/lib/types";

interface EditStockDialogProps {
  stock: StockHolding | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<StockHolding>) => void;
}

export function EditStockDialog({ stock, onClose, onSave }: EditStockDialogProps) {
  const [qty, setQty] = React.useState("");
  const [avgPrice, setAvgPrice] = React.useState("");
  const [ltp, setLtp] = React.useState("");

  React.useEffect(() => {
    if (stock) {
      setQty(String(stock.qty));
      setAvgPrice(String(stock.avgPrice));
      setLtp(String(stock.ltp));
    }
  }, [stock]);

  const handleSave = () => {
    if (!stock) return;
    onSave(stock.id, { qty: Number(qty), avgPrice: Number(avgPrice), ltp: Number(ltp) });
    toast.success(`${stock.stockName} updated`);
    onClose();
  };

  return (
    <Dialog open={!!stock} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit {stock?.stockName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Average Price</Label>
            <Input type="number" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>LTP</Label>
            <Input type="number" value={ltp} onChange={(e) => setLtp(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditMfDialogProps {
  mf: MutualFundHolding | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<MutualFundHolding>) => void;
}

export function EditMfDialog({ mf, onClose, onSave }: EditMfDialogProps) {
  const [units, setUnits] = React.useState("");
  const [avgNav, setAvgNav] = React.useState("");
  const [prevNav, setPrevNav] = React.useState("");

  React.useEffect(() => {
    if (mf) {
      setUnits(String(mf.units));
      setAvgNav(String(mf.avgNav));
      setPrevNav(String(mf.prevNav));
    }
  }, [mf]);

  const handleSave = () => {
    if (!mf) return;
    onSave(mf.id, { units: Number(units), avgNav: Number(avgNav), prevNav: Number(prevNav) });
    toast.success(`${mf.schemeName} updated`);
    onClose();
  };

  return (
    <Dialog open={!!mf} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit {mf?.schemeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Units</Label>
            <Input type="number" value={units} onChange={(e) => setUnits(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Average NAV</Label>
            <Input type="number" value={avgNav} onChange={(e) => setAvgNav(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Previous NAV</Label>
            <Input type="number" value={prevNav} onChange={(e) => setPrevNav(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

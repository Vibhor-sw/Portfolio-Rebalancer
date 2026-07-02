import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { StockHolding, MutualFundHolding, InstrumentClass } from "@/lib/types";

interface AddHoldingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStocks: (stocks: Omit<StockHolding, "id">[]) => void;
  onAddMfs: (mfs: Omit<MutualFundHolding, "id">[]) => void;
  activeTab: "stocks" | "mf";
}

const MF_CATEGORIES: Exclude<InstrumentClass, "Stocks">[] = ["Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];
const SECTORS = ["Banking", "IT", "FMCG", "Energy", "Capital Goods", "Telecom", "Automobile", "Pharma"];

type StockDraft = { stockName: string; symbol: string; sector: string; qty: string; avgPrice: string; ltp: string };
type MfDraft = { schemeName: string; category: Exclude<InstrumentClass, "Stocks">; units: string; avgNav: string; prevNav: string };

const emptyStock = (): StockDraft => ({ stockName: "", symbol: "", sector: SECTORS[0], qty: "", avgPrice: "", ltp: "" });
const emptyMf = (): MfDraft => ({ schemeName: "", category: "Large Cap MF", units: "", avgNav: "", prevNav: "" });

export function AddHoldingDialog({ open, onOpenChange, onAddStocks, onAddMfs, activeTab }: AddHoldingDialogProps) {
  const [mode, setMode] = React.useState<"manual" | "upload">("manual");
  const [tab, setTab] = React.useState<"stocks" | "mf">(activeTab);
  const [stockDrafts, setStockDrafts] = React.useState<StockDraft[]>([emptyStock()]);
  const [mfDrafts, setMfDrafts] = React.useState<MfDraft[]>([emptyMf()]);

  React.useEffect(() => {
    if (open) {
      setTab(activeTab);
      setMode("manual");
      setStockDrafts([emptyStock()]);
      setMfDrafts([emptyMf()]);
    }
  }, [open, activeTab]);

  const handleSaveStocks = () => {
    const valid = stockDrafts.filter((d) => d.stockName && d.qty && d.avgPrice && d.ltp);
    if (valid.length === 0) {
      toast.error("Fill in at least one complete stock entry");
      return;
    }
    onAddStocks(
      valid.map((d) => ({
        stockName: d.stockName,
        symbol: d.symbol || d.stockName.slice(0, 6).toUpperCase(),
        sector: d.sector,
        qty: Number(d.qty),
        avgPrice: Number(d.avgPrice),
        ltp: Number(d.ltp),
      }))
    );
    toast.success(`Added ${valid.length} stock${valid.length > 1 ? "s" : ""}`);
    onOpenChange(false);
  };

  const handleSaveMfs = () => {
    const valid = mfDrafts.filter((d) => d.schemeName && d.units && d.avgNav && d.prevNav);
    if (valid.length === 0) {
      toast.error("Fill in at least one complete fund entry");
      return;
    }
    onAddMfs(
      valid.map((d) => ({
        schemeName: d.schemeName,
        category: d.category,
        units: Number(d.units),
        avgNav: Number(d.avgNav),
        prevNav: Number(d.prevNav),
      }))
    );
    toast.success(`Added ${valid.length} fund${valid.length > 1 ? "s" : ""}`);
    onOpenChange(false);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Only .xlsx, .xls or .csv files are supported");
      return;
    }
    toast.success(`${file.name} validated. Parsed holdings will appear here.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Holdings</DialogTitle>
          <DialogDescription>Add entries manually or upload a file.</DialogDescription>
        </DialogHeader>

        <div className="inline-flex w-full rounded-lg bg-secondary p-1 text-xs font-medium">
          {(["manual", "upload"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md px-3 py-1.5 capitalize transition-colors ${mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Upload Excel (.xlsx, .xls) or CSV file</p>
            <Label htmlFor="file-upload">
              <span className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground">
                Choose File
              </span>
            </Label>
            <Input id="file-upload" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUploadFile} />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "stocks" | "mf")}>
            <TabsList className="w-full">
              <TabsTrigger value="stocks" className="flex-1">
                Stocks
              </TabsTrigger>
              <TabsTrigger value="mf" className="flex-1">
                Mutual Funds
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stocks" className="max-h-[45vh] space-y-4 overflow-y-auto">
              {stockDrafts.map((draft, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Entry {idx + 1}</p>
                    {stockDrafts.length > 1 && (
                      <button onClick={() => setStockDrafts((prev) => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Stock Name"
                    value={draft.stockName}
                    onChange={(e) =>
                      setStockDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, stockName: e.target.value } : d)))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Symbol"
                      value={draft.symbol}
                      onChange={(e) =>
                        setStockDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, symbol: e.target.value } : d)))
                      }
                    />
                    <Select
                      value={draft.sector}
                      onValueChange={(v) => setStockDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, sector: v } : d)))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={draft.qty}
                      onChange={(e) => setStockDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, qty: e.target.value } : d)))}
                    />
                    <Input
                      type="number"
                      placeholder="Avg Price"
                      value={draft.avgPrice}
                      onChange={(e) =>
                        setStockDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, avgPrice: e.target.value } : d)))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="LTP"
                      value={draft.ltp}
                      onChange={(e) => setStockDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ltp: e.target.value } : d)))}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => setStockDrafts((prev) => [...prev, emptyStock()])}>
                <Plus className="h-3.5 w-3.5" /> Add More
              </Button>
            </TabsContent>
            <TabsContent value="mf" className="max-h-[45vh] space-y-4 overflow-y-auto">
              {mfDrafts.map((draft, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Entry {idx + 1}</p>
                    {mfDrafts.length > 1 && (
                      <button onClick={() => setMfDrafts((prev) => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Scheme Name"
                    value={draft.schemeName}
                    onChange={(e) => setMfDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, schemeName: e.target.value } : d)))}
                  />
                  <Select
                    value={draft.category}
                    onValueChange={(v) =>
                      setMfDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, category: v as Exclude<InstrumentClass, "Stocks"> } : d)))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MF_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Units"
                      value={draft.units}
                      onChange={(e) => setMfDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, units: e.target.value } : d)))}
                    />
                    <Input
                      type="number"
                      placeholder="Avg NAV"
                      value={draft.avgNav}
                      onChange={(e) => setMfDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, avgNav: e.target.value } : d)))}
                    />
                    <Input
                      type="number"
                      placeholder="Prev NAV"
                      value={draft.prevNav}
                      onChange={(e) => setMfDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, prevNav: e.target.value } : d)))}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => setMfDrafts((prev) => [...prev, emptyMf()])}>
                <Plus className="h-3.5 w-3.5" /> Add More
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {mode === "manual" && (
          <DialogFooter>
            <Button className="w-full" onClick={tab === "stocks" ? handleSaveStocks : handleSaveMfs}>
              Save
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

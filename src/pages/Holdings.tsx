import * as React from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AddHoldingDialog } from "@/components/holdings/AddHoldingDialog";
import { EditStockDialog, EditMfDialog } from "@/components/holdings/EditHoldingDialog";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { PORTFOLIOS } from "@/lib/mockData";
import { deriveStocks, deriveMfs, portfolioAggregate } from "@/lib/portfolio";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { StockHolding, MutualFundHolding } from "@/lib/types";

export default function Holdings() {
  const { selectedPortfolio, setSelectedPortfolio } = usePortfolio();
  const { holdings, addStock, updateStock, deleteStock, addMutualFund, updateMutualFund, deleteMutualFund } = useHoldings();
  const [view, setView] = React.useState<"list" | "detail">("list");
  const [tab, setTab] = React.useState<"stocks" | "mf">("stocks");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editStock, setEditStock] = React.useState<StockHolding | null>(null);
  const [editMf, setEditMf] = React.useState<MutualFundHolding | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ kind: "stock" | "mf"; id: string; name: string } | null>(null);

  const { stocks, mutualFunds } = holdings[selectedPortfolio];
  const dStocks = deriveStocks(stocks);
  const dMfs = deriveMfs(mutualFunds);
  const aggregate = portfolioAggregate(stocks, mutualFunds);

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "stock") deleteStock(selectedPortfolio, deleteTarget.id);
    else deleteMutualFund(selectedPortfolio, deleteTarget.id);
    toast.success(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  };

  if (view === "list") {
    return (
      <MobileShell>
        <h1 className="mb-4 text-lg font-bold">Your Portfolios</h1>
        <div className="space-y-3">
          {PORTFOLIOS.map((p) => {
            const { stocks: s, mutualFunds: m } = holdings[p.id];
            const agg = portfolioAggregate(s, m);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPortfolio(p.id);
                  setView("detail");
                }}
                className="w-full text-left"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.length} Stocks · {m.length} Funds
                      </p>
                      <p className="mt-1 text-sm font-medium">{formatCurrency(agg.currentValue)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => setView("list")} className="rounded-full p-1.5 hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold">{PORTFOLIOS.find((p) => p.id === selectedPortfolio)?.name}</h1>
          <p className="text-xs text-muted-foreground">{formatCurrency(aggregate.currentValue)} current value</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "stocks" | "mf")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="mf">Mutual Funds</TabsTrigger>
          </TabsList>
          <Button size="sm" className="gap-1" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Data
          </Button>
        </div>

        <TabsContent value="stocks" className="space-y-2.5">
          {dStocks.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No stock holdings yet.</p>}
          {dStocks.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-3">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{s.stockName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.symbol} · {s.sector}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditStock(s)} className="rounded p-1 hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ kind: "stock", id: s.id, name: s.stockName })}
                      className="rounded p-1 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Qty / Avg / LTP</p>
                    <p className="font-medium">
                      {s.qty} / ₹{s.avgPrice} / ₹{s.ltp}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-medium">{formatCurrency(s.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P/L</p>
                    <p className={cn("font-medium", s.unrealizedPL >= 0 ? "text-success" : "text-destructive")}>
                      {formatPercent(s.unrealizedPLPercent, { showSign: true })}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Allocation: {s.allocationPercent.toFixed(1)}%</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mf" className="space-y-2.5">
          {dMfs.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No mutual fund holdings yet.</p>}
          {dMfs.map((m) => (
            <Card key={m.id}>
              <CardContent className="py-3">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{m.schemeName}</p>
                    <p className="text-xs text-muted-foreground">{m.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditMf(m)} className="rounded p-1 hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ kind: "mf", id: m.id, name: m.schemeName })}
                      className="rounded p-1 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Units / Avg NAV</p>
                    <p className="font-medium">
                      {m.units} / ₹{m.avgNav}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-medium">{formatCurrency(m.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P/L</p>
                    <p className={cn("font-medium", m.unrealizedPL >= 0 ? "text-success" : "text-destructive")}>
                      {formatPercent(m.unrealizedPLPercent, { showSign: true })}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Allocation: {m.allocationPercent.toFixed(1)}%</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <AddHoldingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        activeTab={tab}
        onAddStocks={(list) => list.forEach((s) => addStock(selectedPortfolio, s))}
        onAddMfs={(list) => list.forEach((m) => addMutualFund(selectedPortfolio, m))}
      />
      <EditStockDialog stock={editStock} onClose={() => setEditStock(null)} onSave={(id, patch) => updateStock(selectedPortfolio, id, patch)} />
      <EditMfDialog mf={editMf} onClose={() => setEditMf(null)} onSave={(id, patch) => updateMutualFund(selectedPortfolio, id, patch)} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove holding?</DialogTitle>
            <DialogDescription>Are you sure you want to remove {deleteTarget?.name}? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}

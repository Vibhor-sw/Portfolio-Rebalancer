import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { StockHolding, MutualFundHolding } from "@/lib/types";
import { deriveStocks, deriveMfs, groupBy, totalEquityValue } from "@/lib/portfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface DrilldownPieChartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stocks: StockHolding[];
  mutualFunds: MutualFundHolding[];
}

const STOCK_COLORS = ["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#0f172a", "#334155"];
const MF_COLORS = ["#7f1d1d", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5", "#450a0a"];

export function DrilldownPieChart({ open, onOpenChange, stocks, mutualFunds }: DrilldownPieChartProps) {
  const [inverted, setInverted] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<"Stocks" | "Mutual Funds" | null>(null);

  const dStocks = deriveStocks(stocks);
  const dMfs = deriveMfs(mutualFunds);
  const total = totalEquityValue(stocks, mutualFunds) || 1;

  const stocksTotal = dStocks.reduce((s, x) => s + x.currentValue, 0);
  const mfsTotal = dMfs.reduce((s, x) => s + x.currentValue, 0);

  const ring1 = [
    { name: "Stocks", value: stocksTotal, color: "#1e3a8a" },
    { name: "Mutual Funds", value: mfsTotal, color: "#b91c1c" },
  ].filter((d) => d.value > 0);

  const sectorGroups = groupBy(dStocks, (s) => s.sector);
  const sectorData = Object.entries(sectorGroups).map(([sector, items], idx) => ({
    name: sector,
    value: items.reduce((s, x) => s + x.currentValue, 0),
    color: STOCK_COLORS[idx % STOCK_COLORS.length],
    group: "Stocks" as const,
  }));

  const mfCategoryGroups = groupBy(dMfs, (m) => m.category);
  const mfData = Object.entries(mfCategoryGroups).map(([cat, items], idx) => ({
    name: cat,
    value: items.reduce((s, x) => s + x.currentValue, 0),
    color: MF_COLORS[idx % MF_COLORS.length],
    group: "Mutual Funds" as const,
  }));

  const allDetail = [...sectorData, ...mfData];
  const ring2 = selectedGroup ? allDetail.filter((d) => d.group === selectedGroup) : allDetail;

  const innerRadius1 = inverted ? 92 : 42;
  const outerRadius1 = inverted ? 104 : 60;
  const innerRadius2 = inverted ? 40 : 66;
  const outerRadius2 = inverted ? 86 : 100;

  const handleRing1Click = (data: { name?: string }) => {
    if (data?.name === "Stocks" || data?.name === "Mutual Funds") {
      setSelectedGroup(data.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Portfolio Breakdown</DialogTitle>
          <DialogDescription>Tap a ring segment to drill down.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          {selectedGroup ? (
            <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(null)} className="gap-1 px-2">
              <ChevronLeft className="h-3.5 w-3.5" /> All
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Label htmlFor="invert-toggle" className="text-xs">
              Inverted View
            </Label>
            <Switch id="invert-toggle" checked={inverted} onCheckedChange={setInverted} />
          </div>
        </div>

        <div className="relative h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ring1}
                dataKey="value"
                nameKey="name"
                innerRadius={innerRadius1}
                outerRadius={outerRadius1}
                paddingAngle={2}
                onClick={handleRing1Click}
                cursor="pointer"
              >
                {ring1.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                ))}
              </Pie>
              <Pie data={ring2} dataKey="value" nameKey="name" innerRadius={innerRadius2} outerRadius={outerRadius2} paddingAngle={1.5}>
                {ring2.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const v = Number(value) || 0;
                  return [`${formatCurrency(v)} (${formatPercent((v / total) * 100)})`, String(name)];
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-sm font-bold">{formatCurrency(total, { compact: true })}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[11px]">
          {ring2.map((entry) => (
            <span key={entry.name} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name} · {formatPercent((entry.value / total) * 100)}
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

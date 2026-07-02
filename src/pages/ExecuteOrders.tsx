import * as React from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useHoldings } from "@/contexts/HoldingsContext";
import { useRebalance } from "@/contexts/RebalanceContext";
import { generateRecommendations } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function ExecuteOrders() {
  const navigate = useNavigate();
  const { selectedPortfolio } = usePortfolio();
  const { holdings } = useHoldings();
  const rebalance = useRebalance();
  const model = INVESTMENT_MODELS.find((m) => m.key === rebalance.selectedModel) ?? INVESTMENT_MODELS[0];
  const { stocks, mutualFunds } = holdings[selectedPortfolio];

  const { stockRecos, mfRecos } = generateRecommendations(stocks, mutualFunds, model, {
    additionalCash: rebalance.additionalCash,
    qtyAdjustments: rebalance.qtyAdjustments,
  });

  const stockOrders = stockRecos.filter((r) => r.action !== "HOLD").sort((a) => (a.action === "SELL" ? -1 : 1));
  const mfOrders = mfRecos.filter((r) => r.action !== "HOLD").sort((a) => (a.action === "SELL" ? -1 : 1));

  const [mktMap, setMktMap] = React.useState<Record<string, boolean>>({});
  const [priceMap, setPriceMap] = React.useState<Record<string, number>>({});
  const [tab, setTab] = React.useState<"stocks" | "mf">(stockOrders.length > 0 ? "stocks" : "mf");

  const isMkt = (id: string) => mktMap[id] ?? true;
  const priceFor = (id: string, fallback: number) => (priceMap[id] !== undefined ? priceMap[id] : fallback);

  const bothScopes = stockOrders.length > 0 && mfOrders.length > 0;

  const handlePlaceOrders = () => {
    navigate("/execution-mode", { state: { from: "rebalancer" } });
  };

  return (
    <MobileShell showBottomNav={false}>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold">Execute Orders</h1>
          <p className="text-xs text-muted-foreground">Review order details before placing.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "stocks" | "mf")}>
          {bothScopes && (
            <TabsList className="w-full">
              <TabsTrigger value="stocks" className="flex-1">
                Stocks
              </TabsTrigger>
              <TabsTrigger value="mf" className="flex-1">
                Mutual Funds
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="stocks">
            <Card>
              <CardContent className="p-3">
                {stockOrders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No stock orders.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockOrders.map((o) => {
                        const qty = Math.abs(o.newQty - o.currentQty);
                        return (
                          <TableRow key={o.id}>
                            <TableCell className="text-xs">{o.name}</TableCell>
                            <TableCell className="text-right text-xs">{qty}</TableCell>
                            <TableCell className="text-center">
                              <span className={cn("text-xs font-bold", o.action === "BUY" ? "text-success" : "text-destructive")}>
                                {o.action}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1.5">
                                <Input
                                  type="number"
                                  disabled={isMkt(o.id)}
                                  value={priceFor(o.id, o.ltp)}
                                  onChange={(e) => setPriceMap((p) => ({ ...p, [o.id]: Number(e.target.value) }))}
                                  className={cn("h-7 w-20 text-right text-xs", !isMkt(o.id) && "ring-1 ring-primary")}
                                />
                                <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Checkbox
                                    checked={isMkt(o.id)}
                                    onCheckedChange={(c) => setMktMap((p) => ({ ...p, [o.id]: !!c }))}
                                  />
                                  MKT
                                </label>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mf">
            <Card>
              <CardContent className="p-3">
                {mfOrders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No mutual fund orders.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fund</TableHead>
                        <TableHead className="text-right">Units</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-right">NAV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mfOrders.map((o) => {
                        const units = Math.abs(o.newUnits - o.currentUnits);
                        return (
                          <TableRow key={o.id}>
                            <TableCell className="text-xs">{o.name}</TableCell>
                            <TableCell className="text-right text-xs">{units.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <span className={cn("text-xs font-bold", o.action === "BUY" ? "text-success" : "text-destructive")}>
                                {o.action}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-xs">₹{o.nav.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/rebalancer")}>
            Back to Rebalancer
          </Button>
          <Button className="flex-1" onClick={handlePlaceOrders}>
            Place All Orders
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}

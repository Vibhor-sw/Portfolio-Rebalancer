import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import type { ExecutionModeVariant } from "./steps";
import { statusForOrder } from "./steps";

export interface OrderCardData {
  id: string;
  name: string;
  qty: number;
  price: number;
  unitLabel: string;
  type: "SELL" | "BUY";
}

interface OrderCardsProps {
  orders: OrderCardData[];
  mode: ExecutionModeVariant;
  currentStep: number;
  totalSteps: number;
}

const STATUS_STYLES: Record<string, string> = {
  submitted: "secondary",
  settling: "warning",
  settled: "success",
  queued: "secondary",
  executed: "success",
};

export function OrderCards({ orders, mode, currentStep, totalSteps }: OrderCardsProps) {
  const sellOrders = orders.filter((o) => o.type === "SELL");
  const buyOrders = orders.filter((o) => o.type === "BUY");

  const renderGroup = (title: string, group: OrderCardData[]) => (
    <div className="space-y-2">
      <p className={cn("text-xs font-bold uppercase tracking-wide", title === "Sell Orders" ? "text-destructive" : "text-success")}>
        {title}
      </p>
      {group.length === 0 ? (
        <p className="text-xs text-muted-foreground">None</p>
      ) : (
        group.map((o) => {
          const status = statusForOrder(mode, o.type, currentStep, totalSteps);
          return (
            <Card key={o.id}>
              <CardContent className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">{o.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.qty} {o.unitLabel} @ {formatCurrency(o.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(o.qty * o.price)}</p>
                  <Badge variant={(STATUS_STYLES[status] as "success" | "warning" | "secondary") ?? "secondary"} className="mt-0.5 capitalize">
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {renderGroup("Sell Orders", sellOrders)}
      {renderGroup("Buy Orders", buyOrders)}
    </div>
  );
}

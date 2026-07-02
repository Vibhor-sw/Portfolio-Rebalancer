import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InstrumentClass } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useExternalInvestment } from "@/contexts/ExternalInvestmentContext";

interface ProductDetailsCardProps {
  internal: Record<InstrumentClass, number>;
  external: Record<InstrumentClass, number>;
}

const CLASSES: InstrumentClass[] = ["Stocks", "Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];
const SHORT_LABEL: Record<InstrumentClass, string> = {
  Stocks: "Stocks",
  "Large Cap MF": "Large Cap",
  "Mid Cap MF": "Mid Cap",
  "Small Cap MF": "Small Cap",
  "Flexi Cap MF": "Flexi Cap",
};

export function ProductDetailsCard({ internal, external }: ProductDetailsCardProps) {
  const { hasFetched, includeExternal } = useExternalInvestment();
  const showExternal = hasFetched && includeExternal;

  const data = CLASSES.map((c) => ({
    name: SHORT_LABEL[c],
    Internal: Math.round(internal[c]),
    External: showExternal ? Math.round(external[c] ?? 0) : 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v, { compact: true })} width={56} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value) || 0)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="Internal" stackId="a" fill="hsl(var(--primary))" radius={showExternal ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
              {showExternal && <Bar dataKey="External" stackId="a" fill="hsl(var(--primary) / 0.35)" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {showExternal && (
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Internal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary/35" /> External
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

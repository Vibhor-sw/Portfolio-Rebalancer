import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InstrumentClass } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface OptimizationBreakdownProps {
  breakdown: Record<InstrumentClass, number>;
  targetPcts: Record<InstrumentClass, number>;
  totalValue: number;
}

const CLASSES: InstrumentClass[] = ["Stocks", "Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];

export function OptimizationBreakdown({ breakdown, targetPcts, totalValue }: OptimizationBreakdownProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Curr.%</TableHead>
          <TableHead className="text-right">Target%</TableHead>
          <TableHead className="text-right">Target Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {CLASSES.map((c) => {
          const currentPct = totalValue ? (breakdown[c] / totalValue) * 100 : 0;
          const targetPct = targetPcts[c] ?? 0;
          const targetValue = (targetPct / 100) * totalValue;
          return (
            <TableRow key={c}>
              <TableCell className="text-xs">{c}</TableCell>
              <TableCell className="text-right text-xs">{currentPct.toFixed(1)}%</TableCell>
              <TableCell className="text-right text-xs">{targetPct.toFixed(1)}%</TableCell>
              <TableCell className="text-right text-xs">{formatCurrency(targetValue)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="text-xs font-semibold">Total</TableCell>
          <TableCell className="text-right text-xs font-semibold">100.0%</TableCell>
          <TableCell className="text-right text-xs font-semibold">
            {CLASSES.reduce((s, c) => s + (targetPcts[c] ?? 0), 0).toFixed(1)}%
          </TableCell>
          <TableCell className="text-right text-xs font-semibold">{formatCurrency(totalValue)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

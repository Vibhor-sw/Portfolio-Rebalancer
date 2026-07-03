import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface DualPieDatum {
  name: string;
  currentValue: number;
  newValue: number;
  color: string;
}

interface DualPieChartProps {
  data: DualPieDatum[];
  leftLabel: string;
  rightLabel: string;
}

export function DualPieChart({ data, leftLabel, rightLabel }: DualPieChartProps) {
  const totalCurrent = data.reduce((s, d) => s + d.currentValue, 0) || 1;
  const totalNew = data.reduce((s, d) => s + d.newValue, 0) || 1;
  const leftData = data.filter((d) => d.currentValue > 0);
  const rightData = data.filter((d) => d.newValue > 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-center text-xs font-medium text-muted-foreground">{leftLabel}</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={leftData} dataKey="currentValue" nameKey="name" innerRadius={0} outerRadius={58} stroke="hsl(var(--card))" strokeWidth={2}>
                {leftData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="mb-1 text-center text-xs font-medium text-primary">{rightLabel}</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={rightData} dataKey="newValue" nameKey="name" innerRadius={0} outerRadius={58} stroke="hsl(var(--card))" strokeWidth={2}>
                {rightData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        {data.map((d) => (
          <span key={d.name} className={cn("flex items-center gap-1.5", d.currentValue === 0 && d.newValue === 0 && "opacity-40")}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} {((d.currentValue / totalCurrent) * 100).toFixed(0)}%→{((d.newValue / totalNew) * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}

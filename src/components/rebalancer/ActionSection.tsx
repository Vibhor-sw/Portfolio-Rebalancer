import * as React from "react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { RecommendationItem } from "./RecommendationItem";
import type { Recommendation } from "@/lib/types";
import { groupBy } from "@/lib/portfolio";
import { cn, formatPercent } from "@/lib/utils";

interface ActionSectionProps {
  label: "BUY" | "SELL" | "HOLD";
  items: Recommendation[];
  groupKey: (r: Recommendation) => string;
  onAdjust: (id: string, kind: "stock" | "mf", delta: number) => void;
  unitNoun?: string;
}

const SECTION_META: Record<
  ActionSectionProps["label"],
  { title: string; icon: React.ElementType; className: string }
> = {
  BUY: { title: "Buy Recommendations", icon: TrendingUp, className: "text-success" },
  SELL: { title: "Sell Recommendations", icon: TrendingDown, className: "text-destructive" },
  HOLD: { title: "Hold Recommendations", icon: Minus, className: "text-muted-foreground" },
};

export function ActionSection({ label, items, groupKey, onAdjust, unitNoun = "stock" }: ActionSectionProps) {
  const meta = SECTION_META[label];
  const groups = groupBy(items, groupKey);
  const groupEntries = Object.entries(groups);

  if (items.length === 0) {
    return (
      <div>
        <p className={cn("mb-1 flex items-center gap-1.5 text-sm font-semibold", meta.className)}>
          <meta.icon className="h-4 w-4" /> {meta.title}
        </p>
        <p className="text-xs text-muted-foreground">Nothing to {label.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={cn("flex items-center gap-1.5 text-sm font-semibold", meta.className)}>
        <meta.icon className="h-4 w-4" /> {meta.title}
      </p>
      {groupEntries.map(([group, groupItems]) => (
        <GroupBlock key={group} group={group} items={groupItems} onAdjust={onAdjust} unitNoun={unitNoun} />
      ))}
    </div>
  );
}

function GroupBlock({
  group,
  items,
  onAdjust,
  unitNoun,
}: {
  group: string;
  items: Recommendation[];
  onAdjust: ActionSectionProps["onAdjust"];
  unitNoun: string;
}) {
  const [open, setOpen] = React.useState(false);
  const totalAllocation = items.reduce((s, i) => s + i.currentAllocation, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
          {group}
        </span>
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {items.length} {items.length === 1 ? unitNoun : `${unitNoun}s`}
          </span>
          <span>
            Allocation: <span className="font-medium text-foreground">{formatPercent(totalAllocation)}</span>
          </span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {items.map((item) => (
          <RecommendationItem
            key={item.id}
            reco={item}
            onAdjust={(delta) => onAdjust(item.id, item.kind, delta)}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

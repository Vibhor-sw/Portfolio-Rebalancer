import * as React from "react";
import { ChevronDown } from "lucide-react";
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
}

const LABEL_STYLES: Record<string, string> = {
  BUY: "text-success",
  SELL: "text-destructive",
  HOLD: "text-muted-foreground",
};

export function ActionSection({ label, items, groupKey, onAdjust }: ActionSectionProps) {
  const groups = groupBy(items, groupKey);
  const groupEntries = Object.entries(groups);

  if (items.length === 0) {
    return (
      <div>
        <p className={cn("mb-1 text-xs font-bold uppercase tracking-wide", LABEL_STYLES[label])}>{label}</p>
        <p className="text-xs text-muted-foreground">Nothing to {label.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={cn("text-xs font-bold uppercase tracking-wide", LABEL_STYLES[label])}>{label}</p>
      {groupEntries.map(([group, groupItems]) => (
        <GroupBlock key={group} group={group} items={groupItems} onAdjust={onAdjust} />
      ))}
    </div>
  );
}

function GroupBlock({ group, items, onAdjust }: { group: string; items: Recommendation[]; onAdjust: ActionSectionProps["onAdjust"] }) {
  const [open, setOpen] = React.useState(true);
  const totalAllocation = items.reduce((s, i) => s + i.currentAllocation, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-secondary/60 px-3 py-2 text-xs font-medium">
        <span>
          {group} ({items.length})
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {formatPercent(totalAllocation)}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
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

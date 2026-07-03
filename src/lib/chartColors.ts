import type { InstrumentClass } from "./types";

export const INSTRUMENT_CLASS_COLORS: Record<InstrumentClass, string> = {
  Stocks: "#1d4ed8",
  "Large Cap MF": "#10b981",
  "Mid Cap MF": "#f59e0b",
  "Small Cap MF": "#ef4444",
  "Flexi Cap MF": "#93c5fd",
};

const CATEGORICAL_PALETTE = ["#1d4ed8", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export function categoricalColor(index: number): string {
  return CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];
}

/** Assigns a stable color to each unique name, in first-seen order. */
export function buildColorMap(names: string[]): Record<string, string> {
  const unique = Array.from(new Set(names));
  const map: Record<string, string> = {};
  unique.forEach((name, idx) => {
    map[name] = categoricalColor(idx);
  });
  return map;
}

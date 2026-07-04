import type { Recommendation, ModelKey } from "@/lib/types";

export const WHATIF_QUESTIONS: string[] = [
  "What if I reduce my Automobile sector exposure by 5%?",
  "What happens if I increase Financial Services allocation by 8%?",
  "What if I trim my largest stock holding by half?",
  "How would my portfolio look if I made my risk profile more conservative?",
  "What if I shift 10% from Small Cap MF to Large Cap MF?",
  "Should I exit my IT sector stocks?",
  "What if I increase my Flexi Cap MF allocation by 10%?",
  "How would a more aggressive risk profile change my recommendations?",
  "What if I add ₹1,00,000 additional investment to my portfolio?",
  "What's the impact of reducing my Energy sector exposure by 5%?",
];

/**
 * Builds a short (2-3), contextually relevant set of suggested questions based on the
 * BUY/SELL movements in the just-computed rebalanced mix, so the landing screen reflects
 * what actually changed rather than a generic canned list.
 */
export function getContextualQuestions(
  stockRecos: Recommendation[],
  mfRecos: Recommendation[],
  currentModel: ModelKey
): string[] {
  const deltas = new Map<string, number>();
  const bump = (label: string, delta: number) => deltas.set(label, (deltas.get(label) ?? 0) + delta);

  for (const r of stockRecos) {
    if (r.kind === "stock") bump(r.sector, r.newAllocation - r.currentAllocation);
  }
  for (const r of mfRecos) {
    if (r.kind === "mf") bump(r.category, r.newAllocation - r.currentAllocation);
  }

  const entries = Array.from(deltas.entries()).filter(([, delta]) => Math.abs(delta) > 0.05);
  const biggestCut = entries.filter(([, d]) => d < 0).sort((a, b) => a[1] - b[1])[0];
  const biggestAdd = entries.filter(([, d]) => d > 0).sort((a, b) => b[1] - a[1])[0];

  const questions: string[] = [];
  if (biggestCut) questions.push(`What if I reduce my ${biggestCut[0]} exposure by another 5%?`);
  if (biggestAdd) questions.push(`What if I increase my ${biggestAdd[0]} allocation by another 5%?`);
  questions.push(
    currentModel === "smart_beta"
      ? "How would a more aggressive risk profile change my recommendations?"
      : "How would my portfolio look if I made my risk profile more conservative?"
  );

  const unique = Array.from(new Set(questions));
  return unique.length >= 2 ? unique.slice(0, 3) : WHATIF_QUESTIONS.slice(0, 3);
}

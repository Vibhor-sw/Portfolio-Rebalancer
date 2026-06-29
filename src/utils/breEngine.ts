import type { Fund, RebalancingModel } from '../types/rebalancer';

export function getRatingPriority(fund: Fund): number {
  const g = fund.geojitRating;
  const m = fund.morningstarRating;
  if (g === 5) return 100;
  if (g === 4) return 90;
  if (m === 5) return 80;
  if (m === 4) return 70;
  if (g === 3 || m === 3) return 60;
  return 0;
}

export function getReplacements(source: Fund, allFunds: Fund[], userHoldings: Fund[]): Fund[] {
  const heldIds = new Set(userHoldings.map(f => f.id));
  return allFunds
    .filter(f =>
      f.subCategory === source.subCategory &&
      f.id !== source.id &&
      !heldIds.has(f.id) &&
      f.sipStatus !== 'Sell In Progress'
    )
    .sort((a, b) => getRatingPriority(b) - getRatingPriority(a))
    .slice(0, 3);
}

export function getModelAllocations(
  replacements: Fund[],
  model: RebalancingModel,
  totalUnits: number
): Record<string, number> {
  const result: Record<string, number> = {};
  if (replacements.length === 0) return result;

  if (model === 'Smart Alpha') {
    const sorted = [...replacements].sort((a, b) => getRatingPriority(b) - getRatingPriority(a));
    result[sorted[0].id] = Math.round(totalUnits * 0.7);
    if (sorted[1]) result[sorted[1].id] = Math.round(totalUnits * 0.2);
    if (sorted[2]) result[sorted[2].id] = Math.round(totalUnits * 0.1);
  } else if (model === 'Balanced Beta') {
    const share = Math.round(totalUnits / replacements.length);
    replacements.forEach(f => { result[f.id] = share; });
  } else {
    // Research Driven — weight by CAGR 3Y
    const total3Y = replacements.reduce((s, f) => s + (f.cagr3Y ?? 0), 0);
    replacements.forEach(f => {
      result[f.id] = total3Y > 0
        ? Math.round(totalUnits * ((f.cagr3Y ?? 0) / total3Y))
        : Math.round(totalUnits / replacements.length);
    });
  }
  return result;
}

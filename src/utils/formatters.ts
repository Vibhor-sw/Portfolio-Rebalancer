import type { Fund, RatingTier } from '../types/rebalancer';

export function formatINR(amount: number): string {
  return '₹' + Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatPnL(pnl: number): { text: string; positive: boolean } {
  return {
    text: (pnl >= 0 ? '+' : '−') + formatINR(Math.abs(pnl)),
    positive: pnl >= 0,
  };
}

export function getRatingTier(fund: Pick<Fund, 'geojitRating' | 'morningstarRating'>): RatingTier {
  const g = fund.geojitRating;
  const m = fund.morningstarRating;
  const effective = g !== null ? g : m;
  if (effective === null) return 'Not Rated';
  if (effective >= 4) return 'Highly Rated';
  if (effective === 3) return 'Moderately Rated';
  return 'Need Attention';
}

export function getTierColor(tier: RatingTier): string {
  switch (tier) {
    case 'Highly Rated': return '#16a34a';
    case 'Moderately Rated': return '#ea580c';
    case 'Need Attention': return '#dc2626';
    case 'Not Rated': return '#6b7280';
  }
}

export function getTierBg(tier: RatingTier): string {
  switch (tier) {
    case 'Highly Rated': return 'bg-green-50 border-green-200';
    case 'Moderately Rated': return 'bg-orange-50 border-orange-200';
    case 'Need Attention': return 'bg-red-50 border-red-200';
    case 'Not Rated': return 'bg-gray-50 border-gray-200';
  }
}

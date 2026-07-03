export interface Fund {
  id: string;
  fundName: string;
  subCategory: string;
  option: string; // 'Growth' | 'IDCW'
  plan: string; // 'Direct' | 'Regular'
  geojitRating: number | null; // 1-5 or null
  morningstarRating: number | null; // 1-5 or null
  holdingValue: number;
  investedValue: number;
  xirr: number; // percentage
  sipStatus: 'Active' | 'Paused' | 'Sell In Progress' | null;
  isExternal: boolean;
  amcInitials: string;
  amcColor: string;
  badge?: 'Gold' | 'Silver' | null;
  cagr1Y?: number | null;
  cagr3Y?: number | null;
  cagr5Y?: number | null;
  nav?: number | null; // NAV in ₹ — 4 decimal places when displayed
}

export type OrderMode = 'instant_credit' | 'wait_settlement';

export type RatingTier = 'Highly Rated' | 'Moderately Rated' | 'Need Attention' | 'Not Rated';

export interface RatingGroup {
  tier: RatingTier;
  funds: Fund[];
  totalHolding: number;
  totalInvested: number;
  pnl: number;
  portfolioPercent: number;
}

export interface BreResult {
  sourceFundId: string;
  replacements: Fund[];
}

export type RebalancingModel = 'Smart Alpha' | 'Balanced Beta' | 'Research Driven';

export interface ModelAllocation {
  fundId: string;
  units: Record<string, number>; // replacementFundId -> units
}

export interface GroupBreResult {
  subCategory: string;
  sourceFundIds: string[];
  replacements: Fund[];
}

export interface ConsentState {
  consentGiven: boolean;
  selectedModel: RebalancingModel | null;
  breResults: BreResult[];
  selectedFundsForSwitch: string[]; // fund IDs
}

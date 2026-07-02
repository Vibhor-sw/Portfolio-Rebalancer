export type PortfolioId = "default" | "portfolio1" | "portfolio2" | "portfolio3" | "portfolio4" | "portfolio5";

export type InstrumentClass = "Stocks" | "Large Cap MF" | "Mid Cap MF" | "Small Cap MF" | "Flexi Cap MF";

export type ModelKey = "balanced_alpha" | "smart_beta" | "research_driven";

export interface InvestmentModel {
  key: ModelKey;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  targetMix: Record<InstrumentClass, number>;
}

export interface StockHolding {
  id: string;
  stockName: string;
  symbol: string;
  sector: string;
  qty: number;
  avgPrice: number;
  ltp: number;
}

export interface MutualFundHolding {
  id: string;
  schemeName: string;
  category: Exclude<InstrumentClass, "Stocks">;
  units: number;
  avgNav: number;
  prevNav: number;
}

export interface PortfolioMeta {
  id: PortfolioId;
  name: string;
}

export interface ExternalInvestment {
  id: string;
  name: string;
  type: InstrumentClass;
  investedValue: number;
  currentValue: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  changePercent: number;
}

export interface UserProfile {
  name: string;
  age: number;
  maritalStatus: string;
  profession: string;
  city: string;
  riskProfile: string;
  investmentSummary: string;
  personality: string;
  habits: string[];
}

export type RecoAction = "BUY" | "SELL" | "HOLD";

export interface StockRecommendation {
  kind: "stock";
  action: RecoAction;
  id: string;
  name: string;
  symbol: string;
  sector: string;
  currentQty: number;
  newQty: number;
  ltp: number;
  currentAllocation: number;
  newAllocation: number;
  external?: boolean;
}

export interface MfRecommendation {
  kind: "mf";
  action: RecoAction;
  id: string;
  name: string;
  symbol: string;
  category: Exclude<InstrumentClass, "Stocks">;
  marketCap: Exclude<InstrumentClass, "Stocks">;
  currentUnits: number;
  newUnits: number;
  nav: number;
  currentAllocation: number;
  newAllocation: number;
  external?: boolean;
}

export type Recommendation = StockRecommendation | MfRecommendation;

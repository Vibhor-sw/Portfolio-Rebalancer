import type {
  StockHolding,
  MutualFundHolding,
  InstrumentClass,
  InvestmentModel,
  MfRecommendation,
  StockRecommendation,
  RecoAction,
} from "./types";

export interface StockDerived extends StockHolding {
  invested: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
}

export interface MfDerived extends MutualFundHolding {
  invested: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
}

export function totalEquityValue(stocks: StockHolding[], mfs: MutualFundHolding[]) {
  const stockValue = stocks.reduce((sum, s) => sum + s.qty * s.ltp, 0);
  const mfValue = mfs.reduce((sum, m) => sum + m.units * m.avgNav, 0);
  return stockValue + mfValue;
}

export function deriveStocks(stocks: StockHolding[]): StockDerived[] {
  const totalValue = totalEquityValue(stocks, []) || 1;
  return stocks.map((s) => {
    const invested = s.qty * s.avgPrice;
    const currentValue = s.qty * s.ltp;
    const unrealizedPL = currentValue - invested;
    return {
      ...s,
      invested,
      currentValue,
      unrealizedPL,
      unrealizedPLPercent: invested ? (unrealizedPL / invested) * 100 : 0,
      allocationPercent: (currentValue / totalValue) * 100,
    };
  });
}

export function deriveMfs(mfs: MutualFundHolding[]): MfDerived[] {
  const totalValue = mfs.reduce((sum, m) => sum + m.units * m.avgNav, 0) || 1;
  return mfs.map((m) => {
    const invested = m.units * m.avgNav;
    const currentValue = m.units * m.prevNav;
    const unrealizedPL = currentValue - invested;
    return {
      ...m,
      invested,
      currentValue,
      unrealizedPL,
      unrealizedPLPercent: invested ? (unrealizedPL / invested) * 100 : 0,
      allocationPercent: (currentValue / totalValue) * 100,
    };
  });
}

export function portfolioAggregate(stocks: StockHolding[], mfs: MutualFundHolding[]) {
  const dStocks = deriveStocks(stocks);
  const dMfs = deriveMfs(mfs);
  const currentValue = dStocks.reduce((s, x) => s + x.currentValue, 0) + dMfs.reduce((s, x) => s + x.currentValue, 0);
  const investedValue = dStocks.reduce((s, x) => s + x.invested, 0) + dMfs.reduce((s, x) => s + x.invested, 0);
  const unrealizedPL = currentValue - investedValue;
  return {
    currentValue,
    investedValue,
    unrealizedPL,
    unrealizedPLPercent: investedValue ? (unrealizedPL / investedValue) * 100 : 0,
  };
}

export function instrumentClassBreakdown(
  stocks: StockHolding[],
  mfs: MutualFundHolding[]
): Record<InstrumentClass, number> {
  const dStocks = deriveStocks(stocks);
  const dMfs = deriveMfs(mfs);
  const breakdown: Record<InstrumentClass, number> = {
    Stocks: dStocks.reduce((s, x) => s + x.currentValue, 0),
    "Large Cap MF": dMfs.filter((m) => m.category === "Large Cap MF").reduce((s, x) => s + x.currentValue, 0),
    "Mid Cap MF": dMfs.filter((m) => m.category === "Mid Cap MF").reduce((s, x) => s + x.currentValue, 0),
    "Small Cap MF": dMfs.filter((m) => m.category === "Small Cap MF").reduce((s, x) => s + x.currentValue, 0),
    "Flexi Cap MF": dMfs.filter((m) => m.category === "Flexi Cap MF").reduce((s, x) => s + x.currentValue, 0),
  };
  return breakdown;
}

function resolveAction(currentQty: number, newQty: number): RecoAction {
  if (currentQty <= 0 && newQty > 0) return "BUY";
  const diffRatio = currentQty === 0 ? (newQty > 0 ? 1 : 0) : Math.abs(newQty - currentQty) / currentQty;
  if (diffRatio < 0.02) return "HOLD";
  return newQty > currentQty ? "BUY" : "SELL";
}

export interface RecommendationOptions {
  additionalCash?: number;
  targetMixOverride?: Partial<Record<InstrumentClass, number>>;
  qtyAdjustments?: Record<string, number>;
}

export function generateRecommendations(
  stocks: StockHolding[],
  mfs: MutualFundHolding[],
  model: InvestmentModel,
  options: RecommendationOptions = {}
): { stockRecos: StockRecommendation[]; mfRecos: MfRecommendation[] } {
  const additionalCash = options.additionalCash ?? 0;
  const targetMix = { ...model.targetMix, ...(options.targetMixOverride ?? {}) };
  const dStocks = deriveStocks(stocks);
  const dMfs = deriveMfs(mfs);
  const totalCurrent = totalEquityValue(stocks, mfs);
  const totalPool = totalCurrent + additionalCash;

  const breakdown = instrumentClassBreakdown(stocks, mfs);

  const stockRecos: StockRecommendation[] = dStocks.map((s) => {
    const classCurrent = breakdown.Stocks || 1;
    const classTarget = (totalPool * targetMix.Stocks) / 100;
    const share = s.currentValue / classCurrent;
    const targetValue = classTarget * share;
    let newQty = Math.max(0, Math.round(targetValue / s.ltp));
    if (options.qtyAdjustments && options.qtyAdjustments[s.id] !== undefined) {
      newQty = options.qtyAdjustments[s.id];
    }
    const newValue = newQty * s.ltp;
    return {
      kind: "stock",
      action: resolveAction(s.qty, newQty),
      id: s.id,
      name: s.stockName,
      symbol: s.symbol,
      sector: s.sector,
      currentQty: s.qty,
      newQty,
      ltp: s.ltp,
      currentAllocation: (s.currentValue / totalCurrent) * 100,
      newAllocation: (newValue / totalPool) * 100,
    };
  });

  const mfCategories: Exclude<InstrumentClass, "Stocks">[] = ["Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];
  const mfRecos: MfRecommendation[] = dMfs.map((m) => {
    const classCurrent = breakdown[m.category] || 1;
    const classTarget = (totalPool * targetMix[m.category]) / 100;
    const share = m.currentValue / classCurrent;
    const targetValue = classTarget * share;
    let newUnits = Math.max(0, Math.round((targetValue / m.prevNav) * 100) / 100);
    if (options.qtyAdjustments && options.qtyAdjustments[m.id] !== undefined) {
      newUnits = options.qtyAdjustments[m.id];
    }
    const newValue = newUnits * m.prevNav;
    return {
      kind: "mf",
      action: resolveAction(m.units, newUnits),
      id: m.id,
      name: m.schemeName,
      symbol: m.schemeName,
      category: m.category,
      marketCap: m.category,
      currentUnits: m.units,
      newUnits,
      nav: m.prevNav,
      currentAllocation: (m.currentValue / totalCurrent) * 100,
      newAllocation: (newValue / totalPool) * 100,
    };
  });

  void mfCategories;
  return { stockRecos, mfRecos };
}

export function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

import type {
  PortfolioMeta,
  PortfolioId,
  StockHolding,
  MutualFundHolding,
  InvestmentModel,
  UserProfile,
  MarketIndex,
} from "./types";

export const PORTFOLIOS: PortfolioMeta[] = [
  { id: "default", name: "Default Portfolio" },
  { id: "portfolio1", name: "Portfolio 1" },
  { id: "portfolio2", name: "Portfolio 2" },
  { id: "portfolio3", name: "Portfolio 3" },
  { id: "portfolio4", name: "Portfolio 4" },
  { id: "portfolio5", name: "Portfolio 5" },
];

export const USER_PROFILE: UserProfile = {
  name: "Aditi Sharma",
  age: 39,
  maritalStatus: "Married",
  profession: "VP - Finance",
  city: "Indore",
  riskProfile: "Moderate",
  investmentSummary:
    "Aditi has built a sizeable equity portfolio over the last decade, largely concentrated in large-cap and blue-chip stocks. One long-held position has appreciated sharply and now dominates her holdings, creating concentration risk she hasn't actively managed.",
  personality:
    "A financially savvy, moderate-risk professional who prefers holding long-term winners over frequent trading. Reviews her portfolio quarterly but doesn't actively track allocation drift.",
  habits: [
    "Invests primarily in large-cap and blue-chip stocks",
    "Prefers holding long-term winners rather than booking profits",
    "Occasionally adds positions in sectors she is already familiar with",
    "Reviews portfolio quarterly, not continuously",
    "Rarely rebalances proactively",
  ],
};

export const MARKET_INDICES: MarketIndex[] = [
  { name: "NIFTY 50", value: 24812.35, changePercent: 0.42 },
  { name: "SENSEX", value: 81523.14, changePercent: 0.38 },
  { name: "BANK NIFTY", value: 52104.6, changePercent: -0.21 },
  { name: "S&P 500", value: 6187.44, changePercent: 0.55 },
  { name: "DOW JONES", value: 43907.12, changePercent: 0.12 },
  { name: "NIKKEI 225", value: 39812.77, changePercent: -0.63 },
  { name: "FTSE 100", value: 8312.9, changePercent: 0.19 },
  { name: "HANG SENG", value: 23988.41, changePercent: -0.85 },
  { name: "DAX", value: 19245.33, changePercent: 0.27 },
];

export const INVESTMENT_MODELS: InvestmentModel[] = [
  {
    key: "balanced_alpha",
    name: "Balanced Alpha",
    icon: "🚀",
    tagline: "Moderate-to-high volatility, targets stronger growth",
    description:
      "Balanced Alpha tilts towards mid and small cap opportunities alongside a core of quality stocks, aiming for stronger long-term growth while accepting higher short-term volatility.",
    expectedReturn: 15.8,
    volatility: 18.2,
    sharpeRatio: 0.87,
    targetMix: {
      Stocks: 30,
      "Large Cap MF": 20,
      "Mid Cap MF": 25,
      "Small Cap MF": 15,
      "Flexi Cap MF": 10,
    },
  },
  {
    key: "smart_beta",
    name: "Smart Beta",
    icon: "⚖️",
    tagline: "Stability-first, long-term moderate risk",
    description:
      "Smart Beta favours large cap and flexi cap exposure for stability, keeping mid/small cap exposure limited. Designed for investors who want steady, moderate-risk long-term compounding.",
    expectedReturn: 12.4,
    volatility: 12.1,
    sharpeRatio: 0.91,
    targetMix: {
      Stocks: 15,
      "Large Cap MF": 40,
      "Mid Cap MF": 20,
      "Small Cap MF": 10,
      "Flexi Cap MF": 15,
    },
  },
  {
    key: "research_driven",
    name: "Research-Driven",
    icon: "📖",
    tagline: "Strongest research conviction, risk-aware",
    description:
      "Research-Driven allocates based on the highest-conviction research calls across stocks and funds, balancing conviction bets with risk-aware diversification across market caps.",
    expectedReturn: 14.1,
    volatility: 14.6,
    sharpeRatio: 0.89,
    targetMix: {
      Stocks: 25,
      "Large Cap MF": 30,
      "Mid Cap MF": 20,
      "Small Cap MF": 10,
      "Flexi Cap MF": 15,
    },
  },
];

const STOCK_UNIVERSE: { stockName: string; symbol: string; sector: string }[] = [
  { stockName: "Reliance Industries", symbol: "RELIANCE", sector: "Energy" },
  { stockName: "HDFC Bank", symbol: "HDFCBANK", sector: "Banking" },
  { stockName: "ICICI Bank", symbol: "ICICIBANK", sector: "Banking" },
  { stockName: "Infosys", symbol: "INFY", sector: "IT" },
  { stockName: "Tata Consultancy Services", symbol: "TCS", sector: "IT" },
  { stockName: "Hindustan Unilever", symbol: "HINDUNILVR", sector: "FMCG" },
  { stockName: "ITC", symbol: "ITC", sector: "FMCG" },
  { stockName: "Larsen & Toubro", symbol: "LT", sector: "Capital Goods" },
  { stockName: "Bharti Airtel", symbol: "BHARTIARTL", sector: "Telecom" },
  { stockName: "Maruti Suzuki", symbol: "MARUTI", sector: "Automobile" },
  { stockName: "Tata Motors", symbol: "TATAMOTORS", sector: "Automobile" },
  { stockName: "Siemens India", symbol: "SIEMENS", sector: "Capital Goods" },
  { stockName: "Sun Pharma", symbol: "SUNPHARMA", sector: "Pharma" },
  { stockName: "Axis Bank", symbol: "AXISBANK", sector: "Banking" },
  { stockName: "Wipro", symbol: "WIPRO", sector: "IT" },
];

const MF_UNIVERSE: { schemeName: string; category: "Large Cap MF" | "Mid Cap MF" | "Small Cap MF" | "Flexi Cap MF" }[] = [
  { schemeName: "HDFC Top 100 Fund", category: "Large Cap MF" },
  { schemeName: "ICICI Prudential Bluechip Fund", category: "Large Cap MF" },
  { schemeName: "HDFC Mid-Cap Opportunities Fund", category: "Mid Cap MF" },
  { schemeName: "Kotak Emerging Equity Fund", category: "Mid Cap MF" },
  { schemeName: "SBI Small Cap Fund", category: "Small Cap MF" },
  { schemeName: "Nippon India Small Cap Fund", category: "Small Cap MF" },
  { schemeName: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap MF" },
  { schemeName: "UTI Flexi Cap Fund", category: "Flexi Cap MF" },
];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(id: PortfolioId): number {
  const map: Record<PortfolioId, number> = {
    default: 42,
    portfolio1: 101,
    portfolio2: 202,
    portfolio3: 303,
    portfolio4: 404,
    portfolio5: 505,
  };
  return map[id];
}

interface GeneratedHoldings {
  stocks: StockHolding[];
  mutualFunds: MutualFundHolding[];
}

function generateHoldings(id: PortfolioId): GeneratedHoldings {
  const rand = mulberry32(seedFor(id));
  const stockCount = id === "default" ? 8 : 4 + Math.floor(rand() * 4);
  const mfCount = id === "default" ? 6 : 3 + Math.floor(rand() * 3);

  const shuffledStocks = [...STOCK_UNIVERSE].sort(() => rand() - 0.5).slice(0, stockCount);
  const shuffledMfs = [...MF_UNIVERSE].sort(() => rand() - 0.5).slice(0, mfCount);

  const stocks: StockHolding[] = shuffledStocks.map((s, idx) => {
    const avgPrice = Math.round(200 + rand() * 2800);
    const drift = 1 + (rand() - 0.35) * 0.6;
    const ltp = Math.round(avgPrice * drift);
    // Aditi's persona: one dominant concentrated winner in default portfolio
    const isConcentrated = id === "default" && idx === 0;
    const qty = isConcentrated ? 800 + Math.floor(rand() * 400) : 10 + Math.floor(rand() * 120);
    return {
      id: `${id}-stk-${s.symbol}`,
      stockName: s.stockName,
      symbol: s.symbol,
      sector: s.sector,
      qty,
      avgPrice,
      ltp: isConcentrated ? Math.round(avgPrice * 2.8) : ltp,
    };
  });

  const mutualFunds: MutualFundHolding[] = shuffledMfs.map((m) => {
    const avgNav = Math.round((20 + rand() * 180) * 100) / 100;
    const prevNav = Math.round(avgNav * (1 + (rand() - 0.3) * 0.4) * 100) / 100;
    const units = Math.round((500 + rand() * 5000) * 100) / 100;
    return {
      id: `${id}-mf-${m.schemeName.replace(/\s+/g, "_")}`,
      schemeName: m.schemeName,
      category: m.category,
      units,
      avgNav,
      prevNav,
    };
  });

  return { stocks, mutualFunds };
}

const HOLDINGS_CACHE = new Map<PortfolioId, GeneratedHoldings>();

export function getInitialHoldings(id: PortfolioId): GeneratedHoldings {
  if (!HOLDINGS_CACHE.has(id)) {
    HOLDINGS_CACHE.set(id, generateHoldings(id));
  }
  const cached = HOLDINGS_CACHE.get(id)!;
  return { stocks: cached.stocks.map((s) => ({ ...s })), mutualFunds: cached.mutualFunds.map((m) => ({ ...m })) };
}

export const EXTERNAL_INVESTMENT_POOL_MF = [
  { name: "Axis Bluechip Fund", type: "Large Cap MF" as const },
  { name: "Mirae Asset Emerging Bluechip", type: "Mid Cap MF" as const },
  { name: "Franklin India Smaller Companies Fund", type: "Small Cap MF" as const },
  { name: "Quant Flexi Cap Fund", type: "Flexi Cap MF" as const },
];

export const EXTERNAL_INVESTMENT_POOL_STOCKS = [
  { name: "Bajaj Finance", type: "Stocks" as const },
  { name: "Titan Company", type: "Stocks" as const },
  { name: "Asian Paints", type: "Stocks" as const },
];

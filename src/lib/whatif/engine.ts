import type { StockHolding, MutualFundHolding, InvestmentModel, InstrumentClass } from "@/lib/types";
import { deriveStocks, instrumentClassBreakdown, totalEquityValue } from "@/lib/portfolio";
import { INVESTMENT_MODELS } from "@/lib/mockData";
import type { WhatIfResponse, WhatIfTableRow } from "./types";
import { WHATIF_QUESTIONS } from "./questions";

interface Bucket {
  key: string;
  label: string;
  type: "sector" | "class";
  stockIds: string[];
  mfIds: string[];
  value: number;
}

interface EngineCtx {
  stocks: StockHolding[];
  mfs: MutualFundHolding[];
  buckets: Bucket[];
  totalCurrent: number;
  model: InvestmentModel;
}

const INSTRUMENT_CLASSES: InstrumentClass[] = ["Stocks", "Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"];

const SECTOR_ALIASES: [string, string][] = [
  ["financial services", "Banking"],
  ["banking sector", "Banking"],
  ["banking", "Banking"],
  ["banks", "Banking"],
  ["bank", "Banking"],
  ["automobile sector", "Automobile"],
  ["automobiles", "Automobile"],
  ["automobile", "Automobile"],
  ["auto sector", "Automobile"],
  ["auto", "Automobile"],
  ["information technology", "IT"],
  ["it sector", "IT"],
  ["technology", "IT"],
  ["tech", "IT"],
  ["it", "IT"],
  ["fmcg", "FMCG"],
  ["consumer goods", "FMCG"],
  ["capital goods", "Capital Goods"],
  ["engineering sector", "Capital Goods"],
  ["telecom sector", "Telecom"],
  ["telecommunications", "Telecom"],
  ["telecom", "Telecom"],
  ["pharmaceuticals", "Pharma"],
  ["pharma sector", "Pharma"],
  ["pharma", "Pharma"],
  ["energy sector", "Energy"],
  ["oil and gas", "Energy"],
  ["energy", "Energy"],
];

const CLASS_ALIASES: [string, InstrumentClass][] = [
  ["large cap mf", "Large Cap MF"],
  ["large cap", "Large Cap MF"],
  ["largecap", "Large Cap MF"],
  ["large-cap", "Large Cap MF"],
  ["mid cap mf", "Mid Cap MF"],
  ["mid cap", "Mid Cap MF"],
  ["midcap", "Mid Cap MF"],
  ["mid-cap", "Mid Cap MF"],
  ["small cap mf", "Small Cap MF"],
  ["small cap", "Small Cap MF"],
  ["smallcap", "Small Cap MF"],
  ["small-cap", "Small Cap MF"],
  ["flexi cap mf", "Flexi Cap MF"],
  ["flexi cap", "Flexi Cap MF"],
  ["flexicap", "Flexi Cap MF"],
  ["flexi-cap", "Flexi Cap MF"],
  ["direct stocks", "Stocks"],
  ["equity stocks", "Stocks"],
  ["stocks", "Stocks"],
];

const IN_SCOPE_KEYWORDS = [
  "rebalance", "rebalancing", "what if", "what-if", "allocation", "risk", "portfolio", "holdings",
  "scenario", "increase", "decrease", "add", "reduce", "buy", "sell", "transfer", "move", "shift",
  "weight", "exposure", "conservative", "aggressive", "exit", "trim", "cut", "invest", "cash", "fund",
];

const OUT_OF_SCOPE_HINTS = [
  "weather", "joke", "movie", "cricket score", "football score", "recipe", "song", "lyrics",
  "bitcoin price", "news", "capital of", "who is the president", "programming question", "leetcode",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matches(q: string, alias: string): boolean {
  return new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(q);
}

function matchIndex(q: string, alias: string): number {
  const m = new RegExp(`\\b${escapeRegExp(alias)}\\b`).exec(q);
  return m ? m.index : -1;
}

interface BucketRefMatch {
  label: string;
  type: "sector" | "class";
  index: number;
  aliasLength: number;
}

function rankedBucketRefs(q: string): BucketRefMatch[] {
  const all: BucketRefMatch[] = [];
  for (const [alias, canonical] of [...CLASS_ALIASES, ...SECTOR_ALIASES] as [string, string][]) {
    const index = matchIndex(q, alias);
    if (index === -1) continue;
    const type: "sector" | "class" = INSTRUMENT_CLASSES.includes(canonical as InstrumentClass) ? "class" : "sector";
    all.push({ label: canonical, type, index, aliasLength: alias.length });
  }
  // Earliest match in the query wins; ties broken by the more specific (longer) alias.
  all.sort((a, b) => a.index - b.index || b.aliasLength - a.aliasLength);
  return all;
}

function resolveBucketRef(q: string): { label: string; type: "sector" | "class" } | null {
  const ranked = rankedBucketRefs(q);
  return ranked.length > 0 ? { label: ranked[0].label, type: ranked[0].type } : null;
}

function resolveAllBucketRefs(q: string): { label: string; type: "sector" | "class" }[] {
  const found: { label: string; type: "sector" | "class" }[] = [];
  const seen = new Set<string>();
  for (const match of rankedBucketRefs(q)) {
    const key = `${match.type}:${match.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      found.push({ label: match.label, type: match.type });
    }
  }
  return found;
}

function extractPercent(q: string): number | null {
  const m = q.match(/(\d+(\.\d+)?)\s*%/);
  if (m) return parseFloat(m[1]);
  if (/by half/.test(q)) return 50;
  return null;
}

function extractAmount(q: string): number | null {
  const lakhMatch = q.match(/(\d+(\.\d+)?)\s*(lakh|lac)s?\b/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);
  const crMatch = q.match(/(\d+(\.\d+)?)\s*(cr|crore)s?\b/);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  const rupeeMatch = q.match(/₹\s?([\d,]{3,})/) || q.match(/\b([\d,]{5,})\b/);
  if (rupeeMatch) {
    const n = parseInt(rupeeMatch[1].replace(/,/g, ""), 10);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function sample(n = 3): string[] {
  const shuffled = [...WHATIF_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildBuckets(stocks: StockHolding[], mfs: MutualFundHolding[]): Bucket[] {
  const dStocks = deriveStocks(stocks);
  const sectorMap = new Map<string, Bucket>();
  for (const s of dStocks) {
    const key = `sector:${s.sector}`;
    const existing = sectorMap.get(key);
    if (existing) {
      existing.value += s.currentValue;
      existing.stockIds.push(s.id);
    } else {
      sectorMap.set(key, { key, label: s.sector, type: "sector", stockIds: [s.id], mfIds: [], value: s.currentValue });
    }
  }
  const classMap = new Map<string, Bucket>();
  const stocksClassValue = dStocks.reduce((sum, s) => sum + s.currentValue, 0);
  if (dStocks.length > 0) {
    classMap.set("class:Stocks", {
      key: "class:Stocks",
      label: "Stocks",
      type: "class",
      stockIds: dStocks.map((s) => s.id),
      mfIds: [],
      value: stocksClassValue,
    });
  }
  const breakdown = instrumentClassBreakdown(stocks, mfs);
  for (const cat of ["Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"] as const) {
    const ids = mfs.filter((m) => m.category === cat).map((m) => m.id);
    if (ids.length > 0) {
      classMap.set(`class:${cat}`, { key: `class:${cat}`, label: cat, type: "class", stockIds: [], mfIds: ids, value: breakdown[cat] });
    }
  }
  return [...sectorMap.values(), ...classMap.values()];
}

function applyScale(ctx: EngineCtx, stockIds: string[], mfIds: string[], factor: number, out: Record<string, number>) {
  for (const s of ctx.stocks) {
    if (stockIds.includes(s.id)) out[s.id] = Math.max(0, Math.round(s.qty * factor));
  }
  for (const m of ctx.mfs) {
    if (mfIds.includes(m.id)) out[m.id] = Math.max(0, Math.round(m.units * factor * 100) / 100);
  }
}

function otherIds(ctx: EngineCtx, bucket: Bucket): { stockIds: string[]; mfIds: string[] } {
  return {
    stockIds: ctx.stocks.filter((s) => !bucket.stockIds.includes(s.id)).map((s) => s.id),
    mfIds: ctx.mfs.filter((m) => !bucket.mfIds.includes(m.id)).map((m) => m.id),
  };
}

function otherValue(ctx: EngineCtx, bucket: Bucket): number {
  return ctx.totalCurrent - bucket.value;
}

function tableRow(label: string, currentValue: number, newValue: number, totalCurrent: number, totalPool: number): WhatIfTableRow {
  return {
    label,
    currentPercent: (currentValue / totalCurrent) * 100,
    newPercent: (newValue / totalPool) * 100,
    currentValue,
    newValue,
  };
}

function findBucket(ctx: EngineCtx, ref: { label: string; type: "sector" | "class" }): Bucket | undefined {
  return ctx.buckets.find((b) => b.type === ref.type && b.label === ref.label);
}

function noHoldingsResponse(ref: { label: string; type: "sector" | "class" }): WhatIfResponse {
  return {
    inScope: true,
    message: `You don't currently hold any ${ref.label} ${ref.type === "sector" ? "stocks" : "exposure"} in this portfolio, so there's nothing to adjust there yet. You can add this instrument type via Advanced Settings in the Optimizer, or try a different sector/fund category.`,
    relatedQuestions: sample(),
  };
}

// 1. "shift X% from A to B" / "move X% from A to B" / "reduce A by X% and increase B by X%"
function handleShift(q: string, ctx: EngineCtx): WhatIfResponse | null {
  let fromLabel: { label: string; type: "sector" | "class" } | null = null;
  let toLabel: { label: string; type: "sector" | "class" } | null = null;
  let percent: number | null = null;

  const shiftMatch = q.match(/(?:shift|move)\s+(\d+(?:\.\d+)?)\s*%?\s+from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/);
  if (shiftMatch) {
    percent = parseFloat(shiftMatch[1]);
    fromLabel = resolveBucketRef(shiftMatch[2]);
    toLabel = resolveBucketRef(shiftMatch[3]);
  } else {
    const combo = q.match(/reduce\s+([a-z\s]+?)\s+by\s+(\d+(?:\.\d+)?)\s*%?\s+and\s+increase\s+([a-z\s]+?)\s+by\s+(\d+(?:\.\d+)?)\s*%?/);
    if (combo) {
      fromLabel = resolveBucketRef(combo[1]);
      percent = parseFloat(combo[2]);
      toLabel = resolveBucketRef(combo[3]);
    }
  }

  if (!fromLabel || !toLabel || percent === null) return null;

  const fromBucket = findBucket(ctx, fromLabel);
  const toBucket = findBucket(ctx, toLabel);
  if (!fromBucket) return noHoldingsResponse(fromLabel);
  if (!toBucket) return noHoldingsResponse(toLabel);

  const deltaValue = (percent / 100) * ctx.totalCurrent;
  const fromCurrentPercent = (fromBucket.value / ctx.totalCurrent) * 100;
  if (deltaValue > fromBucket.value) {
    return {
      inScope: true,
      message: `${fromBucket.label} is currently only ${fromCurrentPercent.toFixed(1)}% of your portfolio, which is less than the ${percent}% you're asking to shift. Try a smaller percentage.`,
      relatedQuestions: sample(),
    };
  }

  const newFromValue = fromBucket.value - deltaValue;
  const newToValue = toBucket.value + deltaValue;
  const fromFactor = fromBucket.value > 0 ? newFromValue / fromBucket.value : 0;
  const toFactor = toBucket.value > 0 ? newToValue / toBucket.value : 0;

  const qtyAdjustments: Record<string, number> = {};
  applyScale(ctx, fromBucket.stockIds, fromBucket.mfIds, fromFactor, qtyAdjustments);
  applyScale(ctx, toBucket.stockIds, toBucket.mfIds, toFactor, qtyAdjustments);

  const table = [
    tableRow(fromBucket.label, fromBucket.value, newFromValue, ctx.totalCurrent, ctx.totalCurrent),
    tableRow(toBucket.label, toBucket.value, newToValue, ctx.totalCurrent, ctx.totalCurrent),
  ];

  const scope = fromBucket.mfIds.length + toBucket.mfIds.length === 0 ? "stocks" : fromBucket.stockIds.length + toBucket.stockIds.length === 0 ? "mutualFunds" : "both";

  return {
    inScope: true,
    message: `Shifting ${percent}% from ${fromBucket.label} to ${toBucket.label} moves roughly ₹${Math.round(deltaValue).toLocaleString("en-IN")} between the two. ${fromBucket.label} would go from ${fromCurrentPercent.toFixed(1)}% to ${((newFromValue / ctx.totalCurrent) * 100).toFixed(1)}%, while ${toBucket.label} rises to ${((newToValue / ctx.totalCurrent) * 100).toFixed(1)}%.`,
    table,
    relatedQuestions: sample(),
    actions: [{ label: "Apply in Rebalancer", kind: "apply_qty_adjustments", payload: { qtyAdjustments, rebalanceScope: scope } }],
  };
}

// 2. "reduce/increase <bucket> by X%"
function handleReduceIncrease(q: string, ctx: EngineCtx): WhatIfResponse | null {
  const reduceVerbs = ["reduce", "decrease", "cut", "trim", "lower"];
  const increaseVerbs = ["increase", "raise", "boost", "grow", "add"];
  const isReduce = reduceVerbs.some((v) => matches(q, v));
  const isIncrease = !isReduce && increaseVerbs.some((v) => matches(q, v));
  if (!isReduce && !isIncrease) return null;

  const ref = resolveBucketRef(q);
  const percent = extractPercent(q);
  if (!ref || percent === null) return null;

  const bucket = findBucket(ctx, ref);
  if (!bucket) return noHoldingsResponse(ref);

  const currentPercent = (bucket.value / ctx.totalCurrent) * 100;
  const newPercent = isReduce ? Math.max(0, currentPercent - percent) : currentPercent + percent;
  const newValue = (newPercent / 100) * ctx.totalCurrent;
  const deltaValue = newValue - bucket.value;

  const others = otherIds(ctx, bucket);
  const otherCurrentValue = otherValue(ctx, bucket);
  if (isIncrease && deltaValue > otherCurrentValue) {
    return {
      inScope: true,
      message: `That would need more capital than the rest of your portfolio holds. Consider adding fresh cash instead — try "What if I add ₹1,00,000 additional investment?".`,
      relatedQuestions: sample(),
    };
  }

  const bucketFactor = bucket.value > 0 ? newValue / bucket.value : 0;
  const otherFactor = otherCurrentValue > 0 ? (otherCurrentValue - deltaValue) / otherCurrentValue : 0;

  const qtyAdjustments: Record<string, number> = {};
  applyScale(ctx, bucket.stockIds, bucket.mfIds, bucketFactor, qtyAdjustments);
  applyScale(ctx, others.stockIds, others.mfIds, otherFactor, qtyAdjustments);

  const table = [
    tableRow(bucket.label, bucket.value, newValue, ctx.totalCurrent, ctx.totalCurrent),
    tableRow("Rest of Portfolio", otherCurrentValue, otherCurrentValue - deltaValue, ctx.totalCurrent, ctx.totalCurrent),
  ];

  const scope = bucket.mfIds.length === 0 ? "stocks" : bucket.stockIds.length === 0 ? "mutualFunds" : "both";

  return {
    inScope: true,
    message: `${isReduce ? "Reducing" : "Increasing"} ${bucket.label} by ${percent}% takes it from ${currentPercent.toFixed(1)}% to ${newPercent.toFixed(1)}% of your portfolio (₹${Math.round(bucket.value).toLocaleString("en-IN")} → ₹${Math.round(newValue).toLocaleString("en-IN")}). The freed-up value is redistributed proportionally across the rest of your holdings.`,
    table,
    relatedQuestions: sample(),
    actions: [{ label: "Apply in Rebalancer", kind: "apply_qty_adjustments", payload: { qtyAdjustments, rebalanceScope: scope } }],
  };
}

// 3. "exit / sell all <sector or class>"
function handleBucketExit(q: string, ctx: EngineCtx): WhatIfResponse | null {
  const exitPhrases = ["exit", "sell all", "get rid of", "liquidate"];
  if (!exitPhrases.some((v) => matches(q, v))) return null;
  const refs = resolveAllBucketRefs(q);
  if (refs.length === 0) return null;
  const ref = refs[0];
  const bucket = findBucket(ctx, ref);
  if (!bucket) return noHoldingsResponse(ref);

  const currentPercent = (bucket.value / ctx.totalCurrent) * 100;
  const others = otherIds(ctx, bucket);
  const otherCurrentValue = otherValue(ctx, bucket);
  const otherFactor = otherCurrentValue > 0 ? (otherCurrentValue + bucket.value) / otherCurrentValue : 0;

  const qtyAdjustments: Record<string, number> = {};
  applyScale(ctx, bucket.stockIds, bucket.mfIds, 0, qtyAdjustments);
  applyScale(ctx, others.stockIds, others.mfIds, otherFactor, qtyAdjustments);

  const table = [
    tableRow(bucket.label, bucket.value, 0, ctx.totalCurrent, ctx.totalCurrent),
    tableRow("Rest of Portfolio", otherCurrentValue, otherCurrentValue + bucket.value, ctx.totalCurrent, ctx.totalCurrent),
  ];

  const scope = bucket.mfIds.length === 0 ? "stocks" : bucket.stockIds.length === 0 ? "mutualFunds" : "both";

  return {
    inScope: true,
    message: `Fully exiting ${bucket.label} (currently ${currentPercent.toFixed(1)}% of your portfolio, ₹${Math.round(bucket.value).toLocaleString("en-IN")}) frees that capital to be redeployed proportionally across your remaining holdings. This is a concentrated move — consider whether a partial trim fits your risk profile better.`,
    table,
    relatedQuestions: sample(),
    actions: [{ label: "Apply in Rebalancer", kind: "apply_qty_adjustments", payload: { qtyAdjustments, rebalanceScope: scope } }],
  };
}

// 4. risk profile change
function handleRiskProfile(q: string, ctx: EngineCtx): WhatIfResponse | null {
  const conservative = /conservative|less risk|lower risk|safer|de-risk/.test(q);
  const aggressive = /aggressive|more risk|higher risk|riskier/.test(q);
  if (!conservative && !aggressive) return null;

  const model = conservative
    ? INVESTMENT_MODELS.find((m) => m.key === "smart_beta")!
    : INVESTMENT_MODELS.find((m) => m.key === "balanced_alpha")!;

  const breakdown = instrumentClassBreakdown(ctx.stocks, ctx.mfs);
  const table: WhatIfTableRow[] = INSTRUMENT_CLASSES.map((c) => ({
    label: c,
    currentPercent: (breakdown[c] / ctx.totalCurrent) * 100,
    newPercent: model.targetMix[c],
    currentValue: breakdown[c],
    newValue: (model.targetMix[c] / 100) * ctx.totalCurrent,
  }));

  return {
    inScope: true,
    message: `Going ${conservative ? "more conservative" : "more aggressive"} maps well to our **${model.name}** model ${model.icon} — ${model.tagline.toLowerCase()}. Expected return ~${model.expectedReturn}% with ~${model.volatility}% volatility (Sharpe ${model.sharpeRatio}). Here's how your allocation would shift under this model:`,
    table,
    relatedQuestions: sample(),
    actions: [{ label: `Switch to ${model.name} Model`, kind: "switch_model", payload: { model: model.key } }],
  };
}

// 5. single stock preference (exit / trim / largest holding)
function handleStockSpecific(q: string, ctx: EngineCtx): WhatIfResponse | null {
  const triggerPhrases = ["exit", "sell", "trim", "should i hold", "should i sell", "largest stock", "largest holding", "biggest holding"];
  if (!triggerPhrases.some((v) => matches(q, v))) return null;

  const dStocks = deriveStocks(ctx.stocks);
  if (dStocks.length === 0) return null;

  let target = dStocks.find((s) => matches(q, s.stockName.toLowerCase()) || matches(q, s.symbol.toLowerCase()));
  if (!target && (q.includes("largest") || q.includes("biggest"))) {
    target = dStocks.reduce((max, s) => (s.currentValue > max.currentValue ? s : max), dStocks[0]);
  }
  if (!target) return null;

  const exitAll = q.includes("exit") || q.includes("sell all") || q.includes("should i sell");
  const factor = exitAll ? 0 : 0.5;
  const currentPercent = (target.currentValue / ctx.totalCurrent) * 100;
  const newValue = target.currentValue * factor;
  const deltaValue = target.currentValue - newValue;

  const others = ctx.stocks.filter((s) => s.id !== target!.id);
  const otherMfs = ctx.mfs;
  const otherStockIds = others.map((s) => s.id);
  const otherMfIds = otherMfs.map((m) => m.id);
  const otherCurrentValue = ctx.totalCurrent - target.currentValue;
  const otherFactor = otherCurrentValue > 0 ? (otherCurrentValue + deltaValue) / otherCurrentValue : 0;

  const qtyAdjustments: Record<string, number> = {};
  qtyAdjustments[target.id] = Math.max(0, Math.round(target.qty * factor));
  applyScale(ctx, otherStockIds, otherMfIds, otherFactor, qtyAdjustments);

  const table = [
    tableRow(target.stockName, target.currentValue, newValue, ctx.totalCurrent, ctx.totalCurrent),
    tableRow("Rest of Portfolio", otherCurrentValue, otherCurrentValue + deltaValue, ctx.totalCurrent, ctx.totalCurrent),
  ];

  const concentrationNote = currentPercent > 20 ? ` This is a concentrated position at ${currentPercent.toFixed(1)}% of your portfolio — ${exitAll ? "exiting" : "trimming"} it meaningfully reduces single-stock risk.` : "";

  return {
    inScope: true,
    message: `${exitAll ? "Exiting" : "Trimming"} ${target.stockName} (${target.symbol}) by ${exitAll ? "100%" : "50%"} releases ₹${Math.round(deltaValue).toLocaleString("en-IN")}, redistributed proportionally across your other holdings.${concentrationNote}`,
    table,
    relatedQuestions: sample(),
    actions: [{ label: "Apply in Rebalancer", kind: "apply_qty_adjustments", payload: { qtyAdjustments, rebalanceScope: "stocks" } }],
  };
}

// 6. add cash
function handleAddCash(q: string, ctx: EngineCtx): WhatIfResponse | null {
  if (!matches(q, "add") && !matches(q, "invest")) return null;
  if (!matches(q, "cash") && !matches(q, "invest") && !matches(q, "investment")) return null;
  const amount = extractAmount(q);
  if (!amount) return null;

  const breakdown = instrumentClassBreakdown(ctx.stocks, ctx.mfs);
  const totalPool = ctx.totalCurrent + amount;
  const table: WhatIfTableRow[] = INSTRUMENT_CLASSES.map((c) => ({
    label: c,
    currentPercent: (breakdown[c] / ctx.totalCurrent) * 100,
    newPercent: ctx.model.targetMix[c],
    currentValue: breakdown[c],
    newValue: (ctx.model.targetMix[c] / 100) * totalPool,
  }));

  return {
    inScope: true,
    message: `Adding ₹${amount.toLocaleString("en-IN")} lifts your investable pool from ₹${Math.round(ctx.totalCurrent).toLocaleString("en-IN")} to ₹${Math.round(totalPool).toLocaleString("en-IN")}. Using your current **${ctx.model.name}** model, here's how the fresh capital would be deployed:`,
    table,
    relatedQuestions: sample(),
    actions: [{ label: "Add this cash in Rebalancer", kind: "add_cash", payload: { amount } }],
  };
}

function isInScope(q: string): boolean {
  if (OUT_OF_SCOPE_HINTS.some((h) => q.includes(h))) return false;
  return IN_SCOPE_KEYWORDS.some((k) => q.includes(k));
}

export function generateWhatIfResponse(
  query: string,
  args: { stocks: StockHolding[]; mfs: MutualFundHolding[]; model?: InvestmentModel }
): WhatIfResponse {
  const q = query.toLowerCase().trim();
  const model = args.model ?? INVESTMENT_MODELS[0];
  const totalCurrent = totalEquityValue(args.stocks, args.mfs) || 1;
  const buckets = buildBuckets(args.stocks, args.mfs);
  const ctx: EngineCtx = { stocks: args.stocks, mfs: args.mfs, buckets, totalCurrent, model };

  if (!q) {
    return { inScope: true, message: "Ask me a what-if question about your portfolio — try one of the suggestions below.", relatedQuestions: sample() };
  }

  const handlers = [handleShift, handleReduceIncrease, handleBucketExit, handleRiskProfile, handleStockSpecific, handleAddCash];
  for (const handler of handlers) {
    const result = handler(q, ctx);
    if (result) return result;
  }

  if (!isInScope(q)) {
    return {
      inScope: false,
      message: `I can only help with portfolio rebalancing and what-if scenarios here — things like allocation shifts, sector exposure, risk profile changes, or adding fresh capital. Try something like "reduce Automobile sector by 5%".`,
      relatedQuestions: sample(),
    };
  }

  return {
    inScope: true,
    message: `I can simulate that — try being specific with a percentage and a sector or fund category, for example "reduce Automobile sector by 5%" or "shift 10% from Small Cap MF to Large Cap MF".`,
    relatedQuestions: sample(),
  };
}

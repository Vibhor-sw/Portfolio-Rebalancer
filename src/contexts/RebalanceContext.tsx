import * as React from "react";
import type { InstrumentClass, ModelKey } from "@/lib/types";

export type PortfolioTypeChoice = "only_stocks" | "stocks_mfs" | "only_mfs";
export type DiversifyChoice = "same" | "diversify" | null;
export type RebalanceScope = "stocks" | "mutualFunds" | "both" | null;
export type ExecutionModeChoice = "conservative" | "instant" | null;

interface RebalanceState {
  rebalanceScope: RebalanceScope;
  portfolioType: PortfolioTypeChoice;
  diversifyChoice: DiversifyChoice;
  selectedInstruments: InstrumentClass[];
  targetPcts: Record<InstrumentClass, number>;
  includeExternalReco: boolean;
  selectedModel: ModelKey;
  additionalCash: number;
  qtyAdjustments: Record<string, number>;
  disclaimerAccepted: boolean;
  executionMode: ExecutionModeChoice;
}

interface RebalanceContextValue extends RebalanceState {
  setRebalanceScope: (v: RebalanceScope) => void;
  setPortfolioType: (v: PortfolioTypeChoice) => void;
  setDiversifyChoice: (v: DiversifyChoice) => void;
  setSelectedInstruments: (v: InstrumentClass[]) => void;
  setTargetPcts: (v: Record<InstrumentClass, number>) => void;
  setIncludeExternalReco: (v: boolean) => void;
  setSelectedModel: (v: ModelKey) => void;
  setAdditionalCash: (v: number) => void;
  setQtyAdjustment: (id: string, qty: number) => void;
  resetQtyAdjustments: () => void;
  setDisclaimerAccepted: (v: boolean) => void;
  setExecutionMode: (v: ExecutionModeChoice) => void;
  resetFlow: () => void;
}

const DEFAULT_TARGET_PCTS: Record<InstrumentClass, number> = {
  Stocks: 25,
  "Large Cap MF": 30,
  "Mid Cap MF": 20,
  "Small Cap MF": 10,
  "Flexi Cap MF": 15,
};

const initialState: RebalanceState = {
  rebalanceScope: null,
  portfolioType: "stocks_mfs",
  diversifyChoice: null,
  selectedInstruments: ["Stocks", "Large Cap MF", "Mid Cap MF", "Small Cap MF", "Flexi Cap MF"],
  targetPcts: DEFAULT_TARGET_PCTS,
  includeExternalReco: false,
  selectedModel: "balanced_alpha",
  additionalCash: 0,
  qtyAdjustments: {},
  disclaimerAccepted: false,
  executionMode: null,
};

const RebalanceContext = React.createContext<RebalanceContextValue | undefined>(undefined);

export function RebalanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<RebalanceState>(initialState);

  const value: RebalanceContextValue = {
    ...state,
    setRebalanceScope: (v) => setState((s) => ({ ...s, rebalanceScope: v })),
    setPortfolioType: (v) => setState((s) => ({ ...s, portfolioType: v })),
    setDiversifyChoice: (v) => setState((s) => ({ ...s, diversifyChoice: v })),
    setSelectedInstruments: (v) => setState((s) => ({ ...s, selectedInstruments: v })),
    setTargetPcts: (v) => setState((s) => ({ ...s, targetPcts: v })),
    setIncludeExternalReco: (v) => setState((s) => ({ ...s, includeExternalReco: v })),
    setSelectedModel: (v) => setState((s) => ({ ...s, selectedModel: v })),
    setAdditionalCash: (v) => setState((s) => ({ ...s, additionalCash: v })),
    setQtyAdjustment: (id, qty) =>
      setState((s) => ({ ...s, qtyAdjustments: { ...s.qtyAdjustments, [id]: qty } })),
    resetQtyAdjustments: () => setState((s) => ({ ...s, qtyAdjustments: {} })),
    setDisclaimerAccepted: (v) => setState((s) => ({ ...s, disclaimerAccepted: v })),
    setExecutionMode: (v) => setState((s) => ({ ...s, executionMode: v })),
    resetFlow: () => setState(initialState),
  };

  return <RebalanceContext.Provider value={value}>{children}</RebalanceContext.Provider>;
}

export function useRebalance() {
  const ctx = React.useContext(RebalanceContext);
  if (!ctx) throw new Error("useRebalance must be used within RebalanceProvider");
  return ctx;
}

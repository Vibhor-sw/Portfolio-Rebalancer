import * as React from "react";
import type { ExternalInvestment } from "@/lib/types";
import { EXTERNAL_INVESTMENT_POOL_MF, EXTERNAL_INVESTMENT_POOL_STOCKS } from "@/lib/mockData";

interface ExternalInvestmentContextValue {
  investments: ExternalInvestment[];
  hasFetched: boolean;
  includeExternal: boolean;
  isFetching: boolean;
  fetchCount: number;
  setIncludeExternal: (v: boolean) => void;
  fetchExternalInvestments: () => Promise<void>;
  refreshExternalInvestments: () => Promise<void>;
}

const ExternalInvestmentContext = React.createContext<ExternalInvestmentContextValue | undefined>(undefined);

function buildInvestments(round: number): ExternalInvestment[] {
  const useStocks = round % 2 === 1;
  const pool = useStocks ? EXTERNAL_INVESTMENT_POOL_STOCKS : EXTERNAL_INVESTMENT_POOL_MF;
  return pool.map((item, idx) => {
    const invested = 40000 + idx * 17500 + round * 2500;
    const growth = 1 + (0.05 + (idx % 3) * 0.04 + round * 0.01);
    const currentValue = Math.round(invested * growth);
    return {
      id: `ext-${round}-${idx}`,
      name: item.name,
      type: item.type,
      investedValue: invested,
      currentValue,
    };
  });
}

export function ExternalInvestmentProvider({ children }: { children: React.ReactNode }) {
  const [investments, setInvestments] = React.useState<ExternalInvestment[]>([]);
  const [hasFetched, setHasFetched] = React.useState(false);
  const [includeExternal, setIncludeExternal] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [fetchCount, setFetchCount] = React.useState(0);

  const fetchExternalInvestments = React.useCallback(async () => {
    setIsFetching(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setFetchCount((c) => {
      const next = c + 1;
      setInvestments(buildInvestments(next));
      return next;
    });
    setHasFetched(true);
    setIsFetching(false);
  }, []);

  const refreshExternalInvestments = React.useCallback(async () => {
    setIsFetching(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setFetchCount((c) => {
      const next = c + 1;
      setInvestments(buildInvestments(next));
      return next;
    });
    setIsFetching(false);
  }, []);

  const value = React.useMemo(
    () => ({
      investments,
      hasFetched,
      includeExternal,
      isFetching,
      fetchCount,
      setIncludeExternal,
      fetchExternalInvestments,
      refreshExternalInvestments,
    }),
    [investments, hasFetched, includeExternal, isFetching, fetchCount, fetchExternalInvestments, refreshExternalInvestments]
  );

  return <ExternalInvestmentContext.Provider value={value}>{children}</ExternalInvestmentContext.Provider>;
}

export function useExternalInvestment() {
  const ctx = React.useContext(ExternalInvestmentContext);
  if (!ctx) throw new Error("useExternalInvestment must be used within ExternalInvestmentProvider");
  return ctx;
}

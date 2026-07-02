import * as React from "react";
import type { PortfolioId, StockHolding, MutualFundHolding } from "@/lib/types";
import { getInitialHoldings, PORTFOLIOS } from "@/lib/mockData";

interface PortfolioHoldings {
  stocks: StockHolding[];
  mutualFunds: MutualFundHolding[];
}

interface HoldingsContextValue {
  holdings: Record<PortfolioId, PortfolioHoldings>;
  addStock: (portfolioId: PortfolioId, stock: Omit<StockHolding, "id">) => void;
  updateStock: (portfolioId: PortfolioId, id: string, patch: Partial<StockHolding>) => void;
  deleteStock: (portfolioId: PortfolioId, id: string) => void;
  addMutualFund: (portfolioId: PortfolioId, mf: Omit<MutualFundHolding, "id">) => void;
  updateMutualFund: (portfolioId: PortfolioId, id: string, patch: Partial<MutualFundHolding>) => void;
  deleteMutualFund: (portfolioId: PortfolioId, id: string) => void;
}

const HoldingsContext = React.createContext<HoldingsContextValue | undefined>(undefined);

function initAll(): Record<PortfolioId, PortfolioHoldings> {
  const result = {} as Record<PortfolioId, PortfolioHoldings>;
  for (const p of PORTFOLIOS) {
    result[p.id] = getInitialHoldings(p.id);
  }
  return result;
}

export function HoldingsProvider({ children }: { children: React.ReactNode }) {
  const [holdings, setHoldings] = React.useState<Record<PortfolioId, PortfolioHoldings>>(initAll);

  const addStock = React.useCallback((portfolioId: PortfolioId, stock: Omit<StockHolding, "id">) => {
    setHoldings((prev) => {
      const id = `${portfolioId}-stk-${stock.symbol}-${Date.now()}`;
      return {
        ...prev,
        [portfolioId]: {
          ...prev[portfolioId],
          stocks: [...prev[portfolioId].stocks, { ...stock, id }],
        },
      };
    });
  }, []);

  const updateStock = React.useCallback((portfolioId: PortfolioId, id: string, patch: Partial<StockHolding>) => {
    setHoldings((prev) => ({
      ...prev,
      [portfolioId]: {
        ...prev[portfolioId],
        stocks: prev[portfolioId].stocks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      },
    }));
  }, []);

  const deleteStock = React.useCallback((portfolioId: PortfolioId, id: string) => {
    setHoldings((prev) => ({
      ...prev,
      [portfolioId]: {
        ...prev[portfolioId],
        stocks: prev[portfolioId].stocks.filter((s) => s.id !== id),
      },
    }));
  }, []);

  const addMutualFund = React.useCallback((portfolioId: PortfolioId, mf: Omit<MutualFundHolding, "id">) => {
    setHoldings((prev) => {
      const id = `${portfolioId}-mf-${mf.schemeName.replace(/\s+/g, "_")}-${Date.now()}`;
      return {
        ...prev,
        [portfolioId]: {
          ...prev[portfolioId],
          mutualFunds: [...prev[portfolioId].mutualFunds, { ...mf, id }],
        },
      };
    });
  }, []);

  const updateMutualFund = React.useCallback((portfolioId: PortfolioId, id: string, patch: Partial<MutualFundHolding>) => {
    setHoldings((prev) => ({
      ...prev,
      [portfolioId]: {
        ...prev[portfolioId],
        mutualFunds: prev[portfolioId].mutualFunds.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    }));
  }, []);

  const deleteMutualFund = React.useCallback((portfolioId: PortfolioId, id: string) => {
    setHoldings((prev) => ({
      ...prev,
      [portfolioId]: {
        ...prev[portfolioId],
        mutualFunds: prev[portfolioId].mutualFunds.filter((m) => m.id !== id),
      },
    }));
  }, []);

  const value = React.useMemo(
    () => ({ holdings, addStock, updateStock, deleteStock, addMutualFund, updateMutualFund, deleteMutualFund }),
    [holdings, addStock, updateStock, deleteStock, addMutualFund, updateMutualFund, deleteMutualFund]
  );

  return <HoldingsContext.Provider value={value}>{children}</HoldingsContext.Provider>;
}

export function useHoldings() {
  const ctx = React.useContext(HoldingsContext);
  if (!ctx) throw new Error("useHoldings must be used within HoldingsProvider");
  return ctx;
}

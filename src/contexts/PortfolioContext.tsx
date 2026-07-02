import * as React from "react";
import type { PortfolioId } from "@/lib/types";

interface PortfolioContextValue {
  selectedPortfolio: PortfolioId;
  setSelectedPortfolio: (id: PortfolioId) => void;
}

const PortfolioContext = React.createContext<PortfolioContextValue | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [selectedPortfolio, setSelectedPortfolio] = React.useState<PortfolioId>("default");

  return (
    <PortfolioContext.Provider value={{ selectedPortfolio, setSelectedPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = React.useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}

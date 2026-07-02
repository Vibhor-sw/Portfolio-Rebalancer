import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { HoldingsProvider } from "@/contexts/HoldingsContext";
import { ExternalInvestmentProvider } from "@/contexts/ExternalInvestmentContext";
import { RebalanceProvider } from "@/contexts/RebalanceContext";
import { Toaster } from "@/components/ui/toaster";

import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Holdings from "@/pages/Holdings";
import Optimizer from "@/pages/Optimizer";
import Rebalancer from "@/pages/Rebalancer";
import ExecuteOrders from "@/pages/ExecuteOrders";
import ExecutionMode from "@/pages/ExecutionMode";
import ExecutionFlow from "@/pages/ExecutionFlow";
import OrderSuccess from "@/pages/OrderSuccess";
import WhatIf from "@/pages/WhatIf";
import HowItWorks from "@/pages/HowItWorks";
import FAQs from "@/pages/FAQs";
import SettingsPage from "@/pages/Settings";
import ConservativePrototype from "@/pages/prototype/ConservativePrototype";
import InstantPrototype from "@/pages/prototype/InstantPrototype";
import SmartPartialPrototype from "@/pages/prototype/SmartPartialPrototype";

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <HoldingsProvider>
          <ExternalInvestmentProvider>
            <RebalanceProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Splash />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/holdings" element={<Holdings />} />
                  <Route path="/optimizer" element={<Optimizer />} />
                  <Route path="/rebalancer" element={<Rebalancer />} />
                  <Route path="/execute-orders" element={<ExecuteOrders />} />
                  <Route path="/execution-mode" element={<ExecutionMode />} />
                  <Route path="/execution-flow" element={<ExecutionFlow />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/whatif" element={<WhatIf />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/prototype/conservative" element={<ConservativePrototype />} />
                  <Route path="/prototype/instant" element={<InstantPrototype />} />
                  <Route path="/prototype/smart_partial" element={<SmartPartialPrototype />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
              <Toaster />
            </RebalanceProvider>
          </ExternalInvestmentProvider>
        </HoldingsProvider>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;

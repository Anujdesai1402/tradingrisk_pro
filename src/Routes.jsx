import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import Login from "pages/login";
import RiskMonitor from "pages/risk-monitor";
import StrategyConfiguration from "pages/strategy-configuration";
import PortfolioRiskAggregator from "pages/portfolio-risk-aggregator";
import TradingDashboard from "pages/trading-dashboard";
import RiskSimulator from "pages/risk-simulator";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<TradingDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/risk-monitor" element={<RiskMonitor />} />
        <Route path="/strategy-configuration" element={<StrategyConfiguration />} />
        <Route path="/portfolio-risk-aggregator" element={<PortfolioRiskAggregator />} />
        <Route path="/trading-dashboard" element={<TradingDashboard />} />
        <Route path="/risk-simulator" element={<RiskSimulator />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
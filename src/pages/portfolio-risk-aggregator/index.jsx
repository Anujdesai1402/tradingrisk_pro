import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PortfolioMetricsBar from './components/PortfolioMetricsBar';
import StrategyComparisonTable from './components/StrategyComparisonTable';
import CorrelationMatrix from './components/CorrelationMatrix';
import ConflictDetector from './components/ConflictDetector';
import AutoHedger from './components/AutoHedger';
import GreeksAggregation from './components/GreeksAggregation';
import TimelineReplay from './components/TimelineReplay';

const PortfolioRiskAggregator = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock portfolio data
  const portfolioData = {
    totalExposure: 2850000,
    riskScore: 72,
    capitalAtRisk: 18.5,
    lastUpdated: "22/07/2025, 08:40 AM"
  };

  const strategies = [
    {
      id: 1,
      name: "Iron Condor NIFTY",
      symbol: "NIFTY",
      riskScore: 65,
      exposureLevel: "Medium",
      pnl: 15000,
      delta: -125.50,
      vega: 890.25,
      theta: -450.75,
      correlation: 85,
      status: "active"
    },
    {
      id: 2,
      name: "Bull Call Spread BANKNIFTY",
      symbol: "BANKNIFTY",
      riskScore: 78,
      exposureLevel: "High",
      pnl: -8500,
      delta: 245.80,
      vega: -320.15,
      theta: -280.40,
      correlation: 72,
      status: "active"
    },
    {
      id: 3,
      name: "Short Straddle RELIANCE",
      symbol: "RELIANCE",
      riskScore: 82,
      exposureLevel: "High",
      pnl: 22000,
      delta: 15.25,
      vega: 1250.60,
      theta: -680.90,
      correlation: 45,
      status: "active"
    },
    {
      id: 4,
      name: "Protective Put TCS",
      symbol: "TCS",
      riskScore: 35,
      exposureLevel: "Low",
      pnl: 5500,
      delta: 180.40,
      vega: 420.30,
      theta: -120.15,
      correlation: 38,
      status: "active"
    }
  ];

  const correlationData = {
    strategies: ["Iron Condor", "Bull Call", "Short Straddle", "Protective Put"],
    matrix: [
      [1.0, 0.8, 0.3, -0.2],
      [0.8, 1.0, 0.4, -0.1],
      [0.3, 0.4, 1.0, 0.6],
      [-0.2, -0.1, 0.6, 1.0]
    ]
  };

  const conflicts = [
    {
      id: 1,
      title: "High NIFTY Exposure",
      description: "Multiple strategies concentrated on NIFTY index creating overexposure risk",
      severity: "high",
      affectedStrategies: ["Iron Condor NIFTY", "Bull Call Spread BANKNIFTY"],
      recommendations: [
        "Consider reducing position size in one of the NIFTY strategies",
        "Add hedging positions in different sectors",
        "Implement cross-hedge with international indices"
      ]
    },
    {
      id: 2,
      title: "Vega Concentration",
      description: "High net positive vega exposure across multiple strategies",
      severity: "medium",
      affectedStrategies: ["Iron Condor NIFTY", "Short Straddle RELIANCE"],
      recommendations: [
        "Add negative vega positions to balance exposure",
        "Consider calendar spreads to reduce vega risk",
        "Monitor IV levels closely for exit opportunities"
      ]
    }
  ];

  const hedgeRecommendations = [
    {
      id: 1,
      title: "Buy NIFTY Put Protection",
      type: "put",
      symbol: "NIFTY",
      expiry: "29 Aug 2025",
      cost: 25000,
      riskReduction: 35,
      priority: "high",
      description: "Protect against downside risk in NIFTY-heavy portfolio",
      targetStrategies: ["Iron Condor NIFTY", "Bull Call Spread BANKNIFTY"]
    },
    {
      id: 2,
      title: "Short BANKNIFTY Future",
      type: "future",
      symbol: "BANKNIFTY",
      expiry: "29 Aug 2025",
      cost: 18000,
      riskReduction: 28,
      priority: "medium",
      description: "Delta hedge for directional exposure in banking sector",
      targetStrategies: ["Bull Call Spread BANKNIFTY"]
    }
  ];

  const greeksData = {
    delta: {
      value: 315.95,
      range: { max: 1000, safe: 500, warning: 750 }
    },
    vega: {
      value: 2240.70,
      range: { max: 3000, safe: 1500, warning: 2250 }
    },
    theta: {
      value: -1532.20,
      range: { max: 2000, safe: 1000, warning: 1500 }
    },
    gamma: {
      value: 125.45,
      range: { max: 200, safe: 100, warning: 150 }
    }
  };

  const timelineData = [
    {
      timestamp: Date.now() - 3600000,
      portfolioValue: 2800000,
      riskScore: 68,
      totalPnL: 28000,
      activeStrategies: 4,
      events: [
        { type: 'info', message: 'Portfolio rebalanced', strategy: 'Iron Condor NIFTY' }
      ]
    },
    {
      timestamp: Date.now() - 1800000,
      portfolioValue: 2825000,
      riskScore: 70,
      totalPnL: 32000,
      activeStrategies: 4,
      events: [
        { type: 'warning', message: 'Vega exposure increased', strategy: 'Short Straddle RELIANCE' }
      ]
    },
    {
      timestamp: Date.now(),
      portfolioValue: 2850000,
      riskScore: 72,
      totalPnL: 34000,
      activeStrategies: 4,
      events: [
        { type: 'alert', message: 'Risk score threshold breached', strategy: 'Bull Call Spread BANKNIFTY' }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'correlation', label: 'Correlation', icon: 'GitBranch' },
    { id: 'conflicts', label: 'Conflicts', icon: 'AlertTriangle' },
    { id: 'greeks', label: 'Greeks', icon: 'Activity' },
    { id: 'timeline', label: 'Timeline', icon: 'Clock' }
  ];

  const handleExport = () => {
    const data = {
      portfolio: portfolioData,
      strategies: strategies,
      conflicts: conflicts,
      timestamp: new Date().toISOString()
    };

    if (exportFormat === 'csv') {
      // CSV export logic
      console.log('Exporting as CSV:', data);
    } else {
      // JSON export logic
      console.log('Exporting as JSON:', data);
    }
    
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-background pt-15">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <span>Portfolio</span>
          <Icon name="ChevronRight" size={16} />
          <span className="text-foreground font-medium">Risk Aggregator</span>
        </div>

        {/* Portfolio Metrics Bar */}
        <PortfolioMetricsBar portfolioData={portfolioData} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area (70%) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-card border border-border rounded-lg p-1">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <StrategyComparisonTable strategies={strategies} />
              )}
              
              {activeTab === 'correlation' && (
                <CorrelationMatrix correlationData={correlationData} />
              )}
              
              {activeTab === 'conflicts' && (
                <ConflictDetector conflicts={conflicts} />
              )}
              
              {activeTab === 'greeks' && (
                <GreeksAggregation greeksData={greeksData} />
              )}
              
              {activeTab === 'timeline' && (
                <TimelineReplay timelineData={timelineData} />
              )}
            </div>
          </div>

          {/* Right Sidebar (30%) */}
          <div className="xl:col-span-1 space-y-6">
            <AutoHedger hedgeRecommendations={hedgeRecommendations} />
            
            {/* Export Panel */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Export</h3>
                  <p className="text-sm text-muted-foreground">Download portfolio reports</p>
                </div>
                <Icon name="Download" size={20} className="text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="csv">CSV Report</option>
                    <option value="json">JSON Data</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                  className="w-full"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Report
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Strategies</span>
                  <span className="text-sm font-medium text-foreground">{strategies.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">High Risk Strategies</span>
                  <span className="text-sm font-medium text-error">
                    {strategies.filter(s => s.riskScore >= 80).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profitable Strategies</span>
                  <span className="text-sm font-medium text-success">
                    {strategies.filter(s => s.pnl > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conflicts Detected</span>
                  <span className="text-sm font-medium text-warning">{conflicts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-trading z-modal-backdrop flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-modal max-w-md w-full z-modal">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Download" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Export Portfolio Report</h3>
                  <p className="text-sm text-muted-foreground">Download comprehensive risk analysis</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground font-medium">Report Contents:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Portfolio overview and metrics</li>
                    <li>• Individual strategy analysis</li>
                    <li>• Risk conflicts and recommendations</li>
                    <li>• Greeks aggregation data</li>
                    <li>• Historical timeline events</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="text-foreground font-medium">{exportFormat.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  onClick={handleExport}
                  className="flex-1"
                  iconName="Download"
                  iconPosition="left"
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioRiskAggregator;
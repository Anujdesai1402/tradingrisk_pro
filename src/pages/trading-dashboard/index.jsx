import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PortfolioSummary from './components/PortfolioSummary';
import StrategyCard from './components/StrategyCard';
import LiveAlerts from './components/LiveAlerts';
import MarketDataWidget from './components/MarketDataWidget';
import QuickDeployment from './components/QuickDeployment';
import StrategyDetailsModal from './components/StrategyDetailsModal';

const TradingDashboard = () => {
  const navigate = useNavigate();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock portfolio data
  const portfolioData = {
    totalPnL: 45750,
    pnlChange: 2.3,
    capitalAtRisk: 125000,
    totalCapital: 500000,
    capitalAtRiskPercentage: 25,
    riskScore: 68,
    activeStrategies: 8,
    openPositions: 24,
    healthIndicators: [
      { label: 'SL Buffer', value: '12%', status: 'healthy' },
      { label: 'Margin Usage', value: '45%', status: 'warning' },
      { label: 'Greeks Exposure', value: 'Moderate', status: 'healthy' },
      { label: 'IV Levels', value: 'High', status: 'warning' }
    ]
  };

  // Mock strategy data
  const [strategies, setStrategies] = useState([
    {
      id: 'str_001',
      name: 'Iron Condor NIFTY',
      type: 'Neutral Strategy',
      pnl: 8750,
      pnlChange: 1.8,
      riskScore: 45,
      status: 'healthy',
      slStatus: 'active',
      slValue: 5000,
      tpStatus: 'active',
      tpValue: 12000,
      delta: -0.15,
      theta: 45.2,
      vega: -12.8,
      margin: 45000,
      gamma: 0.08,
      iv: 16.5,
      isLocked: false,
      lastUpdated: '2 min ago',
      legs: [
        { name: 'Long Put', type: 'PUT', strike: '19800', quantity: 50, premium: 85, pnl: 2250 },
        { name: 'Short Put', type: 'PUT', strike: '19900', quantity: -50, premium: 125, pnl: -1500 },
        { name: 'Short Call', type: 'CALL', strike: '20100', quantity: -50, premium: 135, pnl: 3200 },
        { name: 'Long Call', type: 'CALL', strike: '20200', quantity: 50, premium: 95, pnl: -1200 }
      ]
    },
    {
      id: 'str_002',
      name: 'Bull Call Spread',
      type: 'Bullish Strategy',
      pnl: -2340,
      pnlChange: -0.8,
      riskScore: 72,
      status: 'warning',
      slStatus: 'active',
      slValue: 3000,
      tpStatus: 'inactive',
      tpValue: 0,
      delta: 0.45,
      theta: -15.6,
      vega: 8.2,
      margin: 25000,
      gamma: 0.12,
      iv: 18.2,
      isLocked: false,
      lastUpdated: '1 min ago',
      legs: [
        { name: 'Long Call', type: 'CALL', strike: '20000', quantity: 100, premium: 150, pnl: -1200 },
        { name: 'Short Call', type: 'CALL', strike: '20100', quantity: -100, premium: 95, pnl: -1140 }
      ]
    },
    {
      id: 'str_003',
      name: 'Short Straddle',
      type: 'Neutral Strategy',
      pnl: 12450,
      pnlChange: 3.2,
      riskScore: 85,
      status: 'critical',
      slStatus: 'active',
      slValue: 8000,
      tpStatus: 'active',
      tpValue: 15000,
      delta: 0.02,
      theta: 85.4,
      vega: -25.6,
      margin: 75000,
      gamma: -0.18,
      iv: 22.1,
      isLocked: true,
      lastUpdated: '30 sec ago',
      legs: [
        { name: 'Short Call', type: 'CALL', strike: '20000', quantity: -75, premium: 180, pnl: 6750 },
        { name: 'Short Put', type: 'PUT', strike: '20000', quantity: -75, premium: 165, pnl: 5700 }
      ]
    },
    {
      id: 'str_004',
      name: 'Protective Put',
      type: 'Hedging Strategy',
      pnl: 3250,
      pnlChange: 0.5,
      riskScore: 35,
      status: 'healthy',
      slStatus: 'active',
      slValue: 2000,
      tpStatus: 'inactive',
      tpValue: 0,
      delta: 0.85,
      theta: -8.2,
      vega: 5.4,
      margin: 15000,
      gamma: 0.05,
      iv: 15.8,
      isLocked: false,
      lastUpdated: '5 min ago',
      legs: [
        { name: 'Long Stock', type: 'STOCK', strike: '20000', quantity: 100, premium: 20000, pnl: 4500 },
        { name: 'Long Put', type: 'PUT', strike: '19800', quantity: 100, premium: 120, pnl: -1250 }
      ]
    }
  ]);

  // Mock market data
  const marketData = {
    indices: [
      { symbol: 'NIFTY', name: 'Nifty 50', price: 20045.75, change: 0.85 },
      { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 44256.30, change: -0.42 },
      { symbol: 'SENSEX', name: 'Sensex', price: 66789.12, change: 1.23 }
    ],
    metrics: [
      { label: 'VIX', value: '16.45', type: 'volatility' },
      { label: 'PCR', value: '1.18', type: 'ratio' },
      { label: 'Volume', value: '2.4M', type: 'volume' },
      { label: 'OI', value: '1.8M', type: 'oi' }
    ],
    lastUpdated: '09:35 AM'
  };

  // Mock deployment strategies
  const deploymentStrategies = [
    {
      id: 'template_001',
      name: 'Iron Condor',
      description: 'Market neutral strategy with limited risk and reward',
      type: 'Neutral',
      estimatedMargin: 45000,
      riskScore: 45
    },
    {
      id: 'template_002',
      name: 'Bull Call Spread',
      description: 'Bullish strategy with limited upside and downside',
      type: 'Bullish',
      estimatedMargin: 25000,
      riskScore: 55
    },
    {
      id: 'template_003',
      name: 'Short Straddle',
      description: 'High premium collection with unlimited risk',
      type: 'Neutral',
      estimatedMargin: 75000,
      riskScore: 85
    }
  ];

  // Initialize alerts
  useEffect(() => {
    const initialAlerts = [
      {
        id: 'alert_001',
        type: 'sl_hit',
        severity: 'critical',
        title: 'Stop Loss Triggered',
        message: 'Bull Call Spread has hit the stop loss level',
        strategy: 'Bull Call Spread',
        value: '₹3,000',
        timestamp: Date.now() - 300000
      },
      {
        id: 'alert_002',
        type: 'margin_breach',
        severity: 'warning',
        title: 'Margin Utilization High',
        message: 'Portfolio margin usage exceeded 80%',
        value: '85%',
        timestamp: Date.now() - 600000
      },
      {
        id: 'alert_003',
        type: 'iv_spike',
        severity: 'info',
        title: 'IV Spike Detected',
        message: 'Implied volatility increased significantly in NIFTY options',
        value: '+15%',
        timestamp: Date.now() - 900000
      },
      {
        id: 'alert_004',
        type: 'trailing_sl',
        severity: 'info',
        title: 'Trailing SL Updated',
        message: 'Iron Condor trailing stop loss adjusted',
        strategy: 'Iron Condor NIFTY',
        value: '₹5,500',
        timestamp: Date.now() - 1200000
      }
    ];
    setAlerts(initialAlerts);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleModifyStrategy = (strategy) => {
    navigate('/strategy-configuration', { state: { strategy } });
  };

  const handleCloseStrategy = (strategy) => {
    if (window.confirm(`Are you sure you want to close ${strategy.name}?`)) {
      setStrategies(prev => prev.filter(s => s.id !== strategy.id));
      
      // Add alert for strategy closure
      const newAlert = {
        id: `alert_${Date.now()}`,
        type: 'system',
        severity: 'info',
        title: 'Strategy Closed',
        message: `${strategy.name} has been successfully closed`,
        strategy: strategy.name,
        timestamp: Date.now()
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleSimulateRisk = (strategy) => {
    navigate('/risk-simulator', { state: { strategy } });
  };

  const handleViewDetails = (strategy) => {
    setSelectedStrategy(strategy);
    setShowDetailsModal(true);
  };

  const handleClearAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  const handleDeploy = (deploymentData) => {
    const template = deploymentStrategies.find(s => s.id === deploymentData.strategyId);
    if (!template) return;

    const newStrategy = {
      id: `str_${Date.now()}`,
      name: `${template.name} #${strategies.length + 1}`,
      type: template.type + ' Strategy',
      pnl: 0,
      pnlChange: 0,
      riskScore: template.riskScore,
      status: 'healthy',
      slStatus: deploymentData.stopLoss ? 'active' : 'inactive',
      slValue: deploymentData.stopLoss || 0,
      tpStatus: deploymentData.takeProfit ? 'active' : 'inactive',
      tpValue: deploymentData.takeProfit || 0,
      delta: 0,
      theta: 0,
      vega: 0,
      margin: template.estimatedMargin * deploymentData.quantity,
      gamma: 0,
      iv: 16.5,
      isLocked: false,
      lastUpdated: 'Just now',
      legs: []
    };

    setStrategies(prev => [newStrategy, ...prev]);

    // Add deployment alert
    const deployAlert = {
      id: `alert_${Date.now()}`,
      type: 'system',
      severity: 'info',
      title: 'Strategy Deployed',
      message: `${newStrategy.name} has been successfully deployed`,
      strategy: newStrategy.name,
      timestamp: Date.now()
    };
    setAlerts(prev => [deployAlert, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading Dashboard</h1>
            <p className="text-muted-foreground">Monitor your active strategies and portfolio performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Market Open</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setRefreshKey(prev => prev + 1)}
              iconName="RefreshCw"
              iconSize={16}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Portfolio Summary */}
          <div className="xl:col-span-1">
            <PortfolioSummary portfolioData={portfolioData} />
          </div>

          {/* Center Area - Strategy Cards */}
          <div className="xl:col-span-2 space-y-6">
            {/* Strategies Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Strategies</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {strategies.length} active
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/strategy-configuration')}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={14}
                >
                  New Strategy
                </Button>
              </div>
            </div>

            {/* Strategy Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto">
              {strategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onModify={handleModifyStrategy}
                  onClose={handleCloseStrategy}
                  onSimulateRisk={handleSimulateRisk}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {strategies.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-border rounded-lg">
                <Icon name="TrendingUp" size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Active Strategies</h3>
                <p className="text-muted-foreground mb-4">Deploy your first strategy to start trading</p>
                <Button
                  variant="default"
                  onClick={() => navigate('/strategy-configuration')}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Create Strategy
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Alerts & Market Data */}
          <div className="xl:col-span-1 space-y-6">
            {/* Live Alerts */}
            <div className="h-96">
              <LiveAlerts
                alerts={alerts}
                onClearAlert={handleClearAlert}
                onClearAll={handleClearAllAlerts}
              />
            </div>

            {/* Market Data Widget */}
            <MarketDataWidget marketData={marketData} />

            {/* Quick Deployment */}
            <QuickDeployment
              onDeploy={handleDeploy}
              strategies={deploymentStrategies}
            />
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="fixed bottom-6 right-6 flex space-x-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate('/risk-monitor')}
            className="shadow-lg"
            title="Risk Monitor"
          >
            <Icon name="Shield" size={20} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate('/portfolio-risk-aggregator')}
            className="shadow-lg"
            title="Portfolio Analytics"
          >
            <Icon name="BarChart3" size={20} />
          </Button>
          <Button
            variant="default"
            onClick={() => navigate('/strategy-configuration')}
            iconName="Plus"
            iconPosition="left"
            className="shadow-lg"
          >
            New Strategy
          </Button>
        </div>
      </div>

      {/* Strategy Details Modal */}
      <StrategyDetailsModal
        strategy={selectedStrategy}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStrategy(null);
        }}
        onModify={handleModifyStrategy}
        onSimulateRisk={handleSimulateRisk}
      />
    </div>
  );
};

export default TradingDashboard;
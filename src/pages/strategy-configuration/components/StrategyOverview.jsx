import React from 'react';
import Icon from '../../../components/AppIcon';

const StrategyOverview = ({ strategy }) => {
  const mockStrategy = {
    id: "STR_001",
    name: "Iron Condor NIFTY",
    symbol: "NIFTY",
    expiry: "28-Dec-2024",
    type: "Iron Condor",
    status: "Draft",
    createdAt: "22-Jul-2024 08:40",
    legs: [
      {
        id: 1,
        type: "Short Call",
        strike: 24500,
        qty: 50,
        premium: 125.50,
        delta: -0.35,
        gamma: 0.008,
        theta: -12.5,
        vega: 18.2,
        iv: 18.5
      },
      {
        id: 2,
        type: "Long Call",
        strike: 24600,
        qty: 50,
        premium: 85.25,
        delta: -0.22,
        gamma: 0.006,
        theta: -8.2,
        vega: 12.8,
        iv: 17.8
      },
      {
        id: 3,
        type: "Short Put",
        strike: 24200,
        qty: 50,
        premium: 118.75,
        delta: 0.28,
        gamma: 0.007,
        theta: -11.8,
        vega: 16.5,
        iv: 19.2
      },
      {
        id: 4,
        type: "Long Put",
        strike: 24100,
        qty: 50,
        premium: 78.50,
        delta: 0.18,
        gamma: 0.005,
        theta: -7.5,
        vega: 11.2,
        iv: 18.8
      }
    ],
    marketData: {
      spot: 24350,
      iv: 18.8,
      timeToExpiry: 158,
      interestRate: 6.5
    },
    calculations: {
      netPremium: 3200,
      maxProfit: 3200,
      maxLoss: 6800,
      breakevens: [24168, 24532],
      marginRequired: 45000,
      riskReward: 2.125
    }
  };

  const data = strategy || mockStrategy;

  const getGreekColor = (value, type) => {
    if (type === 'delta') {
      return value > 0 ? 'text-success' : 'text-error';
    }
    if (type === 'theta') {
      return value < 0 ? 'text-error' : 'text-success';
    }
    return 'text-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Strategy Header */}
      <div className="trading-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{data.name}</h3>
              <p className="text-sm text-muted-foreground">{data.type} • {data.symbol}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full">
              {data.status}
            </span>
            <span className="text-xs text-muted-foreground">ID: {data.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expiry</p>
            <p className="text-sm font-medium text-foreground">{data.expiry}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p className="text-sm font-medium text-foreground">{data.createdAt}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Days to Expiry</p>
            <p className="text-sm font-medium text-foreground">{data.marketData.timeToExpiry}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Spot</p>
            <p className="text-sm font-medium text-foreground">₹{data.marketData.spot.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Strategy Legs */}
      <div className="trading-card">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Layers" size={18} className="text-primary" />
          <h4 className="text-md font-semibold text-foreground">Strategy Legs</h4>
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
            {data.legs.length} Legs
          </span>
        </div>

        <div className="space-y-3">
          {data.legs.map((leg) => (
            <div key={leg.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    leg.type.includes('Short') ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                  }`}>
                    {leg.type.includes('Call') ? 'C' : 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{leg.type}</p>
                    <p className="text-xs text-muted-foreground">Strike: ₹{leg.strike.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Qty: {leg.qty}</p>
                  <p className="text-xs text-muted-foreground">₹{leg.premium}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Delta</p>
                  <p className={`font-medium ${getGreekColor(leg.delta, 'delta')}`}>
                    {leg.delta.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Gamma</p>
                  <p className="font-medium text-foreground">{leg.gamma.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Theta</p>
                  <p className={`font-medium ${getGreekColor(leg.theta, 'theta')}`}>
                    {leg.theta.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Vega</p>
                  <p className="font-medium text-foreground">{leg.vega.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">IV</p>
                  <p className="font-medium text-foreground">{leg.iv}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Data & Calculations */}
      <div className="trading-card">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Calculator" size={18} className="text-primary" />
          <h4 className="text-md font-semibold text-foreground">Risk Calculations</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Net Premium</span>
              <span className="text-sm font-medium text-success">₹{data.calculations.netPremium.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max Profit</span>
              <span className="text-sm font-medium text-success">₹{data.calculations.maxProfit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max Loss</span>
              <span className="text-sm font-medium text-error">₹{data.calculations.maxLoss.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Margin Required</span>
              <span className="text-sm font-medium text-foreground">₹{data.calculations.marginRequired.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Risk:Reward</span>
              <span className="text-sm font-medium text-foreground">1:{data.calculations.riskReward.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Breakevens</span>
              <span className="text-sm font-medium text-foreground">
                ₹{data.calculations.breakevens[0]} / ₹{data.calculations.breakevens[1]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyOverview;
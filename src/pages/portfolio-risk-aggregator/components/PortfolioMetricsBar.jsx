import React from 'react';
import Icon from '../../../components/AppIcon';

const PortfolioMetricsBar = ({ portfolioData }) => {
  const { totalExposure, riskScore, capitalAtRisk, lastUpdated } = portfolioData;

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    return 'text-success';
  };

  const getRiskScoreBg = (score) => {
    if (score >= 80) return 'bg-error/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-success/10';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Portfolio Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Exposure */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="TrendingUp" size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Exposure</p>
            <p className="text-2xl font-semibold text-foreground">₹{totalExposure.toLocaleString('en-IN')}</p>
            <p className="text-xs text-success">+2.3% from yesterday</p>
          </div>
        </div>

        {/* Combined Risk Score */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${getRiskScoreBg(riskScore)} rounded-lg flex items-center justify-center`}>
            <Icon name="Shield" size={24} className={getRiskScoreColor(riskScore)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <p className={`text-2xl font-semibold ${getRiskScoreColor(riskScore)}`}>{riskScore}/100</p>
            <div className="w-24 h-2 bg-muted rounded-full mt-1">
              <div 
                className={`h-full rounded-full ${riskScore >= 80 ? 'bg-error' : riskScore >= 60 ? 'bg-warning' : 'bg-success'}`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Capital at Risk */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="AlertTriangle" size={24} className="text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Capital at Risk</p>
            <p className="text-2xl font-semibold text-foreground">{capitalAtRisk}%</p>
            <p className="text-xs text-muted-foreground">₹{(totalExposure * capitalAtRisk / 100).toLocaleString('en-IN')} exposure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMetricsBar;
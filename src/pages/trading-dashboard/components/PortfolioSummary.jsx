import React from 'react';
import Icon from '../../../components/AppIcon';

const PortfolioSummary = ({ portfolioData }) => {
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
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Portfolio Summary</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Total PnL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total P&L</span>
          <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold font-data ${portfolioData.totalPnL >= 0 ? 'profit' : 'loss'}`}>
            ₹{Math.abs(portfolioData.totalPnL).toLocaleString('en-IN')}
          </span>
          <span className={`text-sm ${portfolioData.totalPnL >= 0 ? 'profit' : 'loss'}`}>
            {portfolioData.totalPnL >= 0 ? '+' : '-'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${portfolioData.pnlChange >= 0 ? 'profit' : 'loss'}`}>
            {portfolioData.pnlChange >= 0 ? '+' : ''}{portfolioData.pnlChange}%
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
      </div>

      {/* Capital at Risk */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Capital at Risk</span>
          <span className="text-sm font-medium text-foreground">
            {portfolioData.capitalAtRiskPercentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              portfolioData.capitalAtRiskPercentage > 80 ? 'bg-error' :
              portfolioData.capitalAtRiskPercentage > 60 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${Math.min(portfolioData.capitalAtRiskPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹{portfolioData.capitalAtRisk.toLocaleString('en-IN')}</span>
          <span>₹{portfolioData.totalCapital.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Risk Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Risk Score</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreBg(portfolioData.riskScore)} ${getRiskScoreColor(portfolioData.riskScore)}`}>
            {portfolioData.riskScore}/100
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              portfolioData.riskScore >= 80 ? 'bg-error' :
              portfolioData.riskScore >= 60 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${portfolioData.riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Health Indicators</h3>
        <div className="space-y-2">
          {portfolioData.healthIndicators.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={indicator.status === 'healthy' ? 'CheckCircle' : indicator.status === 'warning' ? 'AlertTriangle' : 'XCircle'} 
                  size={14} 
                  className={
                    indicator.status === 'healthy' ? 'text-success' :
                    indicator.status === 'warning' ? 'text-warning' : 'text-error'
                  } 
                />
                <span className="text-xs text-muted-foreground">{indicator.label}</span>
              </div>
              <span className={`text-xs font-medium ${
                indicator.status === 'healthy' ? 'text-success' :
                indicator.status === 'warning' ? 'text-warning' : 'text-error'
              }`}>
                {indicator.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{portfolioData.activeStrategies}</div>
          <div className="text-xs text-muted-foreground">Active Strategies</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{portfolioData.openPositions}</div>
          <div className="text-xs text-muted-foreground">Open Positions</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
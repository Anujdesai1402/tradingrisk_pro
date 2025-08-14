import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StrategyDetailsModal = ({ strategy, isOpen, onClose, onModify, onSimulateRisk }) => {
  if (!isOpen || !strategy) return null;

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-trading z-modal-backdrop flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto z-modal">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              strategy.status === 'healthy' ? 'bg-success' :
              strategy.status === 'warning' ? 'bg-warning' : 'bg-error'
            }`}></div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{strategy.name}</h2>
              <p className="text-sm text-muted-foreground">{strategy.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-micro"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PnL Card */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current P&L</span>
                <Icon 
                  name={strategy.pnl >= 0 ? "TrendingUp" : "TrendingDown"} 
                  size={16} 
                  className={strategy.pnl >= 0 ? 'text-success' : 'text-error'} 
                />
              </div>
              <div className="space-y-1">
                <span className={`text-2xl font-bold font-data ${strategy.pnl >= 0 ? 'profit' : 'loss'}`}>
                  {strategy.pnl >= 0 ? '+' : ''}{formatCurrency(strategy.pnl)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${strategy.pnlChange >= 0 ? 'profit' : 'loss'}`}>
                    {strategy.pnlChange >= 0 ? '+' : ''}{strategy.pnlChange}%
                  </span>
                  <span className="text-xs text-muted-foreground">today</span>
                </div>
              </div>
            </div>

            {/* Risk Score Card */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <Icon name="Shield" size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <span className={`text-2xl font-bold ${getRiskScoreColor(strategy.riskScore)}`}>
                  {strategy.riskScore}/100
                </span>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      strategy.riskScore >= 80 ? 'bg-error' :
                      strategy.riskScore >= 60 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${strategy.riskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Icon name="Activity" size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <span className={`text-lg font-semibold ${getStatusColor(strategy.status)}`}>
                  {strategy.status.toUpperCase()}
                </span>
                <p className="text-xs text-muted-foreground">
                  Last updated {strategy.lastUpdated}
                </p>
              </div>
            </div>
          </div>

          {/* Greeks and Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Greeks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Greeks & Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Delta', value: strategy.delta, format: 'number' },
                  { label: 'Gamma', value: strategy.gamma || 0.15, format: 'number' },
                  { label: 'Theta', value: strategy.theta, format: 'number' },
                  { label: 'Vega', value: strategy.vega, format: 'number' },
                  { label: 'Margin', value: strategy.margin, format: 'currency' },
                  { label: 'IV', value: strategy.iv || 18.5, format: 'percentage' }
                ].map((metric, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                    <div className={`text-lg font-bold font-data ${
                      metric.format === 'currency' ? 'text-foreground' :
                      metric.value >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {metric.format === 'currency' ? formatCurrency(metric.value) :
                       metric.format === 'percentage' ? `${metric.value}%` :
                       `${metric.value >= 0 ? '+' : ''}${metric.value}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Risk Controls</h3>
              <div className="space-y-3">
                {/* Stop Loss */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Stop Loss</span>
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name={strategy.slStatus === 'active' ? 'Shield' : 'ShieldOff'} 
                        size={16} 
                        className={strategy.slStatus === 'active' ? 'text-success' : 'text-error'} 
                      />
                      <span className={`text-sm ${strategy.slStatus === 'active' ? 'text-success' : 'text-error'}`}>
                        {strategy.slStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {strategy.slStatus === 'active' && (
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(strategy.slValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Distance: ₹{Math.abs(strategy.pnl - strategy.slValue).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Take Profit */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Take Profit</span>
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name={strategy.tpStatus === 'active' ? 'Target' : 'X'} 
                        size={16} 
                        className={strategy.tpStatus === 'active' ? 'text-success' : 'text-muted-foreground'} 
                      />
                      <span className={`text-sm ${strategy.tpStatus === 'active' ? 'text-success' : 'text-muted-foreground'}`}>
                        {strategy.tpStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {strategy.tpStatus === 'active' && (
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(strategy.tpValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Distance: ₹{Math.abs(strategy.tpValue - strategy.pnl).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Position Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Position Details</h3>
            <div className="bg-muted/30 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Leg</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Strike</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Qty</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Premium</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.legs?.map((leg, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="p-3 text-sm text-foreground">{leg.name}</td>
                        <td className="p-3 text-sm text-foreground">{leg.type}</td>
                        <td className="p-3 text-sm font-data text-foreground">{leg.strike}</td>
                        <td className="p-3 text-sm font-data text-foreground">{leg.quantity}</td>
                        <td className="p-3 text-sm font-data text-foreground">₹{leg.premium}</td>
                        <td className={`p-3 text-sm font-data ${leg.pnl >= 0 ? 'profit' : 'loss'}`}>
                          {leg.pnl >= 0 ? '+' : ''}₹{Math.abs(leg.pnl).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="6" className="p-3 text-center text-muted-foreground">
                          No position details available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-border">
            <Button
              variant="default"
              onClick={() => onModify(strategy)}
              iconName="Settings"
              iconPosition="left"
              iconSize={16}
              className="flex-1"
            >
              Modify Strategy
            </Button>
            <Button
              variant="secondary"
              onClick={() => onSimulateRisk(strategy)}
              iconName="Calculator"
              iconPosition="left"
              iconSize={16}
              className="flex-1"
            >
              Simulate Risk
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetailsModal;
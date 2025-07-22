import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import PayoffGraphPopup from '../../../components/PayoffGraphPopup';
import riskService from '../../../utils/riskService';

const StrategyCard = ({ strategy, onModify, onClose, onSimulateRisk, onViewDetails, borderColor }) => {
  const [showPayoffPopup, setShowPayoffPopup] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':return 'text-success';
      case 'warning':return 'text-warning';
      case 'critical':return 'text-error';
      default:return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy':return 'bg-success/10 border-success/20';
      case 'warning':return 'bg-warning/10 border-warning/20';
      case 'critical':return 'bg-error/10 border-error/20';
      default:return 'bg-muted/10 border-border';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    return 'text-success';
  };

  const handleWhatIfScenario = async (scenarioData) => {
    try {
      const result = await riskService.simulateWhatIf(scenarioData.strategyId, [scenarioData.scenario]);
      if (result?.success && result.data?.simulations?.length > 0) {
        const simulation = result.data.simulations[0];
        // You could show results in a toast or modal
        console.log('What-If Results:', simulation.results);
      }
    } catch (error) {
      console.log('What-If simulation failed:', error);
    }
  };

  return (
    <>
      <div className={`bg-card rounded-xl border ${borderColor} p-6 transition-all duration-200 hover:shadow-lg ${strategy.isLocked ? 'opacity-75' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">{strategy.name}</h3>
              {strategy.isLocked &&
              <Icon name="Lock" size={14} className="text-muted-foreground" />
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">{strategy.type}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
            strategy.status === 'healthy' ? 'bg-success' :
            strategy.status === 'warning' ? 'bg-warning' : 'bg-error'}`
            }></div>
            <span className={`text-xs font-medium ${getStatusColor(strategy.status)}`}>
              {strategy.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* PnL Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current P&L</span>
            <div className="flex items-center space-x-1">
              <Icon
                name={strategy.pnl >= 0 ? "TrendingUp" : "TrendingDown"}
                size={14}
                className={strategy.pnl >= 0 ? 'text-success' : 'text-error'} />

              <span className={`text-sm font-medium ${strategy.pnl >= 0 ? 'profit' : 'loss'}`}>
                {strategy.pnl >= 0 ? '+' : ''}₹{Math.abs(strategy.pnl).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Change</span>
            <span className={`text-xs ${strategy.pnlChange >= 0 ? 'profit' : 'loss'}`}>
              {strategy.pnlChange >= 0 ? '+' : ''}{strategy.pnlChange}%
            </span>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className={`text-sm font-bold ${getRiskScoreColor(strategy.riskScore)}`}>
              {strategy.riskScore}/100
            </span>
          </div>
          
          {/* Risk Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
              strategy.riskScore >= 80 ? 'bg-error' :
              strategy.riskScore >= 60 ? 'bg-warning' : 'bg-success'}`
              }
              style={{ width: `${strategy.riskScore}%` }}>
            </div>
          </div>
        </div>

        {/* SL/TP Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stop Loss</span>
            <div className="flex items-center space-x-1">
              <Icon
                name={strategy.slStatus === 'active' ? 'Shield' : 'ShieldOff'}
                size={12}
                className={strategy.slStatus === 'active' ? 'text-success' : 'text-error'} />

              <span className={`text-xs ${strategy.slStatus === 'active' ? 'text-success' : 'text-error'}`}>
                {strategy.slStatus === 'active' ? `₹${strategy.slValue.toLocaleString('en-IN')}` : 'Not Set'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Take Profit</span>
            <div className="flex items-center space-x-1">
              <Icon
                name={strategy.tpStatus === 'active' ? 'Target' : 'X'}
                size={12}
                className={strategy.tpStatus === 'active' ? 'text-success' : 'text-muted-foreground'} />

              <span className={`text-xs ${strategy.tpStatus === 'active' ? 'text-success' : 'text-muted-foreground'}`}>
                {strategy.tpStatus === 'active' ? `₹${strategy.tpValue.toLocaleString('en-IN')}` : 'Not Set'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">Delta</span>
            <span className={`font-medium font-data ${strategy.delta >= 0 ? 'text-success' : 'text-error'}`}>
              {strategy.delta >= 0 ? '+' : ''}{strategy.delta}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Theta</span>
            <span className={`font-medium font-data ${strategy.theta >= 0 ? 'text-success' : 'text-error'}`}>
              {strategy.theta >= 0 ? '+' : ''}{strategy.theta}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Vega</span>
            <span className={`font-medium font-data ${strategy.vega >= 0 ? 'text-success' : 'text-error'}`}>
              {strategy.vega >= 0 ? '+' : ''}{strategy.vega}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Margin</span>
            <span className="font-medium font-data text-foreground">
              ₹{strategy.margin.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPayoffPopup(true)}
              iconName="TrendingUp"
              iconPosition="left"
              iconSize={14}
              disabled={strategy.isLocked}
              title="View Payoff Graph">

              Payoff
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(strategy)}
              iconName="Eye"
              iconPosition="left"
              iconSize={14}>

              Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSimulateRisk(strategy)}
              iconName="Calculator"
              iconPosition="left"
              iconSize={14}>

              Risk
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onModify(strategy)}
              iconName="Settings"
              iconPosition="left"
              iconSize={14}
              className="flex-1">

              Modify
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSimulateRisk(strategy)}
              iconName="Calculator"
              iconPosition="left"
              iconSize={14}
              className="flex-1">

              Simulate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onClose(strategy)}
              iconName="X"
              iconSize={14}>

            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center pt-2">
          <span className="text-xs text-muted-foreground">
            Updated {strategy.lastUpdated}
          </span>
        </div>
      </div>

      {/* Payoff Graph Popup */}
      <PayoffGraphPopup
        strategy={strategy}
        isOpen={showPayoffPopup}
        onClose={() => setShowPayoffPopup(false)}
        onWhatIfScenario={handleWhatIfScenario} />

    </>);

};

export default StrategyCard;
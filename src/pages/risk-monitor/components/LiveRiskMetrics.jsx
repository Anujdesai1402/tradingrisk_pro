import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Bar, Tooltip } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LiveRiskMetrics = ({ strategy, onSnapshot }) => {
  if (!strategy) {
    return (
      <div className="bg-card border border-border rounded-lg h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select a strategy to view metrics</p>
        </div>
      </div>
    );
  }

  // Calculate exposure data for donut chart
  const exposureData = [
    { name: 'Delta', value: Math.abs(strategy.totalDelta), color: '#059669' },
    { name: 'Vega', value: Math.abs(strategy.totalVega), color: '#DC6803' },
    { name: 'Theta', value: Math.abs(strategy.totalTheta), color: '#DC2626' },
    { name: 'Gamma', value: Math.abs(strategy.totalGamma), color: '#1E40AF' }
  ];

  // Health bar data
  const healthZones = [
    { zone: 'Safe', percentage: 60, color: '#059669' },
    { zone: 'Caution', percentage: 25, color: '#DC6803' },
    { zone: 'Danger', percentage: 15, color: '#DC2626' }
  ];

  // Max loss calculation
  const maxLoss = strategy.legs.reduce((total, leg) => {
    const legMaxLoss = leg.slType === 'percentage' 
      ? (leg.mtm * leg.slValue / 100)
      : leg.slValue;
    return total + Math.abs(legMaxLoss);
  }, 0);

  // Capital at risk percentage
  const capitalAtRisk = ((maxLoss / strategy.totalCapital) * 100).toFixed(1);

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-accent';
    return 'text-success';
  };

  const getRiskScoreBg = (score) => {
    if (score >= 80) return 'bg-error/10';
    if (score >= 60) return 'bg-warning/10';
    if (score >= 40) return 'bg-accent/10';
    return 'bg-success/10';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-modal p-3">
          <p className="text-sm font-medium text-foreground">{`${label}: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Live Metrics</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSnapshot(strategy)}
            iconName="Camera"
            iconPosition="left"
          >
            Snapshot
          </Button>
        </div>

        {/* Risk Score */}
        <div className={`
          p-4 rounded-lg border text-center
          ${getRiskScoreBg(strategy.riskScore)}
        `}>
          <div className="text-2xl font-bold mb-1">
            <span className={getRiskScoreColor(strategy.riskScore)}>
              {strategy.riskScore}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Risk Score</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Exposure Distribution */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Greeks Exposure</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exposureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {exposureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {exposureData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Bar */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">PnL Health Zones</h3>
          <div className="space-y-2">
            {healthZones.map((zone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-xs text-muted-foreground">{zone.zone}</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${zone.percentage}%`,
                      backgroundColor: zone.color
                    }}
                  ></div>
                </div>
                <div className="w-8 text-xs text-muted-foreground text-right">
                  {zone.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Key Metrics</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Total MTM */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total MTM</span>
                <Icon name="TrendingUp" size={14} className="text-muted-foreground" />
              </div>
              <div className={`text-lg font-bold font-data ${strategy.totalMTM >= 0 ? 'text-success' : 'text-error'}`}>
                ₹{strategy.totalMTM.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Max Loss Estimator */}
            <div className="bg-error/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Max Loss</span>
                <Icon name="AlertTriangle" size={14} className="text-error" />
              </div>
              <div className="text-lg font-bold font-data text-error">
                ₹{maxLoss.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Capital at Risk */}
            <div className="bg-warning/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Capital at Risk</span>
                <Icon name="PieChart" size={14} className="text-warning" />
              </div>
              <div className="text-lg font-bold font-data text-warning">
                {capitalAtRisk}%
              </div>
            </div>

            {/* Total Margin */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Margin</span>
                <Icon name="DollarSign" size={14} className="text-muted-foreground" />
              </div>
              <div className="text-lg font-bold font-data text-foreground">
                ₹{strategy.totalMargin.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* SL Proximity Indicators */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">SL Proximity</h3>
          <div className="space-y-2">
            {strategy.legs.slice(0, 3).map((leg, index) => {
              const slProximity = Math.abs((leg.currentPrice - leg.slPrice) / leg.currentPrice * 100);
              const proximityColor = slProximity < 5 ? 'text-error' : slProximity < 10 ? 'text-warning' : 'text-success';
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <span className="text-xs text-muted-foreground truncate">{leg.instrument}</span>
                  <span className={`text-xs font-data ${proximityColor}`}>
                    {slProximity.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawdown Ranges */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Drawdown Analysis</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Current DD</span>
              <span className="text-xs font-data text-error">
                {strategy.currentDrawdown.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Max DD (Today)</span>
              <span className="text-xs font-data text-error">
                {strategy.maxDrawdownToday.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">DD Limit</span>
              <span className="text-xs font-data text-muted-foreground">
                {strategy.drawdownLimit.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Clock" size={12} />
            <span>Last updated: {new Date().toLocaleTimeString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRiskMetrics;
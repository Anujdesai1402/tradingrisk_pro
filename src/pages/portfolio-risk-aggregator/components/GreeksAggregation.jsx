import React from 'react';
import Icon from '../../../components/AppIcon';

const GreeksAggregation = ({ greeksData }) => {
  const { delta, vega, theta, gamma } = greeksData;

  const getGaugeColor = (value, range) => {
    const percentage = Math.abs(value) / range.max * 100;
    if (percentage >= 80) return 'text-error';
    if (percentage >= 60) return 'text-warning';
    return 'text-success';
  };

  const getGaugeFill = (value, range) => {
    const percentage = Math.abs(value) / range.max * 100;
    if (percentage >= 80) return 'bg-error';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-success';
  };

  const GreekGauge = ({ label, value, range, description, icon }) => {
    const percentage = Math.min(Math.abs(value) / range.max * 100, 100);
    const isNegative = value < 0;
    
    return (
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name={icon} size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
          <span className={`text-lg font-semibold ${getGaugeColor(value, range)}`}>
            {isNegative ? '-' : ''}₹{Math.abs(value).toLocaleString('en-IN')}
          </span>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>-₹{range.max.toLocaleString('en-IN')}</span>
            <span>₹{range.max.toLocaleString('en-IN')}</span>
          </div>
          <div className="h-2 bg-muted rounded-full relative overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-error via-warning to-success opacity-20" />
            </div>
            <div 
              className={`absolute top-0 h-full ${getFill(value, range)} rounded-full transition-all duration-300`}
              style={{ 
                width: `${percentage}%`,
                left: isNegative ? `${50 - percentage/2}%` : '50%'
              }}
            />
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-border transform -translate-x-0.5" />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">{description}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Safe Range: ±₹{range.safe.toLocaleString('en-IN')}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            Math.abs(value) <= range.safe 
              ? 'bg-success/10 text-success' 
              : Math.abs(value) <= range.warning
              ? 'bg-warning/10 text-warning' :'bg-error/10 text-error'
          }`}>
            {Math.abs(value) <= range.safe ? 'Safe' : Math.abs(value) <= range.warning ? 'Caution' : 'Risk'}
          </span>
        </div>
      </div>
    );
  };

  const getFill = (value, range) => {
    const percentage = Math.abs(value) / range.max * 100;
    if (percentage >= 80) return 'bg-error';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Portfolio Greeks</h3>
          <p className="text-sm text-muted-foreground">Net exposure across all strategies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={16} className="text-primary" />
          <span className="text-sm text-primary">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GreekGauge
          label="Net Delta"
          value={delta.value}
          range={delta.range}
          description="Directional exposure to underlying price movements"
          icon="TrendingUp"
        />
        
        <GreekGauge
          label="Net Vega"
          value={vega.value}
          range={vega.range}
          description="Sensitivity to implied volatility changes"
          icon="Activity"
        />
        
        <GreekGauge
          label="Net Theta"
          value={theta.value}
          range={theta.range}
          description="Time decay impact on portfolio value"
          icon="Clock"
        />
        
        <GreekGauge
          label="Net Gamma"
          value={gamma.value}
          range={gamma.range}
          description="Rate of change in delta exposure"
          icon="Zap"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="text-sm">
            <p className="text-foreground font-medium">Greeks Summary</p>
            <p className="text-muted-foreground mt-1">
              Portfolio shows {Math.abs(delta.value) <= delta.range.safe ? 'balanced' : 'elevated'} directional risk 
              with {Math.abs(vega.value) <= vega.range.safe ? 'controlled' : 'high'} volatility exposure. 
              Daily theta decay: ₹{Math.abs(theta.value).toLocaleString('en-IN')}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreeksAggregation;
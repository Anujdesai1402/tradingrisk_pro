import React from 'react';
import Icon from '../../../components/AppIcon';

const MarketDataWidget = ({ marketData }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-success' : 'text-error';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? 'TrendingUp' : 'TrendingDown';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Market Data</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {marketData.indices.map((index) => (
          <div key={index.symbol} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {index.symbol.substring(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{index.name}</p>
                <p className="text-xs text-muted-foreground">{index.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-data text-foreground">
                {formatPrice(index.price)}
              </p>
              <div className="flex items-center space-x-1">
                <Icon 
                  name={getChangeIcon(index.change)} 
                  size={12} 
                  className={getChangeColor(index.change)} 
                />
                <span className={`text-xs font-medium ${getChangeColor(index.change)}`}>
                  {index.change >= 0 ? '+' : ''}{index.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Key Metrics</h4>
        <div className="grid grid-cols-2 gap-3">
          {marketData.metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className={`text-sm font-bold font-data ${
                metric.type === 'volatility' ? 'text-warning' :
                metric.type === 'volume' ? 'text-primary' : 'text-foreground'
              }`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last Updated</span>
          <span>{marketData.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketDataWidget;
import React from 'react';
import Icon from '../../../components/AppIcon';

const CorrelationMatrix = ({ correlationData }) => {
  const getCorrelationColor = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return value > 0 ? 'bg-error' : 'bg-blue-600';
    if (absValue >= 0.6) return value > 0 ? 'bg-warning' : 'bg-blue-400';
    if (absValue >= 0.4) return value > 0 ? 'bg-yellow-400' : 'bg-blue-200';
    return 'bg-muted';
  };

  const getTextColor = (value) => {
    const absValue = Math.abs(value);
    return absValue >= 0.4 ? 'text-white' : 'text-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Strategy Correlation Matrix</h3>
          <p className="text-sm text-muted-foreground">Interdependency analysis between strategies</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-error rounded" />
            <span>High Positive</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-blue-600 rounded" />
            <span>High Negative</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-muted rounded" />
            <span>Low</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="w-32 p-2"></th>
              {correlationData.strategies.map((strategy, index) => (
                <th key={index} className="p-2 text-xs font-medium text-muted-foreground text-center min-w-[80px]">
                  <div className="transform -rotate-45 origin-center whitespace-nowrap">
                    {strategy}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {correlationData.matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="p-2 text-xs font-medium text-muted-foreground text-right pr-4">
                  {correlationData.strategies[rowIndex]}
                </td>
                {row.map((value, colIndex) => (
                  <td key={colIndex} className="p-1">
                    <div 
                      className={`w-16 h-8 rounded flex items-center justify-center ${getCorrelationColor(value)}`}
                      title={`${correlationData.strategies[rowIndex]} vs ${correlationData.strategies[colIndex]}: ${value}`}
                    >
                      <span className={`text-xs font-medium ${getTextColor(value)}`}>
                        {rowIndex === colIndex ? '1.0' : value.toFixed(1)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="text-sm">
            <p className="text-foreground font-medium">Correlation Insights</p>
            <p className="text-muted-foreground mt-1">
              High positive correlations (&gt;0.8) indicate strategies moving together, increasing portfolio risk. 
              High negative correlations (&lt;-0.8) suggest natural hedging effects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
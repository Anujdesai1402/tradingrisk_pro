import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const StrategyComparisonTable = ({ strategies }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStrategies = React.useMemo(() => {
    let sortableStrategies = [...strategies];
    if (sortConfig.key) {
      sortableStrategies.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStrategies;
  }, [strategies, sortConfig]);

  const getRiskColor = (risk) => {
    if (risk >= 80) return 'text-error';
    if (risk >= 60) return 'text-warning';
    return 'text-success';
  };

  const getExposureColor = (exposure) => {
    if (exposure === 'High') return 'bg-error text-error-foreground';
    if (exposure === 'Medium') return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-micro"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <Icon 
          name={sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
          size={14} 
        />
      </div>
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Strategy Risk Comparison</h3>
        <p className="text-sm text-muted-foreground">Individual strategy contributions to portfolio risk</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              <SortableHeader label="Strategy" sortKey="name" />
              <SortableHeader label="Risk Score" sortKey="riskScore" />
              <SortableHeader label="Exposure" sortKey="exposure" />
              <SortableHeader label="PnL" sortKey="pnl" />
              <SortableHeader label="Delta" sortKey="delta" />
              <SortableHeader label="Vega" sortKey="vega" />
              <SortableHeader label="Theta" sortKey="theta" />
              <SortableHeader label="Correlation" sortKey="correlation" />
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedStrategies.map((strategy) => (
              <tr key={strategy.id} className="hover:bg-muted/20 transition-micro">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${strategy.status === 'active' ? 'bg-success' : 'bg-muted'}`} />
                    <div>
                      <div className="text-sm font-medium text-foreground">{strategy.name}</div>
                      <div className="text-xs text-muted-foreground">{strategy.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getRiskColor(strategy.riskScore)}`}>
                    {strategy.riskScore}/100
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getExposureColor(strategy.exposureLevel)}`}>
                    {strategy.exposureLevel}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${strategy.pnl >= 0 ? 'profit' : 'loss'}`}>
                    ₹{strategy.pnl.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-data text-foreground">{strategy.delta}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-data text-foreground">{strategy.vega}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-data text-foreground">{strategy.theta}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground">{strategy.correlation}%</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button className="text-primary hover:text-primary/80 transition-micro">
                      <Icon name="Eye" size={16} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-micro">
                      <Icon name="Settings" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyComparisonTable;
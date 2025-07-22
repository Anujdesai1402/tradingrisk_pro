import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RiskTable = ({ strategy, onExport }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState(new Set());

  if (!strategy) {
    return (
      <div className="bg-card border border-border rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Select a Strategy</h3>
          <p className="text-sm text-muted-foreground">Choose a strategy from the sidebar to view detailed risk analysis</p>
        </div>
      </div>
    );
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleRowExpansion = (legId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(legId)) {
      newExpanded.delete(legId);
    } else {
      newExpanded.add(legId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedLegs = [...strategy.legs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'breach': return 'text-error';
      case 'warning': return 'text-warning';
      case 'safe': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'breach': return 'bg-error/10';
      case 'warning': return 'bg-warning/10';
      case 'safe': return 'bg-success/10';
      default: return 'bg-muted/10';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{strategy.name}</h2>
            <p className="text-sm text-muted-foreground">
              {strategy.symbol} • {strategy.legs.length} legs • Exp: {new Date(strategy.expiry).toLocaleDateString('en-IN')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              iconName="Download"
              iconPosition="left"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('json')}
              iconName="FileText"
              iconPosition="left"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Leg Details
              </th>
              {['delta', 'vega', 'theta', 'gamma', 'margin', 'mtm'].map((key) => (
                <th
                  key={key}
                  className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-micro"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <Icon name={getSortIcon(key)} size={12} />
                  </div>
                </th>
              ))}
              <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sortedLegs.map((leg, index) => (
              <React.Fragment key={leg.id}>
                <tr className={`border-b border-border hover:bg-muted/30 transition-micro ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">
                        {leg.instrument}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {leg.type} • Strike: ₹{leg.strike} • Qty: {leg.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-data text-sm">
                    <span className={leg.delta >= 0 ? 'text-success' : 'text-error'}>
                      {leg.delta.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-right font-data text-sm">
                    <span className={leg.vega >= 0 ? 'text-success' : 'text-error'}>
                      {leg.vega.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-right font-data text-sm">
                    <span className={leg.theta >= 0 ? 'text-success' : 'text-error'}>
                      {leg.theta.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-right font-data text-sm">
                    <span className={leg.gamma >= 0 ? 'text-success' : 'text-error'}>
                      {leg.gamma.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-right font-data text-sm text-foreground">
                    ₹{leg.margin.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-data text-sm">
                    <span className={leg.mtm >= 0 ? 'text-success' : 'text-error'}>
                      ₹{leg.mtm.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${getStatusBg(leg.status)} ${getStatusColor(leg.status)}
                    `}>
                      {leg.status.charAt(0).toUpperCase() + leg.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleRowExpansion(leg.id)}
                      className="p-1 rounded hover:bg-muted transition-micro"
                    >
                      <Icon
                        name={expandedRows.has(leg.id) ? "ChevronUp" : "ChevronDown"}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Row Details */}
                {expandedRows.has(leg.id) && (
                  <tr className="bg-muted/20">
                    <td colSpan="8" className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Greeks Details */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Greeks Breakdown</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Delta per unit:</span>
                              <span className="font-data">{(leg.delta / leg.quantity).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vega per unit:</span>
                              <span className="font-data">{(leg.vega / leg.quantity).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Theta per unit:</span>
                              <span className="font-data">{(leg.theta / leg.quantity).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gamma per unit:</span>
                              <span className="font-data">{(leg.gamma / leg.quantity).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>

                        {/* SL/TP Configuration */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">SL/TP Settings</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Stop Loss:</span>
                              <span className="font-data text-error">
                                {leg.slType === 'percentage' ? `${leg.slValue}%` : `₹${leg.slValue}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Take Profit:</span>
                              <span className="font-data text-success">
                                {leg.tpType === 'percentage' ? `${leg.tpValue}%` : `₹${leg.tpValue}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trailing SL:</span>
                              <span className={`font-data ${leg.trailingSL ? 'text-success' : 'text-muted-foreground'}`}>
                                {leg.trailingSL ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Risk Warnings */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Risk Alerts</h4>
                          <div className="space-y-1">
                            {leg.warnings.map((warning, idx) => (
                              <div key={idx} className="flex items-start space-x-2">
                                <Icon
                                  name={warning.type === 'error' ? 'AlertTriangle' : 'AlertCircle'}
                                  size={12}
                                  className={warning.type === 'error' ? 'text-error' : 'text-warning'}
                                />
                                <span className="text-xs text-muted-foreground">{warning.message}</span>
                              </div>
                            ))}
                            {leg.warnings.length === 0 && (
                              <div className="flex items-center space-x-2">
                                <Icon name="CheckCircle" size={12} className="text-success" />
                                <span className="text-xs text-success">No active warnings</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskTable;
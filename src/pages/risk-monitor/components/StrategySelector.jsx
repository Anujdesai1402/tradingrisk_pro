import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const StrategySelector = ({ strategies, selectedStrategy, onStrategySelect, filters, onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'warning', label: 'Warning' },
    { value: 'breach', label: 'Breach' },
    { value: 'paused', label: 'Paused' }
  ];

  const symbolOptions = [
    { value: 'all', label: 'All Symbols' },
    { value: 'NIFTY', label: 'NIFTY' },
    { value: 'BANKNIFTY', label: 'BANKNIFTY' },
    { value: 'SENSEX', label: 'SENSEX' },
    { value: 'RELIANCE', label: 'RELIANCE' }
  ];

  const expiryOptions = [
    { value: 'all', label: 'All Expiry' },
    { value: '2025-01-30', label: '30 Jan 2025' },
    { value: '2025-02-27', label: '27 Feb 2025' },
    { value: '2025-03-27', label: '27 Mar 2025' }
  ];

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-accent';
    return 'text-success';
  };

  const getRiskScoreBg = (score) => {
    if (score >= 80) return 'bg-error/10 border-error/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    if (score >= 40) return 'bg-accent/10 border-accent/20';
    return 'bg-success/10 border-success/20';
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || strategy.status === filters.status;
    const matchesSymbol = filters.symbol === 'all' || strategy.symbol === filters.symbol;
    const matchesExpiry = filters.expiry === 'all' || strategy.expiry === filters.expiry;
    
    return matchesSearch && matchesStatus && matchesSymbol && matchesExpiry;
  });

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Strategy Monitor</h2>
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Search strategies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* Filters */}
        <div className="space-y-3">
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => onFiltersChange({ ...filters, status: value })}
          />
          
          <Select
            label="Symbol"
            options={symbolOptions}
            value={filters.symbol}
            onChange={(value) => onFiltersChange({ ...filters, symbol: value })}
          />
          
          <Select
            label="Expiry"
            options={expiryOptions}
            value={filters.expiry}
            onChange={(value) => onFiltersChange({ ...filters, expiry: value })}
          />
        </div>
      </div>

      {/* Strategy List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredStrategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => onStrategySelect(strategy)}
              className={`
                w-full p-3 rounded-lg border text-left transition-micro
                ${selectedStrategy?.id === strategy.id
                  ? 'bg-primary/10 border-primary text-primary' :'bg-card border-border hover:bg-muted'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{strategy.name}</span>
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getRiskScoreBg(strategy.riskScore)}
                `}>
                  <span className={getRiskScoreColor(strategy.riskScore)}>
                    {strategy.riskScore}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{strategy.symbol}</span>
                <span className={`
                  px-2 py-1 rounded-full
                  ${strategy.status === 'active' ? 'bg-success/10 text-success' :
                    strategy.status === 'warning' ? 'bg-warning/10 text-warning' :
                    strategy.status === 'breach'? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>MTM: ₹{strategy.mtm.toLocaleString('en-IN')}</span>
                  <span>Legs: {strategy.legs.length}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {filteredStrategies.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No strategies found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategySelector;
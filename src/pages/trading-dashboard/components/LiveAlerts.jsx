import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LiveAlerts = ({ alerts, onClearAlert, onClearAll }) => {
  const [filter, setFilter] = useState('all');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'sl_hit': return 'Shield';
      case 'margin_breach': return 'AlertTriangle';
      case 'trailing_sl': return 'TrendingUp';
      case 'iv_spike': return 'Zap';
      case 'system': return 'Settings';
      default: return 'Bell';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertBg = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-error/10 border-error/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'info': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.severity === filter
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-foreground">Live Alerts</h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        {alerts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            iconName="X"
            iconSize={14}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { key: 'all', label: 'All', count: alerts.length },
          { key: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
          { key: 'warning', label: 'Warning', count: alerts.filter(a => a.severity === 'warning').length },
          { key: 'info', label: 'Info', count: alerts.filter(a => a.severity === 'info').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-micro ${
              filter === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                filter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Icon name="Bell" size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No alerts to display</p>
            <p className="text-xs text-muted-foreground">All systems running smoothly</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 space-y-2 ${getAlertBg(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <Icon 
                    name={getAlertIcon(alert.type)} 
                    size={16} 
                    className={getAlertColor(alert.severity)} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    {alert.strategy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Strategy: {alert.strategy}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onClearAlert(alert.id)}
                  className="text-muted-foreground hover:text-foreground transition-micro"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTime(alert.timestamp)}
                </span>
                {alert.value && (
                  <span className={`text-xs font-medium font-data ${getAlertColor(alert.severity)}`}>
                    {alert.value}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Stats */}
      {alerts.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-bold text-error">
                {alerts.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="text-sm font-bold text-warning">
                {alerts.filter(a => a.severity === 'warning').length}
              </div>
              <div className="text-xs text-muted-foreground">Warning</div>
            </div>
            <div>
              <div className="text-sm font-bold text-primary">
                {alerts.filter(a => a.severity === 'info').length}
              </div>
              <div className="text-xs text-muted-foreground">Info</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAlerts;
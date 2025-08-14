import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const RiskConfiguration = ({ onConfigChange }) => {
  const [config, setConfig] = useState({
    stopLoss: {
      enabled: true,
      fixedAmount: 5000,
      percentage: 15,
      useFixed: true
    },
    takeProfit: {
      enabled: true,
      fixedAmount: 3000,
      percentage: 10,
      useFixed: true
    },
    trailingSL: {
      enabled: false,
      triggerPnL: 1500,
      trailAmount: 500,
      trailPercentage: 5,
      useFixed: true
    },
    cooldownTimer: {
      enabled: true,
      highIVDelay: 300,
      mtmLossDelay: 600,
      ivThreshold: 25,
      mtmThreshold: 10
    },
    marginCap: {
      enabled: true,
      maxPercentage: 25,
      warningPercentage: 20
    }
  });

  const [expandedSections, setExpandedSections] = useState({
    stopLoss: true,
    takeProfit: true,
    trailingSL: false,
    cooldown: false,
    margin: false
  });

  const handleConfigUpdate = (section, field, value) => {
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateRiskMetrics = () => {
    const maxLoss = config.stopLoss.enabled 
      ? (config.stopLoss.useFixed ? config.stopLoss.fixedAmount : (45000 * config.stopLoss.percentage / 100))
      : 6800;
    const maxProfit = config.takeProfit.enabled
      ? (config.takeProfit.useFixed ? config.takeProfit.fixedAmount : (45000 * config.takeProfit.percentage / 100))
      : 3200;
    
    return {
      maxLoss,
      maxProfit,
      riskReward: maxProfit / maxLoss,
      marginUsage: (45000 / 200000) * 100
    };
  };

  const metrics = calculateRiskMetrics();

  return (
    <div className="space-y-6">
      {/* Risk Metrics Summary */}
      <div className="trading-card">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Shield" size={18} className="text-primary" />
          <h4 className="text-md font-semibold text-foreground">Risk Summary</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max Loss</span>
              <span className="text-sm font-medium text-error">₹{metrics.maxLoss.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max Profit</span>
              <span className="text-sm font-medium text-success">₹{metrics.maxProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Risk:Reward</span>
              <span className="text-sm font-medium text-foreground">1:{metrics.riskReward.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Margin Usage</span>
              <span className="text-sm font-medium text-foreground">{metrics.marginUsage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Loss Configuration */}
      <div className="trading-card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('stopLoss')}
        >
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={18} className="text-error" />
            <h4 className="text-md font-semibold text-foreground">Stop Loss</h4>
            <Checkbox
              checked={config.stopLoss.enabled}
              onChange={(e) => {
                e.stopPropagation();
                handleConfigUpdate('stopLoss', 'enabled', e.target.checked);
              }}
              className="ml-2"
            />
          </div>
          <Icon 
            name={expandedSections.stopLoss ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>

        {expandedSections.stopLoss && config.stopLoss.enabled && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                label="Fixed Amount"
                checked={config.stopLoss.useFixed}
                onChange={(e) => handleConfigUpdate('stopLoss', 'useFixed', e.target.checked)}
              />
              <Checkbox
                label="Percentage"
                checked={!config.stopLoss.useFixed}
                onChange={(e) => handleConfigUpdate('stopLoss', 'useFixed', !e.target.checked)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fixed Amount (₹)"
                type="number"
                value={config.stopLoss.fixedAmount}
                onChange={(e) => handleConfigUpdate('stopLoss', 'fixedAmount', parseInt(e.target.value) || 0)}
                disabled={!config.stopLoss.useFixed}
                placeholder="5000"
              />
              <Input
                label="Percentage (%)"
                type="number"
                value={config.stopLoss.percentage}
                onChange={(e) => handleConfigUpdate('stopLoss', 'percentage', parseInt(e.target.value) || 0)}
                disabled={config.stopLoss.useFixed}
                placeholder="15"
                min="1"
                max="100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Take Profit Configuration */}
      <div className="trading-card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('takeProfit')}
        >
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={18} className="text-success" />
            <h4 className="text-md font-semibold text-foreground">Take Profit</h4>
            <Checkbox
              checked={config.takeProfit.enabled}
              onChange={(e) => {
                e.stopPropagation();
                handleConfigUpdate('takeProfit', 'enabled', e.target.checked);
              }}
              className="ml-2"
            />
          </div>
          <Icon 
            name={expandedSections.takeProfit ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>

        {expandedSections.takeProfit && config.takeProfit.enabled && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                label="Fixed Amount"
                checked={config.takeProfit.useFixed}
                onChange={(e) => handleConfigUpdate('takeProfit', 'useFixed', e.target.checked)}
              />
              <Checkbox
                label="Percentage"
                checked={!config.takeProfit.useFixed}
                onChange={(e) => handleConfigUpdate('takeProfit', 'useFixed', !e.target.checked)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fixed Amount (₹)"
                type="number"
                value={config.takeProfit.fixedAmount}
                onChange={(e) => handleConfigUpdate('takeProfit', 'fixedAmount', parseInt(e.target.value) || 0)}
                disabled={!config.takeProfit.useFixed}
                placeholder="3000"
              />
              <Input
                label="Percentage (%)"
                type="number"
                value={config.takeProfit.percentage}
                onChange={(e) => handleConfigUpdate('takeProfit', 'percentage', parseInt(e.target.value) || 0)}
                disabled={config.takeProfit.useFixed}
                placeholder="10"
                min="1"
                max="100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Trailing Stop Loss */}
      <div className="trading-card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('trailingSL')}
        >
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={18} className="text-accent" />
            <h4 className="text-md font-semibold text-foreground">Trailing Stop Loss</h4>
            <Checkbox
              checked={config.trailingSL.enabled}
              onChange={(e) => {
                e.stopPropagation();
                handleConfigUpdate('trailingSL', 'enabled', e.target.checked);
              }}
              className="ml-2"
            />
          </div>
          <Icon 
            name={expandedSections.trailingSL ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>

        {expandedSections.trailingSL && config.trailingSL.enabled && (
          <div className="mt-4 space-y-4">
            <Input
              label="Trigger PnL (₹)"
              type="number"
              value={config.trailingSL.triggerPnL}
              onChange={(e) => handleConfigUpdate('trailingSL', 'triggerPnL', parseInt(e.target.value) || 0)}
              placeholder="1500"
              description="PnL increase required to activate trailing"
            />

            <div className="flex items-center space-x-4">
              <Checkbox
                label="Fixed Trail Amount"
                checked={config.trailingSL.useFixed}
                onChange={(e) => handleConfigUpdate('trailingSL', 'useFixed', e.target.checked)}
              />
              <Checkbox
                label="Percentage Trail"
                checked={!config.trailingSL.useFixed}
                onChange={(e) => handleConfigUpdate('trailingSL', 'useFixed', !e.target.checked)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Trail Amount (₹)"
                type="number"
                value={config.trailingSL.trailAmount}
                onChange={(e) => handleConfigUpdate('trailingSL', 'trailAmount', parseInt(e.target.value) || 0)}
                disabled={!config.trailingSL.useFixed}
                placeholder="500"
              />
              <Input
                label="Trail Percentage (%)"
                type="number"
                value={config.trailingSL.trailPercentage}
                onChange={(e) => handleConfigUpdate('trailingSL', 'trailPercentage', parseInt(e.target.value) || 0)}
                disabled={config.trailingSL.useFixed}
                placeholder="5"
                min="1"
                max="50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cool-down Timer */}
      <div className="trading-card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('cooldown')}
        >
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={18} className="text-warning" />
            <h4 className="text-md font-semibold text-foreground">Cool-down Timer</h4>
            <Checkbox
              checked={config.cooldownTimer.enabled}
              onChange={(e) => {
                e.stopPropagation();
                handleConfigUpdate('cooldownTimer', 'enabled', e.target.checked);
              }}
              className="ml-2"
            />
          </div>
          <Icon 
            name={expandedSections.cooldown ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>

        {expandedSections.cooldown && config.cooldownTimer.enabled && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="High IV Delay (seconds)"
                type="number"
                value={config.cooldownTimer.highIVDelay}
                onChange={(e) => handleConfigUpdate('cooldownTimer', 'highIVDelay', parseInt(e.target.value) || 0)}
                placeholder="300"
              />
              <Input
                label="MTM Loss Delay (seconds)"
                type="number"
                value={config.cooldownTimer.mtmLossDelay}
                onChange={(e) => handleConfigUpdate('cooldownTimer', 'mtmLossDelay', parseInt(e.target.value) || 0)}
                placeholder="600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IV Threshold (%)"
                type="number"
                value={config.cooldownTimer.ivThreshold}
                onChange={(e) => handleConfigUpdate('cooldownTimer', 'ivThreshold', parseInt(e.target.value) || 0)}
                placeholder="25"
              />
              <Input
                label="MTM Threshold (%)"
                type="number"
                value={config.cooldownTimer.mtmThreshold}
                onChange={(e) => handleConfigUpdate('cooldownTimer', 'mtmThreshold', parseInt(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Margin Cap */}
      <div className="trading-card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('margin')}
        >
          <div className="flex items-center space-x-2">
            <Icon name="PieChart" size={18} className="text-secondary" />
            <h4 className="text-md font-semibold text-foreground">Margin Cap</h4>
            <Checkbox
              checked={config.marginCap.enabled}
              onChange={(e) => {
                e.stopPropagation();
                handleConfigUpdate('marginCap', 'enabled', e.target.checked);
              }}
              className="ml-2"
            />
          </div>
          <Icon 
            name={expandedSections.margin ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>

        {expandedSections.margin && config.marginCap.enabled && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Margin Usage (%)"
                type="number"
                value={config.marginCap.maxPercentage}
                onChange={(e) => handleConfigUpdate('marginCap', 'maxPercentage', parseInt(e.target.value) || 0)}
                placeholder="25"
                min="1"
                max="100"
              />
              <Input
                label="Warning Threshold (%)"
                type="number"
                value={config.marginCap.warningPercentage}
                onChange={(e) => handleConfigUpdate('marginCap', 'warningPercentage', parseInt(e.target.value) || 0)}
                placeholder="20"
                min="1"
                max="100"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskConfiguration;
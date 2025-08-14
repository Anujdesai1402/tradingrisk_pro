import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

import { Checkbox } from '../../../components/ui/Checkbox';

const SafetyChecklist = ({ config, strategy, onChecklistComplete }) => {
  const [checklistItems, setChecklistItems] = useState([]);
  const [userAcknowledgments, setUserAcknowledgments] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    generateChecklist();
  }, [config, strategy]);

  const generateChecklist = () => {
    const items = [];

    // Unhedged Legs Check
    const unhedgedLegs = checkUnhedgedLegs();
    if (unhedgedLegs.length > 0) {
      items.push({
        id: 'unhedged_legs',
        type: 'warning',
        title: 'Unhedged Legs Detected',
        description: `${unhedgedLegs.length} legs may be unhedged: ${unhedgedLegs.join(', ')}`,
        severity: 'high',
        requiresAck: true
      });
    }

    // SL/TP Validation
    if (!config?.stopLoss?.enabled && !config?.takeProfit?.enabled) {
      items.push({
        id: 'no_sl_tp',
        type: 'error',
        title: 'No Stop Loss or Take Profit',
        description: 'Strategy has no risk controls configured',
        severity: 'critical',
        requiresAck: true
      });
    }

    // Margin Cap Check
    const marginUsage = calculateMarginUsage();
    if (marginUsage > 80) {
      items.push({
        id: 'high_margin',
        type: 'warning',
        title: 'High Margin Usage',
        description: `Margin usage at ${marginUsage.toFixed(1)}% of available capital`,
        severity: 'medium',
        requiresAck: true
      });
    }

    // Risk:Reward Validation
    const riskReward = calculateRiskReward();
    if (riskReward < 0.5) {
      items.push({
        id: 'poor_rr',
        type: 'warning',
        title: 'Poor Risk:Reward Ratio',
        description: `Current R:R is 1:${riskReward.toFixed(2)}, consider adjusting targets`,
        severity: 'medium',
        requiresAck: true
      });
    }

    // IV Environment Check
    const ivLevel = checkIVEnvironment();
    if (ivLevel === 'high') {
      items.push({
        id: 'high_iv',
        type: 'info',
        title: 'High IV Environment',
        description: 'Current IV is elevated, consider impact on strategy performance',
        severity: 'low',
        requiresAck: false
      });
    }

    // Time to Expiry Check
    const timeCheck = checkTimeToExpiry();
    if (timeCheck.warning) {
      items.push({
        id: 'time_warning',
        type: 'warning',
        title: timeCheck.title,
        description: timeCheck.description,
        severity: 'medium',
        requiresAck: true
      });
    }

    // Positive checks
    if (config?.stopLoss?.enabled) {
      items.push({
        id: 'sl_configured',
        type: 'success',
        title: 'Stop Loss Configured',
        description: `SL set at ${config.stopLoss.useFixed ? '₹' + config.stopLoss.fixedAmount.toLocaleString('en-IN') : config.stopLoss.percentage + '%'}`,
        severity: 'none',
        requiresAck: false
      });
    }

    if (config?.takeProfit?.enabled) {
      items.push({
        id: 'tp_configured',
        type: 'success',
        title: 'Take Profit Configured',
        description: `TP set at ${config.takeProfit.useFixed ? '₹' + config.takeProfit.fixedAmount.toLocaleString('en-IN') : config.takeProfit.percentage + '%'}`,
        severity: 'none',
        requiresAck: false
      });
    }

    setChecklistItems(items);
  };

  const checkUnhedgedLegs = () => {
    // Mock logic for unhedged legs detection
    const mockUnhedged = [];
    if (strategy?.legs) {
      const callLegs = strategy.legs.filter(leg => leg.type.includes('Call'));
      const putLegs = strategy.legs.filter(leg => leg.type.includes('Put'));
      
      if (callLegs.length === 1) mockUnhedged.push('Naked Call');
      if (putLegs.length === 1) mockUnhedged.push('Naked Put');
    }
    return mockUnhedged;
  };

  const calculateMarginUsage = () => {
    return 22.5; // Mock calculation
  };

  const calculateRiskReward = () => {
    if (!config?.stopLoss?.enabled || !config?.takeProfit?.enabled) return 0;
    
    const maxLoss = config.stopLoss.useFixed ? config.stopLoss.fixedAmount : 5000;
    const maxProfit = config.takeProfit.useFixed ? config.takeProfit.fixedAmount : 3000;
    
    return maxProfit / maxLoss;
  };

  const checkIVEnvironment = () => {
    const currentIV = 18.8; // Mock current IV
    return currentIV > 25 ? 'high' : currentIV < 15 ? 'low' : 'normal';
  };

  const checkTimeToExpiry = () => {
    const daysToExpiry = 158; // Mock days
    if (daysToExpiry < 7) {
      return {
        warning: true,
        title: 'Near Expiry Warning',
        description: `Only ${daysToExpiry} days to expiry, theta decay will accelerate`
      };
    }
    if (daysToExpiry > 365) {
      return {
        warning: true,
        title: 'Long Time to Expiry',
        description: `${daysToExpiry} days to expiry, consider shorter-term alternatives`
      };
    }
    return { warning: false };
  };

  const handleAcknowledgment = (itemId, acknowledged) => {
    setUserAcknowledgments(prev => ({
      ...prev,
      [itemId]: acknowledged
    }));
  };

  const getRequiredAcknowledgments = () => {
    return checklistItems.filter(item => item.requiresAck);
  };

  const getCompletedAcknowledgments = () => {
    const required = getRequiredAcknowledgments();
    return required.filter(item => userAcknowledgments[item.id]);
  };

  const isChecklistComplete = () => {
    const required = getRequiredAcknowledgments();
    const completed = getCompletedAcknowledgments();
    return required.length === completed.length;
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'error': return { name: 'XCircle', color: 'text-error' };
      case 'warning': return { name: 'AlertTriangle', color: 'text-warning' };
      case 'success': return { name: 'CheckCircle', color: 'text-success' };
      case 'info': return { name: 'Info', color: 'text-primary' };
      default: return { name: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-error bg-error/5';
      case 'high': return 'border-l-warning bg-warning/5';
      case 'medium': return 'border-l-accent bg-accent/5';
      case 'low': return 'border-l-primary bg-primary/5';
      default: return 'border-l-success bg-success/5';
    }
  };

  useEffect(() => {
    onChecklistComplete?.(isChecklistComplete());
  }, [userAcknowledgments, checklistItems]);

  const criticalIssues = checklistItems.filter(item => item.severity === 'critical');
  const warningIssues = checklistItems.filter(item => item.severity === 'high' || item.severity === 'medium');
  const infoIssues = checklistItems.filter(item => item.severity === 'low' || item.severity === 'none');

  return (
    <div className="trading-card">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Icon name="Shield" size={18} className="text-primary" />
          <div>
            <h4 className="text-md font-semibold text-foreground">Pre-deployment Safety Checklist</h4>
            <p className="text-sm text-muted-foreground">
              {getCompletedAcknowledgments().length} of {getRequiredAcknowledgments().length} items acknowledged
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {criticalIssues.length > 0 && (
            <span className="px-2 py-1 bg-error/10 text-error text-xs font-medium rounded-full">
              {criticalIssues.length} Critical
            </span>
          )}
          {warningIssues.length > 0 && (
            <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full">
              {warningIssues.length} Warnings
            </span>
          )}
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${getRequiredAcknowledgments().length > 0 
                  ? (getCompletedAcknowledgments().length / getRequiredAcknowledgments().length) * 100 
                  : 100}%` 
              }}
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {checklistItems.map((item) => {
              const icon = getIconForType(item.type);
              return (
                <div 
                  key={item.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(item.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon name={icon.name} size={18} className={icon.color} />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-foreground mb-1">{item.title}</h5>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    
                    {item.requiresAck && (
                      <Checkbox
                        checked={userAcknowledgments[item.id] || false}
                        onChange={(e) => handleAcknowledgment(item.id, e.target.checked)}
                        className="ml-3"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Checklist Status: {isChecklistComplete() ? 'Complete' : 'Incomplete'}
              </div>
              <div className="flex items-center space-x-2">
                {isChecklistComplete() ? (
                  <div className="flex items-center space-x-2 text-success">
                    <Icon name="CheckCircle" size={16} />
                    <span className="text-sm font-medium">Ready for Deployment</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-warning">
                    <Icon name="AlertTriangle" size={16} />
                    <span className="text-sm font-medium">
                      {getRequiredAcknowledgments().length - getCompletedAcknowledgments().length} items remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyChecklist;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const WhatIfControls = ({ 
  spotPrice, 
  setSpotPrice, 
  ivAdjustment, 
  setIvAdjustment, 
  timeToExpiry, 
  setTimeToExpiry,
  onReset 
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');

  const saveCurrentScenario = () => {
    if (!scenarioName.trim()) return;
    
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      spotPrice,
      ivAdjustment,
      timeToExpiry,
      timestamp: new Date().toLocaleTimeString(),
      pnl: calculateMockPnL(spotPrice, ivAdjustment, timeToExpiry)
    };
    
    setScenarios([...scenarios, newScenario]);
    setScenarioName('');
  };

  const loadScenario = (scenario) => {
    setSpotPrice(scenario.spotPrice);
    setIvAdjustment(scenario.ivAdjustment);
    setTimeToExpiry(scenario.timeToExpiry);
  };

  const deleteScenario = (scenarioId) => {
    setScenarios(scenarios.filter(s => s.id !== scenarioId));
  };

  const calculateMockPnL = (spot, iv, time) => {
    // Mock P&L calculation
    const baseSpot = 18500;
    const spotDiff = spot - baseSpot;
    let pnl = 12450; // Base P&L
    
    // Spot impact
    if (spot >= 18200 && spot <= 18800) {
      pnl += 15000 * (1 - Math.abs(spot - 18500) / 300) - 12450;
    } else {
      pnl = -35000 * Math.min(1, Math.abs(spotDiff) / 500);
    }
    
    // IV impact
    pnl += iv * 100;
    
    // Time decay
    pnl -= 245 * (30 - time);
    
    return Math.round(pnl);
  };

  const quickScenarios = [
    {
      name: 'Bull Case',
      spotPrice: 19000,
      ivAdjustment: -20,
      timeToExpiry: 15,
      description: 'Strong upward movement with IV crush'
    },
    {
      name: 'Bear Case',
      spotPrice: 18000,
      ivAdjustment: 30,
      timeToExpiry: 15,
      description: 'Downward movement with IV spike'
    },
    {
      name: 'Sideways',
      spotPrice: 18500,
      ivAdjustment: -10,
      timeToExpiry: 7,
      description: 'Range-bound with time decay'
    },
    {
      name: 'Volatility Spike',
      spotPrice: 18500,
      ivAdjustment: 50,
      timeToExpiry: 20,
      description: 'High volatility environment'
    }
  ];

  const applyQuickScenario = (scenario) => {
    setSpotPrice(scenario.spotPrice);
    setIvAdjustment(scenario.ivAdjustment);
    setTimeToExpiry(scenario.timeToExpiry);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Sliders" size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">What-If Controls</h3>
            <p className="text-sm text-muted-foreground">Real-time scenario analysis</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          iconName="RotateCcw"
          iconPosition="left"
        >
          Reset All
        </Button>
      </div>

      {/* Current Scenario Summary */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground">Current Scenario</h4>
          <div className="text-sm text-muted-foreground">
            Updated {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Spot Price</div>
            <div className="text-lg font-semibold text-primary">₹{spotPrice.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted-foreground">
              {((spotPrice - 18500) / 18500 * 100).toFixed(1)}% from current
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">IV Adjustment</div>
            <div className={`text-lg font-semibold ${ivAdjustment >= 0 ? 'text-warning' : 'text-success'}`}>
              {ivAdjustment >= 0 ? '+' : ''}{ivAdjustment}%
            </div>
            <div className="text-xs text-muted-foreground">
              New IV: {(18.5 + (18.5 * ivAdjustment / 100)).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Time to Expiry</div>
            <div className="text-lg font-semibold text-secondary">{timeToExpiry}</div>
            <div className="text-xs text-muted-foreground">days remaining</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Estimated P&L:</span>
            <span className={`text-lg font-bold ${calculateMockPnL(spotPrice, ivAdjustment, timeToExpiry) >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{calculateMockPnL(spotPrice, ivAdjustment, timeToExpiry).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Scenarios */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3">Quick Scenarios</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickScenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => applyQuickScenario(scenario)}
              className="p-3 text-left border border-border rounded-lg hover:border-primary/50 hover:bg-muted transition-micro"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{scenario.name}</span>
                <Icon name="Play" size={14} className="text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mb-2">{scenario.description}</div>
              <div className="flex items-center space-x-4 text-xs">
                <span>₹{scenario.spotPrice.toLocaleString('en-IN')}</span>
                <span className={scenario.ivAdjustment >= 0 ? 'text-warning' : 'text-success'}>
                  {scenario.ivAdjustment >= 0 ? '+' : ''}{scenario.ivAdjustment}% IV
                </span>
                <span>{scenario.timeToExpiry}d</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save Scenario */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3">Save Current Scenario</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter scenario name"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={saveCurrentScenario}
            disabled={!scenarioName.trim()}
            iconName="Save"
            iconPosition="left"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-3">Saved Scenarios ({scenarios.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{scenario.name}</span>
                    <span className="text-xs text-muted-foreground">{scenario.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>₹{scenario.spotPrice.toLocaleString('en-IN')}</span>
                    <span className={scenario.ivAdjustment >= 0 ? 'text-warning' : 'text-success'}>
                      {scenario.ivAdjustment >= 0 ? '+' : ''}{scenario.ivAdjustment}% IV
                    </span>
                    <span>{scenario.timeToExpiry}d</span>
                    <span className={`font-medium ${scenario.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{scenario.pnl.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadScenario(scenario)}
                    iconName="Play"
                    className="text-xs"
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteScenario(scenario.id)}
                    iconName="Trash2"
                    className="text-xs text-destructive hover:text-destructive"
                  >
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Mode */}
      {scenarios.length >= 2 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">Scenario Comparison</h4>
            <Button
              variant="outline"
              size="sm"
              iconName="BarChart3"
              iconPosition="left"
            >
              Compare All
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Compare multiple scenarios side-by-side to analyze risk-reward profiles
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfControls;
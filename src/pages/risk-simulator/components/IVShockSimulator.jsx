import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const IVShockSimulator = ({ ivAdjustment, setIvAdjustment }) => {
  const [customShock, setCustomShock] = useState('');
  const [shockResults, setShockResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const presetShocks = [
    { label: 'Mild Shock', value: 10, color: 'text-warning', description: '+10% IV increase' },
    { label: 'Moderate Shock', value: 25, color: 'text-warning', description: '+25% IV increase' },
    { label: 'Severe Shock', value: 50, color: 'text-destructive', description: '+50% IV increase' },
    { label: 'Extreme Shock', value: 100, color: 'text-destructive', description: '+100% IV increase' },
    { label: 'IV Crush', value: -30, color: 'text-success', description: '-30% IV decrease' },
    { label: 'Severe Crush', value: -50, color: 'text-success', description: '-50% IV decrease' }
  ];

  const calculateShockImpact = async (shockValue) => {
    setIsCalculating(true);
    
    // Mock calculation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock shock impact calculation
    const baseVega = 150; // Mock vega per 1% IV change
    const totalVega = baseVega * 4; // Assuming 4 legs
    const pnlImpact = totalVega * shockValue;
    
    const results = {
      shockValue,
      pnlImpact,
      newPnL: 12450 + pnlImpact, // Current P&L + impact
      vegaExposure: totalVega,
      riskScore: Math.min(100, Math.abs(pnlImpact / 1000)), // Risk score based on impact
      recommendation: pnlImpact < -10000 ? 'Consider hedging' : pnlImpact > 15000 ? 'Take profits' : 'Monitor closely'
    };
    
    setShockResults(results);
    setIvAdjustment(shockValue);
    setIsCalculating(false);
  };

  const handleCustomShock = () => {
    const value = parseFloat(customShock);
    if (!isNaN(value) && value >= -100 && value <= 200) {
      calculateShockImpact(value);
    }
  };

  const resetShock = () => {
    setIvAdjustment(0);
    setShockResults(null);
    setCustomShock('');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={18} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">IV Shock Simulator</h3>
            <p className="text-sm text-muted-foreground">Test volatility impact scenarios</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetShock}
          iconName="RotateCcw"
          iconPosition="left"
        >
          Reset
        </Button>
      </div>

      {/* Current IV Status */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Current IV Status</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-success">Normal</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Base IV:</span>
            <span className="ml-2 font-medium text-foreground">18.5%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Adjusted IV:</span>
            <span className={`ml-2 font-medium ${ivAdjustment >= 0 ? 'text-warning' : 'text-success'}`}>
              {18.5 + (18.5 * ivAdjustment / 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Preset Shock Scenarios */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3">Preset Scenarios</h4>
        <div className="grid grid-cols-1 gap-2">
          {presetShocks.map((shock) => (
            <button
              key={shock.label}
              onClick={() => calculateShockImpact(shock.value)}
              disabled={isCalculating}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-micro
                ${ivAdjustment === shock.value 
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
                }
                ${isCalculating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  name={shock.value > 0 ? "TrendingUp" : "TrendingDown"} 
                  size={16} 
                  className={shock.color} 
                />
                <div className="text-left">
                  <div className="font-medium text-foreground">{shock.label}</div>
                  <div className="text-xs text-muted-foreground">{shock.description}</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${shock.color}`}>
                {shock.value > 0 ? '+' : ''}{shock.value}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Shock Input */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3">Custom Shock</h4>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Enter IV change %"
            value={customShock}
            onChange={(e) => setCustomShock(e.target.value)}
            className="flex-1"
            description="Range: -100% to +200%"
          />
          <Button
            variant="outline"
            onClick={handleCustomShock}
            disabled={!customShock || isCalculating}
            iconName="Calculator"
          >
            Calculate
          </Button>
        </div>
      </div>

      {/* Shock Results */}
      {(shockResults || isCalculating) && (
        <div className="border-t border-border pt-6">
          <h4 className="font-medium text-foreground mb-4">Impact Analysis</h4>
          
          {isCalculating ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-muted-foreground">Calculating impact...</span>
              </div>
            </div>
          ) : shockResults && (
            <div className="space-y-4">
              {/* P&L Impact */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">P&L Impact</span>
                  <Icon 
                    name={shockResults.pnlImpact >= 0 ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                    className={shockResults.pnlImpact >= 0 ? "text-success" : "text-destructive"} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current P&L:</span>
                    <span className="font-medium text-success">₹12,450</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impact:</span>
                    <span className={`font-medium ${shockResults.pnlImpact >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {shockResults.pnlImpact >= 0 ? '+' : ''}₹{shockResults.pnlImpact.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">New P&L:</span>
                    <span className={`font-medium ${shockResults.newPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{shockResults.newPnL.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Vega Exposure</div>
                  <div className="text-lg font-semibold text-foreground">₹{shockResults.vegaExposure}</div>
                  <div className="text-xs text-muted-foreground">per 1% IV change</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                  <div className={`text-lg font-semibold ${
                    shockResults.riskScore < 30 ? 'text-success' : 
                    shockResults.riskScore < 70 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {shockResults.riskScore.toFixed(0)}/100
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-3 rounded-lg border-l-4 ${
                shockResults.recommendation === 'Consider hedging' ? 'border-destructive bg-destructive/5' :
                shockResults.recommendation === 'Take profits'? 'border-success bg-success/5' : 'border-warning bg-warning/5'
              }`}>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={
                      shockResults.recommendation === 'Consider hedging' ? 'Shield' :
                      shockResults.recommendation === 'Take profits' ? 'TrendingUp' : 'Eye'
                    } 
                    size={16} 
                    className={
                      shockResults.recommendation === 'Consider hedging' ? 'text-destructive' :
                      shockResults.recommendation === 'Take profits' ? 'text-success' : 'text-warning'
                    }
                  />
                  <span className="font-medium text-foreground">Recommendation</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{shockResults.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IVShockSimulator;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const QuickDeployment = ({ onDeploy, strategies }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [quantity, setQuantity] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const strategyOptions = strategies.map(strategy => ({
    value: strategy.id,
    label: strategy.name,
    description: strategy.description
  }));

  const handleDeploy = () => {
    if (!selectedStrategy || !quantity) return;
    
    const deploymentData = {
      strategyId: selectedStrategy,
      quantity: parseInt(quantity),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: new Date().toISOString()
    };
    
    onDeploy(deploymentData);
    
    // Reset form
    setSelectedStrategy('');
    setQuantity('');
    setStopLoss('');
    setTakeProfit('');
    setShowAdvanced(false);
  };

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quick Deployment</h3>
        <Icon name="Zap" size={20} className="text-primary" />
      </div>

      <div className="space-y-4">
        {/* Strategy Selection */}
        <Select
          label="Select Strategy"
          placeholder="Choose a strategy to deploy"
          options={strategyOptions}
          value={selectedStrategy}
          onChange={setSelectedStrategy}
          searchable
        />

        {/* Strategy Preview */}
        {selectedStrategyData && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {selectedStrategyData.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedStrategyData.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedStrategyData.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Est. Margin: </span>
                <span className="font-medium">₹{selectedStrategyData.estimatedMargin?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Score: </span>
                <span className={`font-medium ${
                  selectedStrategyData.riskScore >= 80 ? 'text-error' :
                  selectedStrategyData.riskScore >= 60 ? 'text-warning' : 'text-success'
                }`}>
                  {selectedStrategyData.riskScore}/100
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          placeholder="Enter lot size"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-micro"
        >
          <Icon name={showAdvanced ? 'ChevronUp' : 'ChevronDown'} size={16} />
          <span>Advanced Options</span>
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-3 border-t border-border pt-3">
            <Input
              label="Stop Loss (₹)"
              type="number"
              placeholder="Optional stop loss amount"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              min="0"
              step="0.01"
            />
            
            <Input
              label="Take Profit (₹)"
              type="number"
              placeholder="Optional take profit amount"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        )}

        {/* Risk Warning */}
        {selectedStrategyData && selectedStrategyData.riskScore >= 70 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">High Risk Strategy</p>
              <p className="text-xs text-muted-foreground">
                This strategy has a risk score of {selectedStrategyData.riskScore}/100. 
                Consider setting stop loss limits.
              </p>
            </div>
          </div>
        )}

        {/* Deploy Button */}
        <Button
          variant="default"
          fullWidth
          onClick={handleDeploy}
          disabled={!selectedStrategy || !quantity}
          iconName="Play"
          iconPosition="left"
          iconSize={16}
        >
          Deploy Strategy
        </Button>

        {/* Quick Stats */}
        <div className="border-t border-border pt-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-foreground">12</div>
              <div className="text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="font-bold text-primary">8</div>
              <div className="text-muted-foreground">Deployed</div>
            </div>
            <div>
              <div className="font-bold text-success">4</div>
              <div className="text-muted-foreground">Profitable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickDeployment;
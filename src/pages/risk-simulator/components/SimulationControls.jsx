import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SimulationControls = ({ 
  spotPrice, 
  setSpotPrice, 
  ivAdjustment, 
  setIvAdjustment, 
  timeToExpiry, 
  setTimeToExpiry,
  onRunSimulation,
  isSimulating 
}) => {
  const [customSpot, setCustomSpot] = useState(spotPrice.toString());
  const [customIV, setCustomIV] = useState(ivAdjustment.toString());

  const timeOptions = [
    { value: '1', label: '1 Day' },
    { value: '7', label: '1 Week' },
    { value: '15', label: '2 Weeks' },
    { value: '30', label: '1 Month' },
    { value: '45', label: '1.5 Months' },
    { value: '60', label: '2 Months' }
  ];

  const handleSpotChange = (e) => {
    const value = e.target.value;
    setCustomSpot(value);
    if (value && !isNaN(value)) {
      setSpotPrice(parseFloat(value));
    }
  };

  const handleIVChange = (e) => {
    const value = e.target.value;
    setCustomIV(value);
    if (value && !isNaN(value)) {
      setIvAdjustment(parseFloat(value));
    }
  };

  const quickSpotAdjustments = [
    { label: '-5%', value: -5 },
    { label: '-2%', value: -2 },
    { label: 'Current', value: 0 },
    { label: '+2%', value: 2 },
    { label: '+5%', value: 5 }
  ];

  const quickIVAdjustments = [
    { label: '-50%', value: -50 },
    { label: '-25%', value: -25 },
    { label: 'Current', value: 0 },
    { label: '+25%', value: 25 },
    { label: '+50%', value: 50 }
  ];

  const applyQuickSpotAdjustment = (percentage) => {
    const baseSpot = 18500; // Mock current spot
    const newSpot = baseSpot * (1 + percentage / 100);
    setSpotPrice(newSpot);
    setCustomSpot(newSpot.toFixed(2));
  };

  const applyQuickIVAdjustment = (percentage) => {
    setIvAdjustment(percentage);
    setCustomIV(percentage.toString());
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={18} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Simulation Controls</h3>
            <p className="text-sm text-muted-foreground">Adjust parameters to test strategy performance</p>
          </div>
        </div>
        
        <Button
          variant="default"
          onClick={onRunSimulation}
          loading={isSimulating}
          iconName="Play"
          iconPosition="left"
          className="min-w-[140px]"
        >
          {isSimulating ? 'Simulating...' : 'Run Simulation'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spot Price Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <h4 className="font-medium text-foreground">Spot Price</h4>
          </div>
          
          <Input
            label="Custom Spot Price"
            type="number"
            value={customSpot}
            onChange={handleSpotChange}
            placeholder="18500.00"
            description="Enter target spot price for simulation"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quick Adjustments</label>
            <div className="grid grid-cols-5 gap-1">
              {quickSpotAdjustments.map((adj) => (
                <Button
                  key={adj.label}
                  variant={adj.value === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyQuickSpotAdjustment(adj.value)}
                  className="text-xs"
                >
                  {adj.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Spot:</span>
              <span className="font-medium text-foreground">₹18,500.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Simulation Spot:</span>
              <span className="font-medium text-primary">₹{spotPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* IV Adjustment Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={16} className="text-warning" />
            <h4 className="font-medium text-foreground">IV Adjustment</h4>
          </div>
          
          <Input
            label="IV Change (%)"
            type="number"
            value={customIV}
            onChange={handleIVChange}
            placeholder="0"
            description="Percentage change in implied volatility"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">IV Shock Scenarios</label>
            <div className="grid grid-cols-5 gap-1">
              {quickIVAdjustments.map((adj) => (
                <Button
                  key={adj.label}
                  variant={adj.value === 0 ? "default" : adj.value < 0 ? "destructive" : "success"}
                  size="sm"
                  onClick={() => applyQuickIVAdjustment(adj.value)}
                  className="text-xs"
                >
                  {adj.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current IV:</span>
              <span className="font-medium text-foreground">18.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Adjusted IV:</span>
              <span className={`font-medium ${ivAdjustment >= 0 ? 'text-success' : 'text-destructive'}`}>
                {ivAdjustment >= 0 ? '+' : ''}{ivAdjustment}%
              </span>
            </div>
          </div>
        </div>

        {/* Time to Expiry Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-secondary" />
            <h4 className="font-medium text-foreground">Time Analysis</h4>
          </div>
          
          <Select
            label="Time to Expiry"
            options={timeOptions}
            value={timeToExpiry.toString()}
            onChange={(value) => setTimeToExpiry(parseInt(value))}
            description="Days until option expiration"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Theta Decay Impact</label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Theta:</span>
                <span className="font-medium text-destructive">-₹245</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly Decay:</span>
                <span className="font-medium text-destructive">-₹1,715</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Decay:</span>
                <span className="font-medium text-destructive">-₹{(245 * timeToExpiry).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{timeToExpiry}</div>
              <div className="text-sm text-muted-foreground">Days to Expiry</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
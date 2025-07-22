import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import Icon from './AppIcon';
import Button from './ui/Button';
import strategyService from '../utils/strategyService';

const PayoffGraphPopup = ({ strategy, isOpen, onClose, onWhatIfScenario }) => {
  const [payoffData, setPayoffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState('payoff'); // 'payoff' or 'pnl'
  const [showKeyLevels, setShowKeyLevels] = useState(true);
  const [spotPrice, setSpotPrice] = useState(0);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [scenarioInputs, setScenarioInputs] = useState({
    spotChange: 0,
    ivChange: 0,
    timeDecay: 0
  });

  useEffect(() => {
    if (isOpen && strategy?.id) {
      loadPayoffData();
    }
  }, [isOpen, strategy?.id]);

  const loadPayoffData = async () => {
    if (!strategy?.id) return;
    
    setLoading(true);
    try {
      const result = await strategyService.getPayoffData(strategy.id);
      if (result?.success) {
        setPayoffData(result.data);
        setSpotPrice(result.data.keyLevels.currentSpot);
      }
    } catch (error) {
      console.log('Error loading payoff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIfChange = (field, value) => {
    setScenarioInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const applyWhatIfScenario = () => {
    if (!payoffData || !onWhatIfScenario) return;
    
    onWhatIfScenario({
      strategyId: strategy.id,
      scenario: {
        name: 'What-If Analysis',
        spotChange: scenarioInputs.spotChange,
        ivChange: scenarioInputs.ivChange,
        timeDecay: scenarioInputs.timeDecay
      }
    });
  };

  const resetWhatIf = () => {
    setScenarioInputs({ spotChange: 0, ivChange: 0, timeDecay: 0 });
    setSpotPrice(payoffData?.keyLevels?.currentSpot || 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(value));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">Spot: ₹{formatNumber(label)}</p>
          <p className="text-sm text-muted-foreground">
            {selectedView === 'payoff' ? 'Payoff' : 'P&L'}: {formatCurrency(payload[0].value)}
          </p>
          {data.pnl !== undefined && selectedView === 'payoff' && (
            <p className="text-sm text-muted-foreground">
              P&L: {formatCurrency(data.pnl)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getStrikeLines = () => {
    if (!showKeyLevels || !payoffData?.keyLevels?.strikes) return null;
    
    return payoffData.keyLevels.strikes.map((strike, index) => (
      <ReferenceLine
        key={`strike-${index}`}
        x={strike}
        stroke="#6B7280"
        strokeDasharray="3 3"
        label={{ value: `${strike}`, position: 'top' }}
      />
    ));
  };

  const getBreakevenLines = () => {
    if (!showKeyLevels || !payoffData?.keyLevels?.breakevens) return null;
    
    return payoffData.keyLevels.breakevens.map((breakeven, index) => (
      <ReferenceLine
        key={`be-${index}`}
        x={breakeven}
        stroke="#10B981"
        strokeDasharray="5 5"
        label={{ value: `BE: ${Math.round(breakeven)}`, position: 'topRight' }}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Icon name="TrendingUp" size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {payoffData?.strategy?.name || strategy?.name || 'Strategy Payoff'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {payoffData?.strategy?.underlying || strategy?.underlying_symbol} • 
                Current P&L: {formatCurrency(payoffData?.strategy?.currentPnl || strategy?.current_pnl || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWhatIfMode(!whatIfMode)}
              className={whatIfMode ? 'bg-primary text-primary-foreground' : ''}
              title="Toggle What-If Mode"
            >
              <Icon name="Settings" size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Main Chart Area */}
          <div className="flex-1 p-6">
            {/* Chart Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setSelectedView('payoff')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedView === 'payoff' ?'bg-background text-foreground shadow' :'text-muted-foreground'
                    }`}
                  >
                    Payoff
                  </button>
                  <button
                    onClick={() => setSelectedView('pnl')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedView === 'pnl' ?'bg-background text-foreground shadow' :'text-muted-foreground'
                    }`}
                  >
                    P&L
                  </button>
                </div>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showKeyLevels}
                    onChange={(e) => setShowKeyLevels(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Key Levels</span>
                </label>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Current Spot: ₹{formatNumber(spotPrice)}
              </div>
            </div>

            {/* Chart */}
            <div className="h-96 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : payoffData?.payoffPoints ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={payoffData.payoffPoints}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="spotPrice"
                      type="number"
                      scale="linear"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={formatNumber}
                    />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {/* Zero line */}
                    <ReferenceLine y={0} stroke="#64748B" strokeDasharray="2 2" />
                    
                    {/* Current spot price */}
                    <ReferenceLine
                      x={spotPrice}
                      stroke="#F59E0B"
                      strokeWidth={2}
                      label={{ value: "Current", position: 'topLeft' }}
                    />
                    
                    {/* Strike prices */}
                    {getStrikeLines()}
                    
                    {/* Breakeven points */}
                    {getBreakevenLines()}
                    
                    {/* Main payoff/PnL line */}
                    <Line
                      type="monotone"
                      dataKey={selectedView === 'payoff' ? 'payoff' : 'pnl'}
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                      name={selectedView === 'payoff' ? 'Payoff' : 'P&L'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No payoff data available
                </div>
              )}
            </div>

            {/* Key Statistics */}
            {payoffData?.keyLevels && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Max Profit</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(payoffData.keyLevels.maxProfit || 0)}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Max Loss</p>
                  <p className="text-sm font-medium text-red-600">
                    {formatCurrency(payoffData.keyLevels.maxLoss || 0)}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Breakevens</p>
                  <p className="text-sm font-medium">
                    {payoffData.keyLevels.breakevens?.length > 0
                      ? payoffData.keyLevels.breakevens.map(be => Math.round(be)).join(', ')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Days to Expiry</p>
                  <p className="text-sm font-medium">
                    {payoffData.expiryDate
                      ? Math.max(0, Math.ceil((new Date(payoffData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* What-If Sidebar */}
          {whatIfMode && (
            <div className="w-full lg:w-80 border-l border-border p-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Icon name="Calculator" size={18} className="mr-2" />
                What-If Analysis
              </h3>

              <div className="space-y-4">
                {/* Spot Price Change */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Spot Price Change (%)
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.spotChange}
                    onChange={(e) => handleWhatIfChange('spotChange', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="0.00"
                    step="0.1"
                    min="-50"
                    max="50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    New Price: ₹{formatNumber(payoffData?.keyLevels?.currentSpot * (1 + scenarioInputs.spotChange / 100) || 0)}
                  </p>
                </div>

                {/* IV Change */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    IV Change (%)
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.ivChange}
                    onChange={(e) => handleWhatIfChange('ivChange', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="0.00"
                    step="0.5"
                    min="-50"
                    max="100"
                  />
                </div>

                {/* Time Decay */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time Decay (Days)
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.timeDecay}
                    onChange={(e) => handleWhatIfChange('timeDecay', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="0"
                    step="1"
                    min="0"
                    max="30"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 pt-4">
                  <Button
                    onClick={applyWhatIfScenario}
                    className="w-full"
                    disabled={!onWhatIfScenario}
                  >
                    Apply Scenario
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetWhatIf}
                    className="w-full"
                  >
                    Reset
                  </Button>
                </div>

                {/* Quick Scenarios */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-2">Quick Scenarios</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScenarioInputs({ spotChange: 5, ivChange: 0, timeDecay: 0 })}
                    >
                      +5% Spot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScenarioInputs({ spotChange: -5, ivChange: 0, timeDecay: 0 })}
                    >
                      -5% Spot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScenarioInputs({ spotChange: 0, ivChange: 20, timeDecay: 0 })}
                    >
                      +20% IV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScenarioInputs({ spotChange: 0, ivChange: 0, timeDecay: 7 })}
                    >
                      7 Days
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoffGraphPopup;
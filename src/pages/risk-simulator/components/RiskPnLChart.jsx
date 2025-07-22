import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RiskPnLChart = ({ spotPrice, ivAdjustment, timeToExpiry }) => {
  const [chartType, setChartType] = useState('pnl'); // 'pnl', 'greeks', 'probability'
  const [showBreakeven, setShowBreakeven] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Generate mock P&L data based on spot price range
  const generatePnLData = useMemo(() => {
    const baseSpot = 18500;
    const data = [];
    const range = 2000; // ±2000 points from current spot
    const step = 50;

    for (let spot = baseSpot - range; spot <= baseSpot + range; spot += step) {
      const spotDiff = spot - baseSpot;
      const spotPercent = (spotDiff / baseSpot) * 100;
      
      // Mock strategy P&L calculation (Iron Condor example)
      let pnl = 0;
      const maxProfit = 15000;
      const maxLoss = -35000;
      
      // Iron Condor profit zone (between strikes)
      if (spot >= 18200 && spot <= 18800) {
        pnl = maxProfit * (1 - Math.abs(spot - 18500) / 300);
      } else if (spot < 18200) {
        pnl = maxLoss * Math.min(1, Math.abs(spot - 18200) / 500);
      } else if (spot > 18800) {
        pnl = maxLoss * Math.min(1, Math.abs(spot - 18800) / 500);
      }

      // Apply IV adjustment impact
      const ivImpact = ivAdjustment * 100; // Mock IV sensitivity
      pnl += ivImpact;

      // Apply time decay
      const thetaDecay = -245 * (30 - timeToExpiry);
      pnl += thetaDecay;

      data.push({
        spot,
        spotPercent: spotPercent.toFixed(1),
        pnl: Math.round(pnl),
        pnlPercent: ((pnl / 50000) * 100).toFixed(1), // Assuming 50k capital
        breakeven: Math.abs(pnl) < 1000,
        delta: Math.sin(spotDiff / 1000) * 0.5,
        gamma: Math.cos(spotDiff / 1000) * 0.02,
        theta: -245 + (spotDiff / 100),
        vega: 150 - Math.abs(spotDiff / 50),
        probability: Math.exp(-Math.pow(spotDiff / 800, 2)) * 100
      });
    }
    return data;
  }, [spotPrice, ivAdjustment, timeToExpiry]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-modal">
          <div className="space-y-2">
            <div className="font-medium text-foreground">Spot: ₹{label}</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">P&L:</span>
                <span className={`font-medium ${data.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{data.pnl.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return:</span>
                <span className={`font-medium ${data.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {data.pnlPercent}%
                </span>
              </div>
              {chartType === 'greeks' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delta:</span>
                    <span className="font-medium">{data.delta.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gamma:</span>
                    <span className="font-medium">{data.gamma.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Theta:</span>
                    <span className="font-medium text-destructive">₹{data.theta.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vega:</span>
                    <span className="font-medium">₹{data.vega.toFixed(0)}</span>
                  </div>
                </>
              )}
              {chartType === 'probability' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Probability:</span>
                  <span className="font-medium">{data.probability.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getChartColor = (value) => {
    if (value >= 0) return '#059669'; // success
    return '#DC2626'; // destructive
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pnl':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generatePnLData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="spot" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeDasharray="2 2" />
              <ReferenceLine x={spotPrice} stroke="var(--color-primary)" strokeWidth={2} />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'greeks':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generatePnLData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="spot" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={spotPrice} stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="delta" stroke="#1E40AF" strokeWidth={2} name="Delta" />
              <Line type="monotone" dataKey="gamma" stroke="#059669" strokeWidth={2} name="Gamma" />
              <Line type="monotone" dataKey="theta" stroke="#DC2626" strokeWidth={2} name="Theta" />
              <Line type="monotone" dataKey="vega" stroke="#F59E0B" strokeWidth={2} name="Vega" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'probability':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generatePnLData}>
              <defs>
                <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="spot" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={spotPrice} stroke="var(--color-primary)" strokeWidth={2} />
              <Area
                type="monotone"
                dataKey="probability"
                stroke="#1E40AF"
                strokeWidth={2}
                fill="url(#probabilityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="BarChart3" size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Risk P&L Analysis</h3>
            <p className="text-sm text-muted-foreground">Interactive strategy performance visualization</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={chartType === 'pnl' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('pnl')}
              className="text-xs"
            >
              P&L
            </Button>
            <Button
              variant={chartType === 'greeks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('greeks')}
              className="text-xs"
            >
              Greeks
            </Button>
            <Button
              variant={chartType === 'probability' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('probability')}
              className="text-xs"
            >
              Probability
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="h-96 mb-4">
        {renderChart()}
      </div>

      {/* Chart Legend and Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Current Position</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spot Price:</span>
              <span className="font-medium text-primary">₹{spotPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current P&L:</span>
              <span className="font-medium text-success">₹12,450</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Risk Metrics</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Profit:</span>
              <span className="font-medium text-success">₹15,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Loss:</span>
              <span className="font-medium text-destructive">₹35,000</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Breakeven Points</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lower BE:</span>
              <span className="font-medium text-foreground">₹18,150</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upper BE:</span>
              <span className="font-medium text-foreground">₹18,850</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPnLChart;
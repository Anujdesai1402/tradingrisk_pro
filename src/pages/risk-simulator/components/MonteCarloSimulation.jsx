import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MonteCarloSimulation = ({ spotPrice, ivAdjustment, timeToExpiry }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulations, setSimulations] = useState(1000);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const runSimulation = async () => {
    setIsRunning(true);
    
    // Mock simulation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock Monte Carlo results
    const outcomes = [];
    const pnlDistribution = [];
    const pathData = [];
    
    for (let i = 0; i < simulations; i++) {
      // Mock random walk for spot price
      const randomWalk = Math.random() * 0.4 - 0.2; // ±20% random movement
      const finalSpot = spotPrice * (1 + randomWalk);
      
      // Mock P&L calculation based on final spot
      const spotDiff = finalSpot - 18500;
      let pnl = 0;
      
      // Iron Condor P&L simulation
      if (finalSpot >= 18200 && finalSpot <= 18800) {
        pnl = 15000 * (1 - Math.abs(finalSpot - 18500) / 300);
      } else if (finalSpot < 18200) {
        pnl = -35000 * Math.min(1, Math.abs(finalSpot - 18200) / 500);
      } else if (finalSpot > 18800) {
        pnl = -35000 * Math.min(1, Math.abs(finalSpot - 18800) / 500);
      }
      
      // Apply IV and time decay effects
      pnl += ivAdjustment * 100;
      pnl -= 245 * (30 - timeToExpiry);
      
      outcomes.push({
        simulation: i + 1,
        finalSpot: Math.round(finalSpot),
        pnl: Math.round(pnl),
        profitable: pnl > 0
      });
    }
    
    // Create P&L distribution buckets
    const buckets = {};
    outcomes.forEach(outcome => {
      const bucket = Math.floor(outcome.pnl / 5000) * 5000;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });
    
    Object.keys(buckets).sort((a, b) => a - b).forEach(bucket => {
      pnlDistribution.push({
        range: `₹${(bucket/1000).toFixed(0)}K`,
        count: buckets[bucket],
        percentage: ((buckets[bucket] / simulations) * 100).toFixed(1)
      });
    });
    
    // Generate sample paths for visualization
    for (let path = 0; path < 10; path++) {
      const pathPoints = [];
      let currentSpot = spotPrice;
      
      for (let day = 0; day <= timeToExpiry; day++) {
        if (day > 0) {
          const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily movement
          currentSpot *= (1 + dailyReturn);
        }
        pathPoints.push({
          day,
          spot: currentSpot,
          path
        });
      }
      pathData.push(...pathPoints);
    }
    
    // Calculate statistics
    const pnls = outcomes.map(o => o.pnl);
    const profitable = outcomes.filter(o => o.profitable).length;
    const avgPnL = pnls.reduce((sum, pnl) => sum + pnl, 0) / simulations;
    const maxPnL = Math.max(...pnls);
    const minPnL = Math.min(...pnls);
    const stdDev = Math.sqrt(pnls.reduce((sum, pnl) => sum + Math.pow(pnl - avgPnL, 2), 0) / simulations);
    
    const simulationResults = {
      outcomes,
      pnlDistribution,
      pathData,
      statistics: {
        totalSimulations: simulations,
        profitableTrades: profitable,
        winRate: ((profitable / simulations) * 100).toFixed(1),
        avgPnL: Math.round(avgPnL),
        maxPnL: Math.round(maxPnL),
        minPnL: Math.round(minPnL),
        stdDev: Math.round(stdDev),
        sharpeRatio: (avgPnL / stdDev).toFixed(2),
        var95: Math.round(pnls.sort((a, b) => a - b)[Math.floor(simulations * 0.05)]),
        var99: Math.round(pnls.sort((a, b) => a - b)[Math.floor(simulations * 0.01)])
      }
    };
    
    setResults(simulationResults);
    setIsRunning(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-modal">
          <div className="font-medium text-foreground">{label}</div>
          <div className="text-sm text-muted-foreground">
            {payload[0].value} outcomes ({payload[0].payload.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="BarChart2" size={18} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Monte Carlo Simulation</h3>
            <p className="text-sm text-muted-foreground">Statistical outcome analysis across random scenarios</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Input
            type="number"
            value={simulations}
            onChange={(e) => setSimulations(parseInt(e.target.value) || 1000)}
            placeholder="1000"
            className="w-24"
            min="100"
            max="10000"
          />
          <Button
            variant="default"
            onClick={runSimulation}
            loading={isRunning}
            iconName="Play"
            iconPosition="left"
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Simulation'}
          </Button>
        </div>
      </div>

      {isRunning && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg font-medium text-foreground">Running Monte Carlo Simulation</div>
            <div className="text-sm text-muted-foreground">Analyzing {simulations.toLocaleString()} random scenarios...</div>
          </div>
        </div>
      )}

      {results && !isRunning && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-success">{results.statistics.winRate}%</div>
              <div className="text-xs text-muted-foreground">{results.statistics.profitableTrades} profitable</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Avg P&L</div>
              <div className={`text-2xl font-bold ${results.statistics.avgPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{results.statistics.avgPnL.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground">Expected outcome</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Max Profit</div>
              <div className="text-2xl font-bold text-success">₹{results.statistics.maxPnL.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted-foreground">Best case</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Max Loss</div>
              <div className="text-2xl font-bold text-destructive">₹{results.statistics.minPnL.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted-foreground">Worst case</div>
            </div>
          </div>

          {/* P&L Distribution Chart */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">P&L Distribution</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                iconName={showDetails ? "ChevronUp" : "ChevronDown"}
                iconPosition="right"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
            
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.pnlDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="range" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="var(--color-primary)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Statistics */}
          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Risk Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Deviation:</span>
                    <span className="font-medium text-foreground">₹{results.statistics.stdDev.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sharpe Ratio:</span>
                    <span className="font-medium text-foreground">{results.statistics.sharpeRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VaR (95%):</span>
                    <span className="font-medium text-destructive">₹{results.statistics.var95.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VaR (99%):</span>
                    <span className="font-medium text-destructive">₹{results.statistics.var99.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Simulation Parameters</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Simulations:</span>
                    <span className="font-medium text-foreground">{results.statistics.totalSimulations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Spot:</span>
                    <span className="font-medium text-foreground">₹{spotPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IV Adjustment:</span>
                    <span className="font-medium text-foreground">{ivAdjustment}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days to Expiry:</span>
                    <span className="font-medium text-foreground">{timeToExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Simulation completed at {new Date().toLocaleTimeString()}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
                iconPosition="left"
              >
                Export Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {!results && !isRunning && (
        <div className="text-center py-12">
          <Icon name="BarChart2" size={48} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium text-foreground mb-2">Ready to Run Simulation</div>
          <div className="text-sm text-muted-foreground mb-4">
            Configure your parameters above and click "Run Simulation" to analyze potential outcomes
          </div>
          <div className="text-xs text-muted-foreground">
            Simulation will test {simulations.toLocaleString()} random market scenarios
          </div>
        </div>
      )}
    </div>
  );
};

export default MonteCarloSimulation;
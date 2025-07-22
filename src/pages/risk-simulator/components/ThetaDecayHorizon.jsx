import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ThetaDecayHorizon = ({ timeToExpiry }) => {
  const [viewMode, setViewMode] = useState('decay'); // 'decay', 'pnl', 'combined'
  const [selectedDay, setSelectedDay] = useState(null);

  // Generate theta decay data
  const generateDecayData = () => {
    const data = [];
    const currentPnL = 12450;
    const dailyTheta = -245;
    
    for (let day = 0; day <= timeToExpiry; day++) {
      const daysRemaining = timeToExpiry - day;
      
      // Theta decay accelerates as expiry approaches
      const thetaMultiplier = daysRemaining <= 7 ? 1.5 : daysRemaining <= 15 ? 1.2 : 1.0;
      const adjustedTheta = dailyTheta * thetaMultiplier;
      
      // Calculate cumulative decay
      const cumulativeDecay = day * dailyTheta;
      const adjustedPnL = currentPnL + cumulativeDecay;
      
      // Calculate time value remaining
      const timeValue = Math.max(0, 8500 * (daysRemaining / timeToExpiry));
      
      data.push({
        day,
        daysRemaining,
        dailyTheta: Math.round(adjustedTheta),
        cumulativeDecay: Math.round(cumulativeDecay),
        adjustedPnL: Math.round(adjustedPnL),
        timeValue: Math.round(timeValue),
        decayRate: ((Math.abs(adjustedTheta) / currentPnL) * 100).toFixed(2)
      });
    }
    
    return data;
  };

  const decayData = generateDecayData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-modal">
          <div className="space-y-2">
            <div className="font-medium text-foreground">Day {label}</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Remaining:</span>
                <span className="font-medium text-foreground">{data.daysRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Theta:</span>
                <span className="font-medium text-destructive">₹{data.dailyTheta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cumulative Decay:</span>
                <span className="font-medium text-destructive">₹{data.cumulativeDecay.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adjusted P&L:</span>
                <span className={`font-medium ${data.adjustedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{data.adjustedPnL.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Value:</span>
                <span className="font-medium text-warning">₹{data.timeValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'decay':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={decayData}>
              <defs>
                <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                label={{ value: 'Days Elapsed', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                label={{ value: 'Cumulative Decay', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeDecay"
                stroke="#DC2626"
                strokeWidth={2}
                fill="url(#decayGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pnl':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={decayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                label={{ value: 'Days Elapsed', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                label={{ value: 'Adjusted P&L', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="adjustedPnL" 
                stroke="#1E40AF" 
                strokeWidth={2}
                dot={{ fill: '#1E40AF', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'combined':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={decayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                label={{ value: 'Days Elapsed', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="adjustedPnL" 
                stroke="#1E40AF" 
                strokeWidth={2}
                name="Adjusted P&L"
              />
              <Line 
                type="monotone" 
                dataKey="timeValue" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Time Value"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const criticalDays = decayData.filter(d => d.daysRemaining <= 7);
  const breakEvenDay = decayData.find(d => d.adjustedPnL <= 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={18} className="text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Theta Decay Horizon</h3>
            <p className="text-sm text-muted-foreground">Time decay impact on strategy P&L</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'decay' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('decay')}
              className="text-xs"
            >
              Decay
            </Button>
            <Button
              variant={viewMode === 'pnl' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('pnl')}
              className="text-xs"
            >
              P&L
            </Button>
            <Button
              variant={viewMode === 'combined' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('combined')}
              className="text-xs"
            >
              Combined
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Daily Theta</div>
          <div className="text-lg font-semibold text-destructive">₹245</div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Weekly Decay</div>
          <div className="text-lg font-semibold text-destructive">₹1,715</div>
          <div className="text-xs text-muted-foreground">7 days</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Total Decay</div>
          <div className="text-lg font-semibold text-destructive">₹{(245 * timeToExpiry).toLocaleString('en-IN')}</div>
          <div className="text-xs text-muted-foreground">{timeToExpiry} days</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Decay Rate</div>
          <div className="text-lg font-semibold text-warning">0.49%</div>
          <div className="text-xs text-muted-foreground">of position</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        {renderChart()}
      </div>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Decay Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium text-foreground">Current Time Value</div>
                <div className="text-sm text-muted-foreground">Remaining premium at risk</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-warning">₹8,500</div>
                <div className="text-xs text-muted-foreground">17% of position</div>
              </div>
            </div>

            {breakEvenDay && (
              <div className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Break-Even Point</div>
                  <div className="text-sm text-muted-foreground">When P&L turns negative</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-destructive">Day {breakEvenDay.day}</div>
                  <div className="text-xs text-muted-foreground">{breakEvenDay.daysRemaining} days remaining</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Critical Period</div>
                <div className="text-sm text-muted-foreground">Accelerated decay zone</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-warning">Last 7 Days</div>
                <div className="text-xs text-muted-foreground">1.5x decay rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Recommendations</h4>
          <div className="space-y-3">
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="font-medium text-foreground">Optimal Exit Window</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Consider closing position 7-10 days before expiry to avoid accelerated decay
              </div>
            </div>

            <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span className="font-medium text-foreground">Monitor Closely</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Daily P&L impact increases significantly in final week
              </div>
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <span className="font-medium text-foreground">Roll Strategy</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Consider rolling to next expiry if still bullish on direction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground">Timeline Scrubber</h4>
          <div className="text-sm text-muted-foreground">
            {selectedDay !== null ? `Day ${selectedDay} selected` : 'Hover over timeline to explore'}
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Today</span>
            <div className="flex-1 h-2 bg-muted rounded-full relative">
              <div 
                className="h-full bg-gradient-to-r from-success via-warning to-destructive rounded-full"
                style={{ width: '100%' }}
              ></div>
              {/* Timeline markers */}
              {[0, Math.floor(timeToExpiry * 0.25), Math.floor(timeToExpiry * 0.5), Math.floor(timeToExpiry * 0.75), timeToExpiry].map((day) => (
                <div
                  key={day}
                  className="absolute top-0 w-0.5 h-2 bg-foreground"
                  style={{ left: `${(day / timeToExpiry) * 100}%` }}
                ></div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Expiry</span>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>₹12,450</span>
            <span>₹{Math.round(12450 - (245 * timeToExpiry * 0.25)).toLocaleString('en-IN')}</span>
            <span>₹{Math.round(12450 - (245 * timeToExpiry * 0.5)).toLocaleString('en-IN')}</span>
            <span>₹{Math.round(12450 - (245 * timeToExpiry * 0.75)).toLocaleString('en-IN')}</span>
            <span>₹{Math.round(12450 - (245 * timeToExpiry)).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThetaDecayHorizon;
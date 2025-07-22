import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TimelineReplay = ({ timelineData }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const maxTime = timelineData.length - 1;
  const currentData = timelineData[currentTime] || {};

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (newTime) => {
    setCurrentTime(Math.max(0, Math.min(maxTime, newTime)));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetricChange = (current, previous) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = current - previous;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  React.useEffect(() => {
    let interval;
    if (isPlaying && currentTime < maxTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxTime) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, maxTime, playbackSpeed]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Timeline Replay</h3>
          <p className="text-sm text-muted-foreground">Historical portfolio risk analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="text-xs border border-border rounded px-2 py-1 bg-background"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeChange(0)}
            iconName="SkipBack"
            disabled={currentTime === 0}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeChange(currentTime - 1)}
            iconName="ChevronLeft"
            disabled={currentTime === 0}
          />
          <Button
            variant="default"
            size="sm"
            onClick={handlePlay}
            iconName={isPlaying ? "Pause" : "Play"}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeChange(currentTime + 1)}
            iconName="ChevronRight"
            disabled={currentTime === maxTime}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeChange(maxTime)}
            iconName="SkipForward"
            disabled={currentTime === maxTime}
          />
        </div>

        {/* Timeline Scrubber */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={maxTime}
            value={currentTime}
            onChange={(e) => handleTimeChange(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{timelineData[0] ? formatTime(timelineData[0].timestamp) : '--:--'}</span>
            <span className="font-medium text-foreground">
              {currentData.timestamp ? formatTime(currentData.timestamp) : '--:--'}
            </span>
            <span>{timelineData[maxTime] ? formatTime(timelineData[maxTime].timestamp) : '--:--'}</span>
          </div>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Portfolio Value', value: currentData.portfolioValue, format: 'currency' },
          { label: 'Risk Score', value: currentData.riskScore, format: 'number' },
          { label: 'Total PnL', value: currentData.totalPnL, format: 'currency' },
          { label: 'Active Strategies', value: currentData.activeStrategies, format: 'number' }
        ].map((metric, index) => {
          const previousData = currentTime > 0 ? timelineData[currentTime - 1] : null;
          const change = getMetricChange(metric.value, previousData?.[metric.label.toLowerCase().replace(' ', '')]);
          
          return (
            <div key={index} className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-lg font-semibold text-foreground">
                {metric.format === 'currency' 
                  ? `₹${(metric.value || 0).toLocaleString('en-IN')}`
                  : (metric.value || 0).toLocaleString('en-IN')
                }
              </p>
              {previousData && (
                <div className={`flex items-center space-x-1 text-xs ${
                  change.isPositive ? 'text-success' : 'text-error'
                }`}>
                  <Icon 
                    name={change.isPositive ? "ArrowUp" : "ArrowDown"} 
                    size={12} 
                  />
                  <span>
                    {metric.format === 'currency' 
                      ? `₹${change.value.toLocaleString('en-IN')}`
                      : change.value.toLocaleString('en-IN')
                    }
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Timeline */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Events at {currentData.timestamp ? formatTime(currentData.timestamp) : '--:--'}</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {(currentData.events || []).map((event, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                event.type === 'alert' ? 'bg-error' :
                event.type === 'warning'? 'bg-warning' : 'bg-primary'
              }`} />
              <div>
                <p className="text-foreground">{event.message}</p>
                <p className="text-xs text-muted-foreground">{event.strategy}</p>
              </div>
            </div>
          ))}
          {(!currentData.events || currentData.events.length === 0) && (
            <p className="text-sm text-muted-foreground italic">No events recorded</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineReplay;
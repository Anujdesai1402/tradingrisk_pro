import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConflictDetector = ({ conflicts }) => {
  const [selectedConflict, setSelectedConflict] = useState(null);

  const getConflictSeverity = (severity) => {
    switch (severity) {
      case 'high':
        return {
          color: 'text-error',
          bg: 'bg-error/10',
          icon: 'AlertTriangle'
        };
      case 'medium':
        return {
          color: 'text-warning',
          bg: 'bg-warning/10',
          icon: 'AlertCircle'
        };
      default:
        return {
          color: 'text-primary',
          bg: 'bg-primary/10',
          icon: 'Info'
        };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Conflict Detector</h3>
          <p className="text-sm text-muted-foreground">Overexposure warnings and optimization opportunities</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">{conflicts.length} conflicts detected</span>
        </div>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict) => {
          const severity = getConflictSeverity(conflict.severity);
          return (
            <div 
              key={conflict.id}
              className={`p-4 rounded-lg border cursor-pointer transition-micro ${
                selectedConflict === conflict.id 
                  ? 'border-primary bg-primary/5' :'border-border hover:border-border/60'
              }`}
              onClick={() => setSelectedConflict(selectedConflict === conflict.id ? null : conflict.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${severity.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={severity.icon} size={16} className={severity.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{conflict.title}</h4>
                    <Icon 
                      name={selectedConflict === conflict.id ? "ChevronUp" : "ChevronDown"} 
                      size={16} 
                      className="text-muted-foreground" 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{conflict.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Affected: {conflict.affectedStrategies.join(', ')}
                    </span>
                    <span className={`text-xs font-medium ${severity.color}`}>
                      {conflict.severity.toUpperCase()} RISK
                    </span>
                  </div>

                  {selectedConflict === conflict.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2">Recommendations</h5>
                          <ul className="space-y-1">
                            {conflict.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                                <Icon name="ArrowRight" size={14} className="mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="default" size="sm">
                            Apply Fix
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {conflicts.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-2">No Conflicts Detected</h4>
          <p className="text-sm text-muted-foreground">Your portfolio strategies are well-balanced</p>
        </div>
      )}
    </div>
  );
};

export default ConflictDetector;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AutoHedger = ({ hedgeRecommendations }) => {
  const [selectedHedge, setSelectedHedge] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getHedgeTypeIcon = (type) => {
    switch (type) {
      case 'put':
        return 'TrendingDown';
      case 'future':
        return 'ArrowUpDown';
      case 'call':
        return 'TrendingUp';
      default:
        return 'Shield';
    }
  };

  const getHedgeTypeColor = (type) => {
    switch (type) {
      case 'put':
        return 'text-error';
      case 'future':
        return 'text-primary';
      case 'call':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleApplyHedge = (hedge) => {
    setSelectedHedge(hedge);
    setShowReviewModal(true);
  };

  const confirmHedge = () => {
    console.log('Applying hedge:', selectedHedge);
    setShowReviewModal(false);
    setSelectedHedge(null);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Auto-Hedger</h3>
            <p className="text-sm text-muted-foreground">Rule-driven hedge recommendations</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">{hedgeRecommendations.length} recommendations</span>
          </div>
        </div>

        <div className="space-y-4">
          {hedgeRecommendations.map((hedge) => (
            <div key={hedge.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-micro">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Icon 
                      name={getHedgeTypeIcon(hedge.type)} 
                      size={16} 
                      className={getHedgeTypeColor(hedge.type)} 
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{hedge.title}</h4>
                    <p className="text-xs text-muted-foreground">{hedge.symbol} • {hedge.expiry}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  hedge.priority === 'high' ?'bg-error/10 text-error' 
                    : hedge.priority === 'medium' ?'bg-warning/10 text-warning' :'bg-primary/10 text-primary'
                }`}>
                  {hedge.priority.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{hedge.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="text-sm font-medium text-foreground">₹{hedge.cost.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk Reduction</p>
                  <p className="text-sm font-medium text-success">-{hedge.riskReduction}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Target" size={12} />
                  <span>Targets: {hedge.targetStrategies.join(', ')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyHedge(hedge)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={14}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hedgeRecommendations.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-success" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-2">No Hedges Needed</h4>
            <p className="text-sm text-muted-foreground">Your portfolio is well-hedged</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-foreground font-medium">Auto-Hedge Settings</p>
              <p className="text-muted-foreground text-xs">Risk threshold: 75% • Max cost: ₹50,000</p>
            </div>
            <Button variant="ghost" size="sm" iconName="Settings" iconPosition="left">
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedHedge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-trading z-modal-backdrop flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-modal max-w-md w-full z-modal">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Review Hedge</h3>
                  <p className="text-sm text-muted-foreground">{selectedHedge.title}</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Symbol</p>
                    <p className="text-sm font-medium text-foreground">{selectedHedge.symbol}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry</p>
                    <p className="text-sm font-medium text-foreground">{selectedHedge.expiry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-medium text-foreground">₹{selectedHedge.cost.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Reduction</p>
                    <p className="text-sm font-medium text-success">-{selectedHedge.riskReduction}%</p>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Impact</p>
                  <p className="text-sm text-foreground">{selectedHedge.description}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  onClick={confirmHedge}
                  className="flex-1"
                  iconName="Check"
                  iconPosition="left"
                >
                  Confirm Hedge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoHedger;
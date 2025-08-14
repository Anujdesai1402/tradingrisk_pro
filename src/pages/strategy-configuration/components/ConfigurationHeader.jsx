import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfigurationHeader = ({ 
  strategy, 
  onSave, 
  onClose, 
  onDeploy, 
  isSaving, 
  isDeploying, 
  canDeploy,
  hasUnsavedChanges 
}) => {
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);

  const handleSave = () => {
    onSave?.();
  };

  const handleDeploy = () => {
    if (canDeploy) {
      setShowDeployConfirm(true);
    }
  };

  const confirmDeploy = () => {
    onDeploy?.();
    setShowDeployConfirm(false);
  };

  const mockStrategy = {
    id: "STR_001",
    name: "Iron Condor NIFTY",
    symbol: "NIFTY",
    type: "Iron Condor",
    status: "Draft"
  };

  const data = strategy || mockStrategy;

  return (
    <>
      <div className="fixed top-15 left-0 right-0 bg-card border-b border-border z-[60]">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left Section - Strategy Info */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-muted"
            >
              <Icon name="X" size={20} />
            </Button>
            
            <div className="h-8 w-px bg-border" />
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Settings" size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{data.name}</h2>
                <p className="text-sm text-muted-foreground">{data.type} • {data.symbol}</p>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-warning/10 text-warning rounded-full">
                <Icon name="AlertCircle" size={14} />
                <span className="text-xs font-medium">Unsaved Changes</span>
              </div>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              Last saved: 22-Jul-2024 08:35
            </div>
            
            <div className="h-8 w-px bg-border" />
            
            <Button
              variant="outline"
              onClick={handleSave}
              loading={isSaving}
              iconName="Save"
              iconPosition="left"
              disabled={!hasUnsavedChanges}
            >
              Save Configuration
            </Button>
            
            <Button
              variant="default"
              onClick={handleDeploy}
              loading={isDeploying}
              disabled={!canDeploy}
              iconName="Play"
              iconPosition="left"
            >
              Deploy Strategy
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: '75%' }} />
        </div>
      </div>

      {/* Deploy Confirmation Modal */}
      {showDeployConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-trading z-modal-backdrop flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-modal max-w-md w-full z-modal">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Play" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Deploy Strategy</h3>
                  <p className="text-sm text-muted-foreground">Confirm strategy deployment</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">Strategy Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground">{data.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground">{data.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="text-foreground">{data.symbol}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm font-medium text-success">Pre-deployment checks passed</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Risk controls configured</li>
                    <li>• Safety checklist completed</li>
                    <li>• Margin requirements met</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  onClick={confirmDeploy}
                  className="flex-1"
                  iconName="Play"
                  iconPosition="left"
                >
                  Confirm Deployment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeployConfirm(false)}
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

export default ConfigurationHeader;
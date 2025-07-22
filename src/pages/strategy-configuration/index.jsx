import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import StrategyOverview from './components/StrategyOverview';
import RiskConfiguration from './components/RiskConfiguration';
import SafetyChecklist from './components/SafetyChecklist';
import ConfigurationHeader from './components/ConfigurationHeader';

const StrategyConfiguration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const strategyId = searchParams.get('id');

  const [strategy, setStrategy] = useState(null);
  const [configuration, setConfiguration] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock strategy data
  const mockStrategy = {
    id: strategyId || "STR_001",
    name: "Iron Condor NIFTY",
    symbol: "NIFTY",
    expiry: "28-Dec-2024",
    type: "Iron Condor",
    status: "Draft",
    createdAt: "22-Jul-2024 08:40",
    legs: [
      {
        id: 1,
        type: "Short Call",
        strike: 24500,
        qty: 50,
        premium: 125.50,
        delta: -0.35,
        gamma: 0.008,
        theta: -12.5,
        vega: 18.2,
        iv: 18.5
      },
      {
        id: 2,
        type: "Long Call",
        strike: 24600,
        qty: 50,
        premium: 85.25,
        delta: -0.22,
        gamma: 0.006,
        theta: -8.2,
        vega: 12.8,
        iv: 17.8
      },
      {
        id: 3,
        type: "Short Put",
        strike: 24200,
        qty: 50,
        premium: 118.75,
        delta: 0.28,
        gamma: 0.007,
        theta: -11.8,
        vega: 16.5,
        iv: 19.2
      },
      {
        id: 4,
        type: "Long Put",
        strike: 24100,
        qty: 50,
        premium: 78.50,
        delta: 0.18,
        gamma: 0.005,
        theta: -7.5,
        vega: 11.2,
        iv: 18.8
      }
    ],
    marketData: {
      spot: 24350,
      iv: 18.8,
      timeToExpiry: 158,
      interestRate: 6.5
    },
    calculations: {
      netPremium: 3200,
      maxProfit: 3200,
      maxLoss: 6800,
      breakevens: [24168, 24532],
      marginRequired: 45000,
      riskReward: 2.125
    }
  };

  useEffect(() => {
    // Simulate loading strategy data
    const loadStrategy = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStrategy(mockStrategy);
      setIsLoading(false);
    };

    loadStrategy();
  }, [strategyId]);

  const handleConfigurationChange = (newConfig) => {
    setConfiguration(newConfig);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Configuration saved:', configuration);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!checklistComplete) {
      alert('Please complete the safety checklist before deployment');
      return;
    }

    setIsDeploying(true);
    try {
      // Simulate deployment API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Strategy deployed:', { strategy, configuration });
      
      // Navigate to trading dashboard after successful deployment
      navigate('/trading-dashboard?deployed=' + strategy.id);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    navigate('/trading-dashboard');
  };

  const handleChecklistComplete = (isComplete) => {
    setChecklistComplete(isComplete);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-15 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading strategy configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ConfigurationHeader
        strategy={strategy}
        onSave={handleSave}
        onClose={handleClose}
        onDeploy={handleDeploy}
        isSaving={isSaving}
        isDeploying={isDeploying}
        canDeploy={checklistComplete && !hasUnsavedChanges}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      
      <main className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Strategy Overview */}
            <div className="space-y-6">
              <div className="sticky top-36">
                <StrategyOverview strategy={strategy} />
              </div>
            </div>

            {/* Right Column - Risk Configuration */}
            <div className="space-y-6">
              <RiskConfiguration onConfigChange={handleConfigurationChange} />
              
              <SafetyChecklist
                config={configuration}
                strategy={strategy}
                onChecklistComplete={handleChecklistComplete}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Save/Deploy Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleDeploy}
            disabled={!checklistComplete || hasUnsavedChanges || isDeploying}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyConfiguration;
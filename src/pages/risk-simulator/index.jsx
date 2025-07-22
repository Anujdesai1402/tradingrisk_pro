import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SimulationControls from './components/SimulationControls';
import RiskPnLChart from './components/RiskPnLChart';
import IVShockSimulator from './components/IVShockSimulator';
import MonteCarloSimulation from './components/MonteCarloSimulation';
import ThetaDecayHorizon from './components/ThetaDecayHorizon';
import WhatIfControls from './components/WhatIfControls';

const RiskSimulator = () => {
  const [spotPrice, setSpotPrice] = useState(18500);
  const [ivAdjustment, setIvAdjustment] = useState(0);
  const [timeToExpiry, setTimeToExpiry] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'montecarlo', 'theta', 'whatif'

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    // Mock simulation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSimulating(false);
  };

  const handleReset = () => {
    setSpotPrice(18500);
    setIvAdjustment(0);
    setTimeToExpiry(30);
  };

  const tabs = [
    {
      id: 'analysis',
      label: 'Risk Analysis',
      icon: 'BarChart3',
      description: 'Interactive P&L and Greeks visualization'
    },
    {
      id: 'montecarlo',
      label: 'Monte Carlo',
      icon: 'BarChart2',
      description: 'Statistical outcome simulation'
    },
    {
      id: 'theta',
      label: 'Theta Decay',
      icon: 'Clock',
      description: 'Time decay impact analysis'
    },
    {
      id: 'whatif',
      label: 'What-If',
      icon: 'Sliders',
      description: 'Scenario testing controls'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-15">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Home" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Trading</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">Risk Simulator</span>
            </div>
            <div className="mt-2">
              <h1 className="text-2xl font-semibold text-foreground">Risk Simulator</h1>
              <p className="text-muted-foreground">Interactive scenario analysis and strategy performance testing</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Simulation Controls */}
          <div className="mb-6">
            <SimulationControls
              spotPrice={spotPrice}
              setSpotPrice={setSpotPrice}
              ivAdjustment={ivAdjustment}
              setIvAdjustment={setIvAdjustment}
              timeToExpiry={timeToExpiry}
              setTimeToExpiry={setTimeToExpiry}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-micro
                      ${activeTab === tab.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                      }
                    `}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Description */}
            <div className="py-3">
              <p className="text-sm text-muted-foreground">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'analysis' && (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Chart */}
                <div className="xl:col-span-3">
                  <RiskPnLChart
                    spotPrice={spotPrice}
                    ivAdjustment={ivAdjustment}
                    timeToExpiry={timeToExpiry}
                  />
                </div>
                
                {/* IV Shock Simulator */}
                <div className="xl:col-span-1">
                  <IVShockSimulator
                    ivAdjustment={ivAdjustment}
                    setIvAdjustment={setIvAdjustment}
                  />
                </div>
              </div>
            )}

            {activeTab === 'montecarlo' && (
              <MonteCarloSimulation
                spotPrice={spotPrice}
                ivAdjustment={ivAdjustment}
                timeToExpiry={timeToExpiry}
              />
            )}

            {activeTab === 'theta' && (
              <ThetaDecayHorizon
                timeToExpiry={timeToExpiry}
              />
            )}

            {activeTab === 'whatif' && (
              <WhatIfControls
                spotPrice={spotPrice}
                setSpotPrice={setSpotPrice}
                ivAdjustment={ivAdjustment}
                setIvAdjustment={setIvAdjustment}
                timeToExpiry={timeToExpiry}
                setTimeToExpiry={setTimeToExpiry}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Export simulation results or save current scenario for future reference
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="Save"
                  iconPosition="left"
                >
                  Save Scenario
                </Button>
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Results
                </Button>
                <Button
                  variant="outline"
                  iconName="Share"
                  iconPosition="left"
                >
                  Share Analysis
                </Button>
              </div>
            </div>
          </div>

          {/* Strategy Context */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Info" size={16} className="text-primary" />
              <div className="text-sm">
                <span className="font-medium text-foreground">Current Strategy:</span>
                <span className="text-muted-foreground ml-2">
                  Iron Condor (NIFTY 18200-18300-18700-18800) • Expiry: {new Date(Date.now() + timeToExpiry * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskSimulator;
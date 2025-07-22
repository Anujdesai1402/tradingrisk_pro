import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import StrategySelector from './components/StrategySelector';
import RiskTable from './components/RiskTable';
import LiveRiskMetrics from './components/LiveRiskMetrics';

const RiskMonitor = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    symbol: 'all',
    expiry: 'all'
  });

  // Mock strategies data
  const strategies = [
    {
      id: 'STR001',
      name: 'Iron Condor NIFTY',
      symbol: 'NIFTY',
      expiry: '2025-01-30',
      status: 'active',
      riskScore: 45,
      mtm: 15750,
      totalMTM: 15750,
      totalMargin: 125000,
      totalCapital: 500000,
      totalDelta: -12.5,
      totalVega: 45.2,
      totalTheta: -8.7,
      totalGamma: 2.1,
      currentDrawdown: 2.3,
      maxDrawdownToday: 4.1,
      drawdownLimit: 15.0,
      legs: [
        {
          id: 'LEG001',
          instrument: 'NIFTY 25JAN25 23000 CE',
          type: 'SELL',
          strike: 23000,
          quantity: 50,
          delta: -8.5,
          vega: 12.3,
          theta: -2.1,
          gamma: 0.8,
          margin: 45000,
          mtm: 8750,
          status: 'safe',
          slType: 'percentage',
          slValue: 20,
          tpType: 'percentage',
          tpValue: 50,
          trailingSL: true,
          currentPrice: 175,
          slPrice: 210,
          warnings: []
        },
        {
          id: 'LEG002',
          instrument: 'NIFTY 25JAN25 22800 PE',
          type: 'SELL',
          strike: 22800,
          quantity: 50,
          delta: 4.2,
          vega: 15.8,
          theta: -3.2,
          gamma: 0.6,
          margin: 42000,
          mtm: 7000,
          status: 'warning',
          slType: 'fixed',
          slValue: 15000,
          tpType: 'percentage',
          tpValue: 40,
          trailingSL: false,
          currentPrice: 140,
          slPrice: 165,
          warnings: [
            { type: 'warning', message: 'SL proximity within 15%' }
          ]
        },
        {
          id: 'LEG003',
          instrument: 'NIFTY 25JAN25 23200 CE',
          type: 'BUY',
          strike: 23200,
          quantity: 50,
          delta: -4.1,
          vega: 8.9,
          theta: -1.8,
          gamma: 0.4,
          margin: 20000,
          mtm: -2500,
          status: 'safe',
          slType: 'percentage',
          slValue: 30,
          tpType: 'fixed',
          tpValue: 10000,
          trailingSL: true,
          currentPrice: 50,
          slPrice: 35,
          warnings: []
        },
        {
          id: 'LEG004',
          instrument: 'NIFTY 25JAN25 22600 PE',
          type: 'BUY',
          strike: 22600,
          quantity: 50,
          delta: -4.1,
          vega: 8.2,
          theta: -1.6,
          gamma: 0.3,
          margin: 18000,
          mtm: 2500,
          status: 'safe',
          slType: 'percentage',
          slValue: 25,
          tpType: 'fixed',
          tpValue: 8000,
          trailingSL: false,
          currentPrice: 50,
          slPrice: 37.5,
          warnings: []
        }
      ]
    },
    {
      id: 'STR002',
      name: 'Bull Call Spread BANKNIFTY',
      symbol: 'BANKNIFTY',
      expiry: '2025-02-27',
      status: 'breach',
      riskScore: 85,
      mtm: -25000,
      totalMTM: -25000,
      totalMargin: 85000,
      totalCapital: 300000,
      totalDelta: 15.8,
      totalVega: -12.5,
      totalTheta: -15.2,
      totalGamma: 3.2,
      currentDrawdown: 8.3,
      maxDrawdownToday: 12.1,
      drawdownLimit: 20.0,
      legs: [
        {
          id: 'LEG005',
          instrument: 'BANKNIFTY 27FEB25 48000 CE',
          type: 'BUY',
          strike: 48000,
          quantity: 25,
          delta: 12.5,
          vega: -8.2,
          theta: -8.5,
          gamma: 2.1,
          margin: 45000,
          mtm: -15000,
          status: 'breach',
          slType: 'fixed',
          slValue: 20000,
          tpType: 'fixed',
          tpValue: 30000,
          trailingSL: false,
          currentPrice: 400,
          slPrice: 320,
          warnings: [
            { type: 'error', message: 'SL breached - immediate action required' }
          ]
        },
        {
          id: 'LEG006',
          instrument: 'BANKNIFTY 27FEB25 48500 CE',
          type: 'SELL',
          strike: 48500,
          quantity: 25,
          delta: 3.3,
          vega: -4.3,
          theta: -6.7,
          gamma: 1.1,
          margin: 40000,
          mtm: -10000,
          status: 'warning',
          slType: 'percentage',
          slValue: 40,
          tpType: 'percentage',
          tpValue: 60,
          trailingSL: true,
          currentPrice: 280,
          slPrice: 196,
          warnings: [
            { type: 'warning', message: 'High volatility detected' }
          ]
        }
      ]
    },
    {
      id: 'STR003',
      name: 'Short Straddle SENSEX',
      symbol: 'SENSEX',
      expiry: '2025-01-30',
      status: 'warning',
      riskScore: 68,
      mtm: 5250,
      totalMTM: 5250,
      totalMargin: 95000,
      totalCapital: 400000,
      totalDelta: 0.8,
      totalVega: 25.6,
      totalTheta: -12.8,
      totalGamma: 1.8,
      currentDrawdown: 1.3,
      maxDrawdownToday: 3.8,
      drawdownLimit: 12.0,
      legs: [
        {
          id: 'LEG007',
          instrument: 'SENSEX 30JAN25 72000 CE',
          type: 'SELL',
          strike: 72000,
          quantity: 10,
          delta: 0.4,
          vega: 12.8,
          theta: -6.4,
          gamma: 0.9,
          margin: 47500,
          mtm: 2625,
          status: 'warning',
          slType: 'percentage',
          slValue: 25,
          tpType: 'percentage',
          tpValue: 50,
          trailingSL: true,
          currentPrice: 525,
          slPrice: 656.25,
          warnings: [
            { type: 'warning', message: 'IV expansion detected' }
          ]
        },
        {
          id: 'LEG008',
          instrument: 'SENSEX 30JAN25 72000 PE',
          type: 'SELL',
          strike: 72000,
          quantity: 10,
          delta: 0.4,
          vega: 12.8,
          theta: -6.4,
          gamma: 0.9,
          margin: 47500,
          mtm: 2625,
          status: 'safe',
          slType: 'percentage',
          slValue: 25,
          tpType: 'percentage',
          tpValue: 50,
          trailingSL: true,
          currentPrice: 525,
          slPrice: 656.25,
          warnings: []
        }
      ]
    },
    {
      id: 'STR004',
      name: 'Protective Put RELIANCE',
      symbol: 'RELIANCE',
      expiry: '2025-03-27',
      status: 'paused',
      riskScore: 25,
      mtm: 3500,
      totalMTM: 3500,
      totalMargin: 65000,
      totalCapital: 250000,
      totalDelta: 8.5,
      totalVega: -5.2,
      totalTheta: -3.8,
      totalGamma: 0.6,
      currentDrawdown: 0.5,
      maxDrawdownToday: 1.2,
      drawdownLimit: 10.0,
      legs: [
        {
          id: 'LEG009',
          instrument: 'RELIANCE 27MAR25 2800 PE',
          type: 'BUY',
          strike: 2800,
          quantity: 100,
          delta: 8.5,
          vega: -5.2,
          theta: -3.8,
          gamma: 0.6,
          margin: 65000,
          mtm: 3500,
          status: 'safe',
          slType: 'fixed',
          slValue: 10000,
          tpType: 'fixed',
          tpValue: 15000,
          trailingSL: false,
          currentPrice: 35,
          slPrice: 25,
          warnings: []
        }
      ]
    }
  ];

  // Set initial selected strategy
  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategy) {
      setSelectedStrategy(strategies[0]);
    }
  }, []);

  const handleStrategySelect = (strategy) => {
    setSelectedStrategy(strategy);
  };

  const handleExport = (format) => {
    if (!selectedStrategy) return;

    const exportData = {
      strategy: selectedStrategy.name,
      symbol: selectedStrategy.symbol,
      expiry: selectedStrategy.expiry,
      exportTime: new Date().toISOString(),
      legs: selectedStrategy.legs.map(leg => ({
        instrument: leg.instrument,
        type: leg.type,
        strike: leg.strike,
        quantity: leg.quantity,
        delta: leg.delta,
        vega: leg.vega,
        theta: leg.theta,
        gamma: leg.gamma,
        margin: leg.margin,
        mtm: leg.mtm,
        status: leg.status
      }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['Instrument', 'Type', 'Strike', 'Quantity', 'Delta', 'Vega', 'Theta', 'Gamma', 'Margin', 'MTM', 'Status'];
      const csvRows = selectedStrategy.legs.map(leg => [
        leg.instrument,
        leg.type,
        leg.strike,
        leg.quantity,
        leg.delta,
        leg.vega,
        leg.theta,
        leg.gamma,
        leg.margin,
        leg.mtm,
        leg.status
      ]);
      
      const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStrategy.name}_risk_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // JSON format
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStrategy.name}_risk_export.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSnapshot = (strategy) => {
    const snapshot = {
      strategyId: strategy.id,
      strategyName: strategy.name,
      timestamp: new Date().toISOString(),
      riskScore: strategy.riskScore,
      totalMTM: strategy.totalMTM,
      totalMargin: strategy.totalMargin,
      greeks: {
        delta: strategy.totalDelta,
        vega: strategy.totalVega,
        theta: strategy.totalTheta,
        gamma: strategy.totalGamma
      },
      legs: strategy.legs.map(leg => ({
        id: leg.id,
        instrument: leg.instrument,
        mtm: leg.mtm,
        delta: leg.delta,
        vega: leg.vega,
        theta: leg.theta,
        gamma: leg.gamma,
        status: leg.status
      }))
    };

    // Save to localStorage for demo purposes
    const existingSnapshots = JSON.parse(localStorage.getItem('riskSnapshots') || '[]');
    existingSnapshots.push(snapshot);
    localStorage.setItem('riskSnapshots', JSON.stringify(existingSnapshots));

    // Show success message (in real app, this would be a toast notification)
    alert(`Snapshot saved for ${strategy.name} at ${new Date().toLocaleTimeString('en-IN')}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-15">
        <div className="h-[calc(100vh-3.75rem)] flex">
          {/* Left Sidebar - Strategy Selector */}
          <div className="w-80 border-r border-border flex-shrink-0">
            <StrategySelector
              strategies={strategies}
              selectedStrategy={selectedStrategy}
              onStrategySelect={handleStrategySelect}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Main Content - Risk Table */}
          <div className="flex-1 min-w-0">
            <RiskTable
              strategy={selectedStrategy}
              onExport={handleExport}
            />
          </div>

          {/* Right Panel - Live Metrics */}
          <div className="w-80 border-l border-border flex-shrink-0">
            <LiveRiskMetrics
              strategy={selectedStrategy}
              onSnapshot={handleSnapshot}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskMonitor;
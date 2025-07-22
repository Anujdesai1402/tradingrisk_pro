import React from 'react';

const BackgroundVisualization = () => {
  // Mock market data for background visualization
  const marketData = [
    { symbol: 'NIFTY', price: '21,456.30', change: '+1.2%', positive: true },
    { symbol: 'BANKNIFTY', price: '46,789.45', change: '-0.8%', positive: false },
    { symbol: 'SENSEX', price: '71,234.56', change: '+0.9%', positive: true },
    { symbol: 'USDINR', price: '83.25', change: '+0.3%', positive: true }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
      
      {/* Market Data Ticker */}
      <div className="absolute top-8 left-8 right-8">
        <div className="flex space-x-8 opacity-20">
          {marketData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-foreground">{item.symbol}</span>
              <span className="text-muted-foreground">₹{item.price}</span>
              <span className={`text-xs ${item.positive ? 'text-success' : 'text-error'}`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Chart Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 800 200" className="text-primary">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d="M0,150 Q100,120 200,130 T400,110 T600,90 T800,100"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0,200 Q100,120 200,130 T400,110 T600,90 T800,100 L800,200 Z"
            fill="url(#chartGradient)"
          />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-16 opacity-5">
        <div className="w-32 h-32 border-2 border-primary rounded-full animate-pulse-slow" />
      </div>
      
      <div className="absolute bottom-1/4 left-16 opacity-5">
        <div className="w-24 h-24 border-2 border-accent rounded-lg rotate-45 animate-pulse-slow" />
      </div>
    </div>
  );
};

export default BackgroundVisualization;
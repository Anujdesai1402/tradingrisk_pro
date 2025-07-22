import React from 'react';
import Icon from '../../../components/AppIcon';

const PlatformLogo = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo Icon */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="TrendingUp" size={32} color="white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Shield" size={12} color="white" />
          </div>
        </div>
      </div>

      {/* Platform Name */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">
          TradingRisk
          <span className="text-primary ml-1">Pro</span>
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Advanced Risk Management Platform
        </p>
      </div>

      {/* Tagline */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          Secure access to professional trading tools with real-time risk monitoring
        </p>
      </div>
    </div>
  );
};

export default PlatformLogo;
import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Encrypted',
      description: '256-bit encryption'
    },
    {
      icon: 'Lock',
      title: 'Secure Login',
      description: '2FA protected'
    },
    {
      icon: 'CheckCircle',
      title: 'SEBI Compliant',
      description: 'Regulated platform'
    },
    {
      icon: 'Server',
      title: 'Data Protected',
      description: 'ISO 27001 certified'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name={feature.icon} size={16} className="text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TradingRisk Pro. All rights reserved. | 
          <span className="ml-1">Your trading data is secure and encrypted.</span>
        </p>
      </div>
    </div>
  );
};

export default SecurityBadges;
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import TwoFactorModal from './components/TwoFactorModal';
import SecurityBadges from './components/SecurityBadges';
import BackgroundVisualization from './components/BackgroundVisualization';
import PlatformLogo from './components/PlatformLogo';

const Login = () => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleTwoFactorRequired = () => {
    setShowTwoFactor(true);
  };

  const handleTwoFactorClose = () => {
    setShowTwoFactor(false);
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Background Visualization */}
      <BackgroundVisualization />

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-modal p-8">
          {/* Platform Logo */}
          <PlatformLogo />

          {/* Login Form */}
          <LoginForm onTwoFactorRequired={handleTwoFactorRequired} />

          {/* Security Badges */}
          <SecurityBadges />
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-medium text-success">Secure Connection Active</span>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal 
        isOpen={showTwoFactor} 
        onClose={handleTwoFactorClose} 
      />
    </div>
  );
};

export default Login;
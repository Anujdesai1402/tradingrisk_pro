import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/trading-dashboard',
      icon: 'BarChart3',
      tooltip: 'Trading command center with real-time portfolio overview'
    },
    {
      label: 'Risk Monitor',
      path: '/risk-monitor',
      icon: 'Shield',
      tooltip: 'Real-time risk analysis and per-leg breakdowns'
    },
    {
      label: 'Analytics',
      path: '/portfolio-risk-aggregator',
      icon: 'TrendingUp',
      tooltip: 'Portfolio-level risk aggregation and correlation analysis'
    },
    {
      label: 'Simulator',
      path: '/risk-simulator',
      icon: 'Calculator',
      tooltip: 'Interactive scenario testing and Monte Carlo analysis'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleEmergencyStop = () => {
    setShowEmergencyConfirm(true);
  };

  const confirmEmergencyStop = () => {
    // Emergency stop logic would be implemented here
    console.log('Emergency stop activated');
    setShowEmergencyConfirm(false);
  };

  const handleLogout = () => {
    navigate('/login');
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-navigation">
        <div className="flex items-center justify-between h-15 px-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={20} color="white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">TradingRisk</span>
                <span className="text-xs text-muted-foreground font-medium">PRO</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-micro
                    ${isActive(item.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                  title={item.tooltip}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Emergency Stop Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmergencyStop}
              className="hidden sm:flex"
              iconName="AlertTriangle"
              iconPosition="left"
              iconSize={16}
            >
              Emergency Stop
            </Button>

            {/* Mobile Emergency Stop */}
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEmergencyStop}
              className="sm:hidden"
            >
              <Icon name="AlertTriangle" size={16} />
            </Button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-micro"
              >
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">John Trader</span>
                  <span className="text-xs text-muted-foreground">Senior Analyst</span>
                </div>
                <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-modal z-dropdown">
                  <div className="p-2">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-micro"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-micro"
                    >
                      <Icon name="HelpCircle" size={16} />
                      <span>Help & Support</span>
                    </button>
                    <div className="border-t border-border my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-micro"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-micro"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-micro
                    ${isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Emergency Stop Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-trading z-modal-backdrop flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-modal max-w-md w-full z-modal">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Emergency Stop</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-sm text-foreground mb-6">
                This will immediately close all open positions and halt all trading activities. 
                Are you sure you want to proceed?
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="destructive"
                  onClick={confirmEmergencyStop}
                  className="flex-1"
                  iconName="AlertTriangle"
                  iconPosition="left"
                >
                  Confirm Stop
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;
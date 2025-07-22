import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const TwoFactorModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Mock OTP for demonstration
  const mockOTP = '123456';

  useEffect(() => {
    if (isOpen && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [isOpen, resendTimer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpCode === mockOTP) {
        // Successful authentication
        navigate('/trading-dashboard');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setResendTimer(30);
    setError('');
    
    // Simulate resend API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message or handle resend logic
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-trading z-modal-backdrop flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal max-w-md w-full z-modal">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Secure your trading account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-micro"
              disabled={isLoading}
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <p className="text-sm text-foreground mb-2">
              We've sent a 6-digit verification code to your registered mobile number.
            </p>
            <p className="text-xs text-muted-foreground">
              Enter the code below to complete your sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={handleOtpChange}
              maxLength={6}
              required
              disabled={isLoading}
              className="text-center text-lg font-mono tracking-widest"
            />

            {/* Demo Credentials Info */}
            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">Demo Mode</p>
                  <p className="text-xs text-muted-foreground">Use code: <span className="font-mono font-medium">123456</span></p>
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              loading={isLoading}
              iconName="Shield"
              iconPosition="left"
              iconSize={16}
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>

            {/* Resend Code */}
            <div className="text-center pt-2">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-primary hover:text-primary/80 transition-micro"
                  disabled={isLoading}
                >
                  Resend verification code
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend code in {resendTimer}s
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;
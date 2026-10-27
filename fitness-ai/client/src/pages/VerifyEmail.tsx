import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/useStore';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Login.css'; // Reuse the login page styles

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  
  const { user, loadUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifying(true);
    try {
      await authAPI.verifyOTP({ email: user?.email, otp });
      toast.success('Email verified successfully!');
      
      // Reload user data to get updated isEmailVerified status
      await loadUser();
      
      // Navigate to onboarding
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed, please try again');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.sendOTP({ email: user?.email });
      toast.success('A new OTP has been sent to your email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="login-split-page">
      {/* Visual left panel */}
      <div className="login-visual-panel">
        <img src="https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=800&h=1200&q=80" alt="Runner at sunrise" className="visual-panel-image" />
        <div className="visual-panel-overlay"></div>
        <div className="visual-panel-content">
          <div className="brand-logo" style={{ color: 'white' }}>
            <div className="logo-glow"><ShieldCheck size={24} /></div>
            <span>Athrix</span>
          </div>
          <div className="visual-panel-quote-box">
            <h2>"Security is the foundation of progress."</h2>
            <p className="quote-author">— Protect your journey</p>
          </div>
        </div>
      </div>

      {/* Form right panel */}
      <div className="login-form-panel">
        <motion.div 
          className="form-panel-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="form-panel-header" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(163, 230, 53, 0.1)', borderRadius: '50%', marginBottom: '16px' }}>
              <Mail size={32} color="var(--primary-color)" />
            </div>
            <h3>Verify Your Email</h3>
            <p style={{ marginTop: '8px' }}>
              We've sent a 6-digit code to <br />
              <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              (Check your backend terminal/logs to see the OTP for development purposes)
            </p>
          </div>

          <form className="auth-form" onSubmit={handleVerify}>
            <div className="input-group">
              <label style={{ textAlign: 'center' }}>Enter Verification Code</label>
              <div className="input-wrapper" style={{ justifyContent: 'center' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25em', paddingLeft: '0' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={verifying} style={{ width: '100%', marginTop: '12px' }}>
              {verifying ? 'Verifying...' : 'Verify Email'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={handleResend}
              disabled={resending}
              className="auth-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={resending ? 'spin' : ''} />
              {resending ? 'Sending...' : "Didn't receive a code? Resend"}
            </button>
            
            <button 
              type="button" 
              onClick={handleLogout}
              className="auth-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              Log out and use a different account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

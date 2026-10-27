import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    }
    setIsLoading(false);
  };

  return (
    <div className="login-split-page">
      {/* Visual left panel */}
      <div className="login-visual-panel">
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&h=1200&q=80" alt="Athlete focus" className="visual-panel-image" />
        <div className="visual-panel-overlay"></div>
        <div className="visual-panel-content">
          <Link to="/" className="brand-logo" style={{ color: 'white' }}>
            <div className="logo-glow"><Activity size={24} /></div>
            <span>Athrix</span>
          </Link>
          <div className="visual-panel-quote-box">
            <h2>"Setbacks are just setups for your next comeback."</h2>
            <p className="quote-author">— Get back on track</p>
          </div>
          <div className="visual-panel-footer">
            <p>&copy; {new Date().getFullYear()} Athrix. Secure account recovery.</p>
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
          <div className="form-panel-header">
            <h3>{sent ? 'Check Your Email' : 'Reset Password'}</h3>
            <p>{sent ? 'We\'ve sent a recovery link to your inbox' : 'Enter your email to regain access'}</p>
          </div>

          {!sent ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%', marginTop: '12px' }}>
                {isLoading ? 'Sending Link...' : 'Send Recovery Link'} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Mail size={32} />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
              </p>
              <button className="btn btn-secondary" onClick={() => setSent(false)} style={{ width: '100%' }}>
                Try another email
              </button>
            </div>
          )}

          <p className="auth-footer" style={{ marginTop: 32 }}>
            Remembered your password? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

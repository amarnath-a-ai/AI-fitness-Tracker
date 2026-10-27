import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { useAuthStore } from '../stores/useStore';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Welcome back to Athrix!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed, check your credentials');
    }
  };

  return (
    <div className="login-split-page">
      {/* Visual left panel */}
      <div className="login-visual-panel">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=1200&q=80" alt="Athlete motivating mood" className="visual-panel-image" />
        <div className="visual-panel-overlay"></div>
        <div className="visual-panel-content">
          <Link to="/" className="brand-logo" style={{ color: 'white' }}>
            <div className="logo-glow"><Activity size={24} /></div>
            <span>Athrix</span>
          </Link>
          <div className="visual-panel-quote-box">
            <h2>"Your body can stand almost anything. It's your mind that you have to convince."</h2>
            <p className="quote-author">— Coach Statement</p>
          </div>
          <div className="visual-panel-footer">
            <p>&copy; {new Date().getFullYear()} Athrix. Track metrics inside the dashboard space.</p>
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
            <h3>Sign In</h3>
            <p>Access your personalized fitness profile and ML coach metrics</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. johndoe123"

                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember this session
              </label>
              <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? 'Connecting...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>or sign in with</span>
          </div>

          <button type="button" className="btn btn-secondary btn-lg google-btn" style={{ width: '100%' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google OAuth
          </button>

          <p className="auth-footer" style={{ marginTop: 24 }}>
            First time? <Link to="/signup" className="auth-link">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

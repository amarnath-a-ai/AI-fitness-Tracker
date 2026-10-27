import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/useStore';
import toast from 'react-hot-toast';
import './Login.css'; // Reuse the premium split layout from Login

export default function Signup() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ username, firstName, lastName, email, password });
      toast.success('Account created! Let\'s set up your profile.');
      navigate('/onboarding');
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && data.errors.length > 0) {
        toast.error(data.errors[0].message);
      } else {
        toast.error(data?.message || 'Registration failed, try again');
      }
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
            <h2>"Strength does not come from physical capacity. It comes from an indomitable will."</h2>
            <p className="quote-author">— Join the Elite</p>
          </div>
          <div className="visual-panel-footer">
            <p>&copy; {new Date().getFullYear()} Athrix. Start your fitness transformation today.</p>
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
            <h3>Create Account</h3>
            <p>Start your fitness transformation today</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>First Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    className="input"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Last Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  className="input"
                  placeholder="johndoe123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Create a secure password"
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

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%', marginTop: '12px' }}>
              {isLoading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 24 }}>
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

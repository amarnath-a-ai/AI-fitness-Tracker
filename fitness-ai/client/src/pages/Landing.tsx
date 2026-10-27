import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Dumbbell, Sparkles, LineChart, ArrowRight, CheckCircle2, Shield, Star, Users, Zap } from 'lucide-react';
import { useAuthStore } from '../stores/useStore';
import './Landing.css';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page-root">
      {/* Navigation */}
      <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-wrapper">
          <div className="brand-logo">
            <div className="logo-glow"><Activity size={24} /></div>
            <span className="logo-title">Athrix</span>
          </div>
          <div className="nav-links-menu" style={{ display: 'none' /* hidden on mobile, handle via media query later */ }}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <div className="nav-cta-buttons">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Log In</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-split-section">
        <div className="hero-left-col">
          <div className="hero-promo-badge">
            <Sparkles size={16} />
            <span>Athrix v2.0 is live! New AI Coach included.</span>
          </div>
          <h1 className="hero-main-title">
            Your personal <br/>
            <span className="gradient-highlight">AI Fitness Coach</span>
          </h1>
          <p className="hero-paragraph">
            Transform your body with intelligent workout generation, real-time posture analysis, and adaptive nutrition plans. 
            Stop guessing and start tracking with precision.
          </p>
          <div className="hero-buttons-row">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              See Features
            </a>
          </div>
          <div className="hero-trust-row">
            <div className="rating-stars" style={{ color: 'var(--warm-500)' }}>
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <span>Trusted by 50,000+ athletes worldwide</span>
          </div>
        </div>
        
        <div className="hero-right-col">
          <div className="hero-mockup-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&h=900&q=80" 
              alt="Athrix App Interface" 
              className="hero-mockup-image"
            />
            <div className="floating-badge badge-1">
              <Flame size={20} /> 540 kcal burned
            </div>
            <div className="floating-badge badge-2">
              <Zap size={20} /> 12 day streak!
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="stats-banner-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h3 className="stat-number">50k+</h3>
            <p className="stat-desc">Active Users</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">2M+</h3>
            <p className="stat-desc">Workouts Logged</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">98%</h3>
            <p className="stat-desc">Goal Success Rate</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">4.9/5</h3>
            <p className="stat-desc">App Store Rating</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-grid-section">
        <div className="section-header-centered">
          <span className="section-pill">Core Features</span>
          <h2 className="section-heading">Everything you need to succeed</h2>
          <p className="section-lead">A comprehensive suite of tools designed to optimize every aspect of your fitness journey.</p>
        </div>
        
        <div className="features-layout-grid">
          {[
            { icon: Sparkles, title: "AI Workout Generation", desc: "Get highly personalized daily workout routines adapting to your progress, equipment, and fatigue levels." },
            { icon: Activity, title: "Nutrition Macro Tracking", desc: "Scan meals, track macros, and get AI-suggested Indian and international diet adjustments in real-time." },
            { icon: LineChart, title: "Deep Analytics", desc: "Visualize your transformation with beautiful, interactive charts mapping weight, body fat, and strength." },
            { icon: Dumbbell, title: "Extensive Exercise Library", desc: "Access 500+ exercises with high-quality demonstration videos and step-by-step form instructions." },
            { icon: CheckCircle2, title: "Smart Goal Setting", desc: "Set dynamic goals for weight loss or muscle gain. Our AI breaks them down into daily achievable milestones." },
            { icon: Shield, title: "Privacy First", desc: "Your health data is encrypted end-to-end. We never share your personal metrics with third parties." }
          ].map((feature, i) => (
            <div key={i} className="feature-modern-card">
              <div className="feature-card-icon" style={{ background: 'rgba(132, 204, 22, 0.1)', color: 'var(--primary-500)' }}>
                <feature.icon size={24} />
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header-centered">
          <span className="section-pill">Simple Pricing</span>
          <h2 className="section-heading">Choose your training tier</h2>
          <p className="section-lead">Start for free, upgrade when you need advanced AI insights.</p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price-tag">Free</div>
            <p className="pricing-desc">Perfect for beginners tracking basic stats.</p>
            <ul className="pricing-features">
              <li><CheckCircle2 size={16} /> Basic workout logging</li>
              <li><CheckCircle2 size={16} /> Manual calorie tracking</li>
              <li><CheckCircle2 size={16} /> Standard exercise library</li>
              <li className="disabled"><CheckCircle2 size={16} /> AI Coach Chatbot</li>
              <li className="disabled"><CheckCircle2 size={16} /> Advanced analytics</li>
            </ul>
            <Link to="/signup" className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>Get Started</Link>
          </div>

          <div className="pricing-card premium">
            <div className="popular-badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price-tag">$9<span>/mo</span></div>
            <p className="pricing-desc">For serious athletes who want AI guidance.</p>
            <ul className="pricing-features">
              <li><CheckCircle2 size={16} /> Everything in Starter</li>
              <li><CheckCircle2 size={16} /> Full AI Coach access</li>
              <li><CheckCircle2 size={16} /> Auto-generated meal plans</li>
              <li><CheckCircle2 size={16} /> Advanced progress charts</li>
              <li><CheckCircle2 size={16} /> Premium workout routines</li>
            </ul>
            <Link to="/signup" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Start 14-Day Free Trial</Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-content">
          <h2>Ready to transform your life?</h2>
          <p>Join thousands of users who have reached their dream physique with Athrix.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-modern">
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="brand-logo" style={{ marginBottom: 16 }}>
              <div className="logo-glow" style={{ width: 28, height: 28 }}><Activity size={16} /></div>
              <span className="logo-title" style={{ fontSize: '1.2rem' }}>Athrix</span>
            </div>
            <p>Athrix leverages artificial intelligence to provide personalized fitness coaching, nutrition tracking, and analytics to help you reach your goals faster.</p>
          </div>
          <div className="footer-links-col">
            <h5>Product</h5>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">AI Coach</a>
            <a href="#">Integrations</a>
          </div>
          <div className="footer-links-col">
            <h5>Company</h5>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <p>&copy; {new Date().getFullYear()} Athrix AI Fitness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Dummy icon component for missing import above
function Flame(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
}

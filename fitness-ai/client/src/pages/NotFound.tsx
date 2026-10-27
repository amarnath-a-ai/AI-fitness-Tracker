import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24, textAlign: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Compass size={80} className="text-primary" style={{ marginBottom: 24, animation: 'spin 12s linear infinite' }} />
        <h1 style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, margin: 0, background: 'linear-gradient(135deg, var(--primary-400), var(--accent-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '16px 0 8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Oops! The page you are looking for does not exist or has been moved. Let's get you back on track.
        </p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Dumbbell, Apple, Bot, TrendingUp, Droplets, Moon, Target,
  User, Settings, Shield, LogOut, ChevronLeft, ChevronRight, Menu, Home
} from 'lucide-react';
import { useSidebarStore, useAuthStore } from '../../stores/useStore';
import './Sidebar.css';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  role?: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Dumbbell, label: 'Workouts', path: '/workout' },
  { icon: Apple, label: 'Nutrition', path: '/nutrition' },
  { icon: Bot, label: 'AI Coach', path: '/ai-coach' },
  { icon: TrendingUp, label: 'Insights', path: '/progress' },
  { icon: Droplets, label: 'Water Log', path: '/water' },
  { icon: Moon, label: 'Sleep Tracker', path: '/sleep' },
  { icon: Target, label: 'My Goals', path: '/goals' },

  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Shield, label: 'Admin', path: '/admin', role: 'admin' },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => !item.role || user?.role === item.role);

  return (
    <>
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Activity size={24} />
            </div>
            {!isCollapsed && (
              <motion.span
                className="logo-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Athrix
              </motion.span>
            )}
          </div>
          <button className="sidebar-toggle desktop-only" onClick={toggleCollapse}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button className="sidebar-toggle mobile-only" onClick={closeMobile}>
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* User Card */}
        {!isCollapsed && user && (
          <div className="sidebar-user-card">
            <div className="user-avatar-circle" style={{ width: 40, height: 40 }}>
              <User size={18} />
            </div>
            <div className="user-card-info">
              <div className="user-card-name">{user.firstName} {user.lastName}</div>
              <div className="user-card-role">{user.role}</div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <div className="nav-item-icon">
                  <item.icon size={20} />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none' }}>
            <div className="nav-item-icon">
              <LogOut size={20} />
            </div>
            {!isCollapsed && (
              <span className="nav-item-label">Logout</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

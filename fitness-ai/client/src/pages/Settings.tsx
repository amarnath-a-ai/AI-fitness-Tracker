import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Bell, Shield, Trash2, LogOut, ChevronRight } from 'lucide-react';
import { useThemeStore, useAuthStore } from '../stores/useStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const { theme, setTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is disabled in demo mode');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings ⚙️</h1>
          <p className="page-subtitle">Customize your Athrix experience</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 660 }}>
        {/* Appearance */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Moon size={20} style={{ color: 'var(--primary-500)' }} /> Appearance
          </h3>
          <div className="flex-between" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dark Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Switch between light and dark theme</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Current: <span style={{ fontWeight: 700, color: 'var(--primary-500)', textTransform: 'capitalize' }}>{theme}</span> Mode
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} style={{ color: 'var(--accent-500)' }} /> Notifications
          </h3>
          {[
            { name: 'Push Notifications', desc: 'Get workout reminders and updates', state: notifications, setter: setNotifications },
            { name: 'Water Reminders', desc: 'Hydration reminders throughout the day', state: waterReminders, setter: setWaterReminders },
            { name: 'Weekly Report', desc: 'Summary of your weekly progress', state: weeklyReport, setter: setWeeklyReport },
          ].map((item, i) => (
            <div key={i} className="flex-between" style={{ padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={item.state} onChange={() => item.setter(!item.state)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>

        {/* Account & Security */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} style={{ color: '#8b5cf6' }} /> Account & Security
          </h3>
          {[
            { name: 'Change Password', desc: 'Update your account password' },
            { name: 'Two-Factor Authentication', desc: 'Add extra security layer' },
            { name: 'Export Data', desc: 'Download your fitness data' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-between"
              style={{
                padding: '14px 0',
                borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => toast.success(`${item.name} — Coming soon!`)}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--danger-500)' }}>Danger Zone</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-danger" onClick={handleLogout} style={{ flex: 1 }}>
              <LogOut size={16} /> Log Out
            </button>
            <button className="btn btn-danger" onClick={handleDeleteAccount} style={{ flex: 1 }}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

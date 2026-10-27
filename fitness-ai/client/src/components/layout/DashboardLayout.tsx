import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useSidebarStore, useAuthStore } from '../../stores/useStore';
import './DashboardLayout.css';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarStore();
  const { toggleMobile } = useSidebarStore();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const marginLeft = isMobile ? 0 : isCollapsed ? 72 : 260;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main
        className="dashboard-main"
        style={{ marginLeft }}
      >
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn-icon btn-ghost mobile-menu" onClick={toggleMobile}>
              <Menu size={22} />
            </button>
            <div className="topbar-search">
              <Search size={18} />
              <input type="text" placeholder="Search anything..." className="input" />
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn-icon btn-ghost notification-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="topbar-user">
              <div className="avatar gradient-accent">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

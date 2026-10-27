import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Apple, Dumbbell, Activity, Search, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await adminAPI.getStats();
      const usersRes = await adminAPI.getUsers();
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch {
      // Mock admin data
      setStats({
        totalUsers: 156,
        totalFoods: 425,
        totalExercises: 310,
        totalWorkouts: 1240,
        newUsersToday: 12,
        usersByRole: [
          { _id: 'admin', count: 2 },
          { _id: 'trainer', count: 8 },
          { _id: 'user', count: 146 }
        ]
      });

      setUsers([
        { _id: '1', firstName: 'System', lastName: 'Admin', email: 'admin@athrix.com', role: 'admin', streak: 45, isEmailVerified: true },
        { _id: '2', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'user', streak: 7, isEmailVerified: true },
        { _id: '3', firstName: 'Sarah', lastName: 'Trainer', email: 'sarah.fit@example.com', role: 'trainer', streak: 30, isEmailVerified: true },
        { _id: '4', firstName: 'Priya', lastName: 'Sharma', email: 'priya@example.com', role: 'user', streak: 3, isEmailVerified: false },
        { _id: '5', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@example.com', role: 'user', streak: 12, isEmailVerified: true },
      ]);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success('Role updated successfully');
      fetchAdminData();
    } catch {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole} (Demo Mode)`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch {
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted! (Demo Mode)');
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 60, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16 }} />)}
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={28} style={{ color: '#8b5cf6' }} /> Admin Panel
          </h1>
          <p className="page-subtitle">Platform overview and user access management</p>
        </div>
      </div>

      {/* Admin stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          { icon: Apple, label: 'Food Database', value: stats?.totalFoods || 0, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { icon: Dumbbell, label: 'Exercises', value: stats?.totalExercises || 0, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { icon: Activity, label: 'New Today', value: stats?.newUsersToday || 0, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
        ].map((item, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ background: item.bg, color: item.color }}>
              <item.icon size={22} />
            </div>
            <div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users management table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex-between" style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>User Accounts</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 'var(--border-radius-full)', width: 250 }}>
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.85rem', flex: 1, outline: 'none', boxShadow: 'none' }}
            />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead style={{ background: 'var(--bg-tertiary)' }}>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Engagement</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar gradient-accent" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.isEmailVerified ? (
                      <span className="badge badge-success"><CheckCircle2 size={12} /> Verified</span>
                    ) : (
                      <span className="badge badge-warm">Pending</span>
                    )}
                  </td>
                  <td>
                    <select 
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700,
                        background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : u.role === 'trainer' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                        color: u.role === 'admin' ? '#8b5cf6' : u.role === 'trainer' ? '#3b82f6' : 'var(--text-secondary)',
                        border: 'none', borderRadius: 8, cursor: 'pointer'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      <span style={{ color: '#f59e0b' }}>🔥 {u.streak}</span> day streak
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button className="btn-icon btn-ghost">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-ghost" onClick={() => handleDeleteUser(u._id)} style={{ color: 'var(--danger-500)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

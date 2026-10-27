import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Trash2, Award } from 'lucide-react';
import { trackerAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function WaterTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [goal] = useState(8); // glasses (2L)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    fetchDailyTotal();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await trackerAPI.getWaterLogs();
      setLogs(res.data.data);
    } catch {
      setLogs([
        { _id: '1', amount: 250, unit: 'ml', date: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { _id: '2', amount: 500, unit: 'ml', date: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
        { _id: '3', amount: 250, unit: 'ml', date: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
      ]);
    }
  };

  const fetchDailyTotal = async () => {
    try {
      const res = await trackerAPI.getDailyWater();
      setDailyTotal(res.data.data.total);
    } catch {
      setDailyTotal(1000);
    }
    setLoading(false);
  };

  const handleAddWater = async (customAmt: number) => {
    try {
      await trackerAPI.addWater({ amount: customAmt, unit: 'ml' });
      toast.success(`💧 Added ${customAmt}ml water!`);
      fetchLogs();
      fetchDailyTotal();
    } catch {
      setDailyTotal(prev => prev + customAmt);
      setLogs(prev => [
        { _id: Math.random().toString(), amount: customAmt, unit: 'ml', date: new Date().toISOString() },
        ...prev
      ]);
      toast.success(`💧 Logged ${customAmt}ml of water!`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await trackerAPI.deleteWaterLog(id);
      toast.success('Water log deleted');
      fetchLogs();
      fetchDailyTotal();
    } catch {
      const deletedItem = logs.find(l => l._id === id);
      if (deletedItem) {
        setDailyTotal(prev => Math.max(0, prev - deletedItem.amount));
      }
      setLogs(prev => prev.filter(l => l._id !== id));
      toast.success('Log deleted!');
    }
  };

  const dailyTotalGlasses = Math.round((dailyTotal / 250) * 10) / 10;
  const progressPercent = Math.min((dailyTotalGlasses / goal) * 100, 100);
  const goalReached = dailyTotalGlasses >= goal;

  // SVG Ring calculation — correct circumference
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.16
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getMilestoneMessage = (): string => {
    if (goalReached) return '🎉 Goal reached! Outstanding!';
    if (progressPercent >= 75) return '💪 Almost there! Keep going!';
    if (progressPercent >= 50) return '🌊 Halfway there!';
    if (progressPercent >= 25) return '💧 Good start!';
    return '🚰 Stay hydrated today!';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Water Tracker 💧</h1>
          <p className="page-subtitle">Track your daily water intake and stay hydrated</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tracker card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 24 }}>
            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r={radius} fill="none"
                stroke={goalReached ? '#10b981' : '#06b6d4'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: goalReached ? '#10b981' : '#06b6d4' }}>{dailyTotalGlasses}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ {goal} glasses</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({dailyTotal} ml)</span>
            </div>
          </div>

          {/* Milestone message */}
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 20, color: goalReached ? '#10b981' : 'var(--text-secondary)', textAlign: 'center' }}>
            {getMilestoneMessage()}
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Add Water</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => handleAddWater(250)}>+ 250ml</button>
            <button className="btn btn-secondary" onClick={() => handleAddWater(500)}>+ 500ml</button>
            <button className="btn btn-primary" onClick={() => handleAddWater(750)}>+ 750ml</button>
          </div>
        </div>

        {/* History card */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Today's Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.map((log) => (
              <div key={log._id} className="flex-between" style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', padding: 8, borderRadius: 8 }}>
                    <Droplets size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.amount} ml</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <button className="btn-icon btn-ghost" onClick={() => handleDelete(log._id)} style={{ color: 'var(--danger-500)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {logs.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>No water logged yet today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
